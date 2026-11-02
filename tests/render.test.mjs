/**
 * DOM smoke tests: bundle each page entry with esbuild, run it inside jsdom and
 * assert that the real rendering logic produces a complete, linkable page.
 *
 * This is a substitute for a browser in environments where Chromium cannot be
 * downloaded; it catches runtime errors, missing images and broken links.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { dishes, featuredIds, categories } from '../src/data/menu.js';
import { galleryPhotos } from '../src/data/photography.js';

const ROOT = process.cwd();
const bundleCache = new Map();

async function bundle(entry) {
  if (bundleCache.has(entry)) return bundleCache.get(entry);
  const result = await build({
    entryPoints: [path.join(ROOT, entry)],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2020',
    logLevel: 'silent',
    define: { 'import.meta.env.BASE_URL': '"./"' },
  });
  const code = result.outputFiles[0].text;
  bundleCache.set(entry, code);
  return code;
}

async function render(page, { search = '' } = {}) {
  const html = await readFile(path.join(ROOT, page), 'utf8');
  const dom = new JSDOM(html, {
    url: `http://localhost/${page}${search}`,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  window.matchMedia = () => ({
    matches: false,
    media: '',
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      this.callback([{ isIntersecting: true, target }], this);
    }
    unobserve() {}
    disconnect() {}
  };
  window.scrollTo = () => {};
  window.eval(await bundle(PAGE_ENTRY[page]));
  await new Promise((resolve) => setTimeout(resolve, 20));
  return { dom, window, document: window.document };
}

const PAGE_ENTRY = {
  'index.html': 'src/js/home.js',
  'menu.html': 'src/js/menu-page.js',
  'dish.html': 'src/js/dish-page.js',
};

function auditImages(document) {
  const images = Array.from(document.querySelectorAll('img'));
  assert.ok(images.length > 0, 'page should contain images');
  for (const image of images) {
    assert.ok(image.getAttribute('alt') !== null, `missing alt: ${image.outerHTML.slice(0, 90)}`);
    assert.ok(image.getAttribute('width'), `missing width: ${image.getAttribute('src')}`);
    assert.ok(image.getAttribute('height'), `missing height: ${image.getAttribute('src')}`);
    assert.match(image.getAttribute('loading') ?? 'eager', /^(lazy|eager)$/);
    assert.ok(!image.src.includes('undefined'), 'image src must not contain undefined');
    if (image.dataset.dishImg === undefined && !image.classList.contains('lightbox')) {
      assert.match(image.getAttribute('src'), /^\.?\/?images\/|^data:image\/svg/, `unexpected src ${image.getAttribute('src')}`);
    }
  }
}

test('homepage renders every section from data', async () => {
  const { document } = await render('index.html');

  assert.equal(document.querySelectorAll('[data-categories] .category-card').length, categories.length);
  assert.equal(document.querySelectorAll('[data-featured] .dish-card').length, featuredIds.length);
  assert.equal(document.querySelectorAll('[data-gallery] figure').length, galleryPhotos.length);
  assert.equal(document.querySelectorAll('.quote-card').length, 3);
  assert.match(document.querySelector('[data-sig-name]').textContent, /Loaded Burger/);
  assert.equal(document.querySelectorAll('[data-sig-dots] button').length, 3);

  // Every category and featured dish links to a real page.
  for (const link of document.querySelectorAll('[data-categories] .category-card')) {
    assert.match(link.getAttribute('href'), /^\.\/menu\.html\?category=[a-z-]+$/);
  }
  for (const link of document.querySelectorAll('[data-featured] h3 a')) {
    assert.match(link.getAttribute('href'), /^\.\/dish\.html\?id=[a-z0-9-]+$/);
  }

  auditImages(document);
});

test('signature carousel advances and updates the dish', async () => {
  const { document, window } = await render('index.html');
  const next = document.querySelector('[data-sig-next]');
  const name = document.querySelector('[data-sig-name]');
  const first = name.textContent;
  next.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 220));
  assert.notEqual(name.textContent, first);
  assert.match(document.querySelector('[data-sig-link]').getAttribute('href'), /dish\.html\?id=/);
});

test('menu page lists all dishes and filters by category + search', async () => {
  const { document, window } = await render('menu.html');

  const cards = () => document.querySelectorAll('[data-menu-grid] .dish-card');
  assert.equal(cards().length, dishes.length);
  assert.equal(document.querySelectorAll('[data-chips] .chip').length, categories.length + 1);
  assert.equal(document.querySelectorAll('[data-chips] .chip[aria-pressed="true"]').length, 1);

  document.querySelector('[data-chip="pizza"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(cards().length, 3);
  assert.match(document.querySelector('[data-count]').textContent, /3 dishes in “Pizza”/);

  const search = document.querySelector('[data-search]');
  search.value = 'margherita';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.equal(cards().length, 1);

  search.value = 'zzzz';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.ok(document.querySelector('.empty-state'), 'empty state should appear');

  document.querySelector('[data-reset]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(cards().length, dishes.length);

  auditImages(document);
});

test('menu deep link opens the right category', async () => {
  const { document } = await render('menu.html', { search: '?category=desserts' });
  const dessertCount = dishes.filter((item) => item.category === 'desserts').length;
  assert.equal(document.querySelectorAll('[data-menu-grid] .dish-card').length, dessertCount);
  assert.equal(document.querySelector('[data-chip="desserts"]').getAttribute('aria-pressed'), 'true');
});

test('dish page renders details, options, quantity and total', async () => {
  const { document, window } = await render('dish.html', { search: '?id=mango-special-loaded-burger' });

  assert.equal(document.querySelector('[data-dish-name]').textContent, 'The Mango Special Loaded Burger');
  assert.match(document.querySelector('[data-dish-price]').textContent, /₹249/);
  assert.equal(document.querySelectorAll('[data-options] fieldset').length, 1);
  assert.match(document.querySelector('[data-dish-ingredients]').textContent, /Brioche bun/);
  assert.match(document.title, /The Mango Special Loaded Burger/);
  assert.equal(document.querySelector('[data-dish-missing]').hidden, true);

  const total = () => document.querySelector('[data-total]').textContent;
  assert.equal(total(), '₹249');

  const meal = document.querySelector('input[name="extras"][value="meal"]');
  meal.checked = true;
  meal.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(total(), '₹348');

  document.querySelector('[data-qty-plus]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.equal(document.querySelector('[data-qty]').value, '2');
  assert.equal(total(), '₹696');

  document.querySelector('[data-qty-minus]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.equal(total(), '₹348');

  const note = document.querySelector('[data-note]');
  note.value = 'No onion please';
  note.dispatchEvent(new window.Event('input', { bubbles: true }));
  const message = document.querySelector('[data-order]').dataset.message;
  assert.match(message, /Make it a meal/);
  assert.match(message, /No onion please/);
  assert.match(message, /₹249/);

  auditImages(document);
});

test('dish page handles an unknown id gracefully', async () => {
  const { document } = await render('dish.html', { search: '?id=not-a-dish' });
  assert.equal(document.querySelector('[data-dish-missing]').hidden, false);
  assert.equal(document.querySelector('[data-dish-layout]').hasAttribute('hidden'), true);
  assert.equal(document.querySelector('[data-related-section]').hidden, true);
});

test('pages declare no duplicate element ids', async () => {
  for (const page of Object.keys(PAGE_ENTRY)) {
    const html = await readFile(path.join(ROOT, page), 'utf8');
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    assert.deepEqual(duplicates, [], `${page} has duplicate ids: ${duplicates.join(', ')}`);
  }
});
