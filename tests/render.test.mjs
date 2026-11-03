/**
 * Route/link/image audit. Bundles the real app entry with esbuild, runs it in
 * jsdom at each route and asserts that every page renders, every internal link
 * resolves to a real page, no empty links exist, and every image file exists.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createApp, internalLinks } from './helpers.mjs';
import { dishes, categories } from '../src/data/menu.js';
import { galleryPhotos, homeGalleryPhotos } from '../src/data/photography.js';

const ROOT = process.cwd();

const PAGES = [
  ['/', 'home', /Good food/],
  ['/menu', 'menu', /Something for/],
  [`/menu/${dishes[0].slug}`, 'dish', new RegExp(dishes[0].name)],
  ['/gallery', 'gallery', /A feast/],
  ['/about', 'about', /More than a cafe/],
  ['/contact', 'contact', /Say hello/],
  ['/privacy', 'privacy', /Privacy Policy/],
  ['/terms', 'terms', /Terms of Use/],
  ['/definitely-not-a-page', 'notFound', /isn’t on the menu/],
  ['/menu/not-a-real-dish', 'notFound', /couldn’t find/],
];

function assertLocalImage(src) {
  assert.match(src, /^\/images\//, `unexpected image src ${src}`);
  const file = path.join(ROOT, 'public', src.replace(/^\//, ''));
  assert.ok(existsSync(file), `missing image file ${src}`);
}

function auditImages(document, requireImages = false) {
  const images = Array.from(document.querySelectorAll('img'));
  if (requireImages) assert.ok(images.length > 0, 'this page should contain images');
  for (const image of images) {
    const src = image.getAttribute('src');
    assert.ok(image.hasAttribute('alt'), `missing alt: ${image.outerHTML.slice(0, 100)}`);
    assert.ok(image.getAttribute('width'), `missing width: ${src}`);
    assert.ok(image.getAttribute('height'), `missing height: ${src}`);
    assert.match(image.getAttribute('loading') ?? 'eager', /^(lazy|eager)$/);
    assert.ok(src && !src.includes('undefined'), 'image src must be present and valid');
    if (src.startsWith('data:')) continue;
    assertLocalImage(src);
    for (const candidate of (image.getAttribute('srcset') || '').split(',')) {
      const file = candidate.trim().split(/\s+/)[0];
      if (file) assertLocalImage(file);
    }
  }
}

function auditLinks(window, document) {
  const anchors = Array.from(document.querySelectorAll('a'));
  const dead = anchors
    .filter((link) => !link.hasAttribute('href') || link.getAttribute('href') === '#' || link.getAttribute('href') === '')
    .map((link) => link.outerHTML.slice(0, 90));
  assert.deepEqual(dead, [], `empty or placeholder links: ${dead.join(' | ')}`);

  for (const link of internalLinks(document)) {
    const href = link.getAttribute('href');
    assert.ok(!href.includes('.html'), `legacy .html link: ${href}`);
    assert.ok(!href.includes('javascript:'), `script link: ${href}`);
    const url = new URL(href, window.location.href);
    if (url.pathname.startsWith('/images/')) {
      assertLocalImage(url.pathname);
      continue;
    }
    const route = window.TMT.resolve(url);
    assert.notEqual(route.name, 'notFound', `internal link leads to a missing page: ${href}`);
    const category = url.searchParams.get('category');
    if (category) assert.ok(categories.some((entry) => entry.id === category), `unknown category ${category}`);
  }
}

for (const [url, name, heading] of PAGES) {
  test(`route ${url} renders the ${name} page with working links and images`, async () => {
    const { window, document, errors } = await createApp(url);
    assert.equal(window.TMT.getRoute().name, name);
    assert.equal(document.documentElement.dataset.appReady, 'true');
    assert.match(document.querySelector('#main h1')?.textContent ?? '', heading);
    assert.ok(document.querySelector('.site-header'), 'shared header is present');
    assert.ok(document.querySelector('.site-footer'), 'shared footer is present');
    assert.match(document.title, name === 'notFound' ? /404/ : /Mango Tree/);
    auditLinks(window, document);
    auditImages(document, ['home', 'menu', 'dish', 'gallery', 'about'].includes(name));

    const ids = Array.from(document.querySelectorAll('[id]')).map((node) => node.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    assert.deepEqual(duplicates, [], `duplicate ids: ${duplicates.join(', ')}`);
    assert.deepEqual(errors, [], `console errors on ${url}: ${errors.join(' | ')}`);
  });
}

test('every dish detail route renders its own menu item, price and photograph', async () => {
  for (const dish of dishes) {
    const { document } = await createApp(`/menu/${dish.slug}`);
    assert.match(document.querySelector('#main h1').textContent, new RegExp(dish.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(document.querySelector('[data-total]').textContent, /₹/);
    const photo = document.querySelector('.dish-photo img');
    assert.ok(photo.getAttribute('src').includes(`${dish.image}-`), `${dish.slug} shows the wrong photograph`);
    assert.match(photo.getAttribute('alt'), new RegExp(dish.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.equal(document.querySelector('.back-link').getAttribute('href'), '/menu');
    assert.equal(document.querySelector('[data-lightbox-dish]').dataset.lightboxDish, dish.slug);
  }
});

test('home teaser and gallery page render the correct number of clickable photographs', async () => {
  const home = await createApp('/');
  assert.equal(home.document.querySelectorAll('[data-categories] [data-cat-tab]').length, categories.length);
  assert.equal(home.document.querySelectorAll('[data-featured] .dish-card').length, 4);
  assert.equal(home.document.querySelectorAll('[data-gallery] .gallery-tile').length, homeGalleryPhotos.length);
  assert.equal(home.document.querySelectorAll('[data-sig-dots] button').length, 3);
  assert.equal(home.document.querySelectorAll('.about-collage figure button, .about-collage figure a').length, 0, 'decorative story photos must not look clickable');

  const gallery = await createApp('/gallery');
  assert.equal(gallery.document.querySelectorAll('[data-gallery] .gallery-tile').length, galleryPhotos.length);
  for (const tile of gallery.document.querySelectorAll('[data-gallery] .gallery-tile')) {
    assert.match(tile.getAttribute('aria-label'), /Open full-size photograph/);
    assert.ok(tile.querySelector('img[alt]'));
  }
});

test('all required navigation, button and footer destinations are present on every page', async () => {
  for (const [url] of PAGES) {
    const { document, window } = await createApp(url);
    const destinations = {
      home: ['/', '/menu', '/gallery', '/about', '/contact', '/privacy', '/terms'],
      menu: ['/menu', '/menu?category=pizza'],
      gallery: ['/gallery'],
    };
    const hrefs = new Set(Array.from(document.querySelectorAll('a[href]')).map((link) => link.getAttribute('href')));
    for (const href of destinations.home) assert.ok(hrefs.has(href), `${url} is missing the ${href} link`);
    assert.ok(document.querySelector('a.brand[href="/"]'), 'logo must return home');
    const navKey = window.TMT.getRoute().navKey;
    if (navKey) assert.ok(document.querySelector(`[data-nav="${navKey}"][aria-current="page"]`), `${url} must highlight its nav item`);
    else assert.equal(document.querySelectorAll('[data-nav][aria-current="page"]').length, 0);
    assert.ok(document.querySelector('[data-wa-enquiry]'), 'WhatsApp CTA missing');
    assert.ok(document.querySelector('[data-cart-toggle]'), 'order bag control missing');
  }
});

test('legacy bookmarks redirect to clean routes without breaking back/forward', async () => {
  const cases = [
    ['/index.html', '/'],
    ['/menu.html?category=desserts', '/menu?category=desserts'],
    ['/dish.html?id=margherita-pizza', '/menu/margherita-pizza'],
    ['/dish.html?id=unknown-dish', '/404'],
    ['/gallery/', '/gallery'],
  ];
  for (const [from, to] of cases) {
    const { window } = await createApp(from);
    assert.equal(`${window.location.pathname}${window.location.search}`, to, `${from} should redirect to ${to}`);
    if (to === '/404') assert.equal(window.TMT.getRoute().name, 'notFound', 'an unknown legacy dish must show the 404 page');
    else assert.notEqual(window.TMT.getRoute().name, 'notFound', `${from} should not land on 404`);
  }
});

test('source files contain no placeholder links, dead .html routes or fake order confirmations', async () => {
  const viewFiles = (await readdir(path.join(ROOT, 'src/js/views')))
    .filter((file) => file.endsWith('.js'))
    .map((file) => `src/js/views/${file}`);
  const files = [
    'index.html',
    ...['src/js/app.js', 'src/js/router.js', 'src/js/ui.js', 'src/js/components.js', 'src/js/whatsapp.js', 'src/js/cart.js', 'src/js/links.js', 'src/js/image.js', 'src/styles/main.css'],
    ...viewFiles,
  ];
  for (const file of files) {
    const source = await readFile(path.join(ROOT, file), 'utf8');
    assert.ok(!/href=["']#["']/.test(source), `${file} contains an empty href`);
    assert.ok(!/href=["']\.\/[^"']*\.html/.test(source), `${file} contains a stale .html link`);
    assert.ok(!/order confirmed|order placed|payment received/i.test(source), `${file} claims a fake confirmation`);
  }
});
