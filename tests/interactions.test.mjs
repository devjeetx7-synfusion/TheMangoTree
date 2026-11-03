/**
 * End-to-end interaction tests (jsdom + the real bundled app): filters,
 * routing/back-forward, dish ordering, cart subtotals, WhatsApp deep links,
 * lightbox keyboard controls, mobile navigation and configured contact links.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp, click, key, input, tick } from './helpers.mjs';
import { dishes, categories } from '../src/data/menu.js';
import { galleryPhotos } from '../src/data/photography.js';

test('menu category filters, deep links, live search and empty-state reset work', async () => {
  const { window, document } = await createApp('/menu');
  const cards = () => document.querySelectorAll('[data-menu-grid] .dish-card');
  assert.equal(cards().length, dishes.length);
  assert.equal(document.querySelectorAll('[data-chips] .chip').length, categories.length + 1);

  click(window, document.querySelector('[data-chip="pizza"]'));
  await tick();
  assert.equal(cards().length, 3);
  assert.match(document.querySelector('[data-count]').textContent, /3 dishes in “Pizza”/);
  assert.match(window.location.search, /category=pizza/);

  const search = document.querySelector('[data-search]');
  input(window, search, 'margherita');
  await tick(180);
  assert.equal(cards().length, 1);
  assert.match(window.location.search, /q=margherita/);

  input(window, search, 'zzzz');
  await tick(180);
  assert.ok(document.querySelector('.empty-state'));
  click(window, document.querySelector('[data-reset]'));
  await tick();
  assert.equal(cards().length, dishes.length);
  assert.equal(window.location.pathname + window.location.search, '/menu');

  const deep = await createApp('/menu?category=desserts');
  assert.equal(deep.document.querySelectorAll('[data-menu-grid] .dish-card').length, dishes.filter((d) => d.category === 'desserts').length);
  assert.equal(deep.document.querySelector('[data-chip="desserts"]').getAttribute('aria-pressed'), 'true');
});

test('dish cards navigate to their own detail page; browser back/forward restores pages', async () => {
  const { window, document } = await createApp('/menu');
  const link = document.querySelector('[data-menu-grid] .dish-card h3 a');
  const href = link.getAttribute('href');
  click(window, link);
  assert.equal(window.location.pathname, href);
  assert.equal(window.TMT.getRoute().name, 'dish');
  const dishSlug = href.split('/').pop();
  assert.match(document.querySelector('#main h1').textContent, new RegExp(dishes.find((d) => d.slug === dishSlug).name));

  window.history.back();
  await tick(80);
  assert.equal(window.location.pathname, '/menu');
  assert.equal(window.TMT.getRoute().name, 'menu');
  assert.ok(document.querySelector('[data-menu-grid] .dish-card'));

  window.history.forward();
  await tick(80);
  assert.equal(window.location.pathname, href);
  assert.equal(window.TMT.getRoute().name, 'dish');
});

test('dish page options, quantity, note and sample subtotal feed one WhatsApp message', async () => {
  const { window, document } = await createApp('/menu/mango-special-loaded-burger');
  const total = () => document.querySelector('[data-total]').textContent;
  assert.equal(total(), '₹249');

  const meal = document.querySelector('input[name="extras"][value="meal"]');
  meal.checked = true;
  meal.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(total(), '₹348');

  click(window, document.querySelector('[data-qty-plus]'));
  assert.equal(document.querySelector('[data-qty]').value, '2');
  assert.equal(total(), '₹696');

  input(window, document.querySelector('[data-note]'), 'No onion please');
  click(window, document.querySelector('[data-order-current]'));
  await tick(40);

  const message = document.querySelector('[data-order-current]').dataset.orderMessage;
  assert.match(message, /The Mango Special Loaded Burger × 2/);
  assert.match(message, /Make it a meal/);
  assert.match(message, /No onion please/);
  assert.match(message, /₹696/);
  assert.match(message, /Nothing is confirmed until the cafe replies/);
  assert.equal(window.__copied, message, 'unconfigured number copies the exact message instead of faking an order');
  assert.equal(window.__waClicks.length, 0);
  assert.match(document.querySelector('[data-feedback]').textContent, /copied/);
});

test('configured number opens a wa.me deep link with the selected dish and encoded message', async () => {
  const { window, document } = await createApp('/menu');
  window.TMT.site.whatsapp = '919876543210';
  const orderButton = document.querySelector('[data-order-card="margherita-pizza"]');
  click(window, orderButton);
  await tick();

  assert.equal(window.__waClicks.length, 1);
  const url = new URL(window.__waClicks[0]);
  assert.equal(`${url.origin}${url.pathname}`, 'https://wa.me/919876543210');
  const message = url.searchParams.get('text');
  assert.match(message, /Margherita Pizza × 1/);
  assert.match(message, /₹249/);
  assert.equal(window.TMT.whatsapp.getLastOrder().configured, true);
  assert.equal(orderButton.dataset.orderMessage, message);
});

test('multi-item order bag calculates subtotals, includes every line, and clears', async () => {
  const { window, document } = await createApp('/menu');
  window.TMT.site.whatsapp = '919876543210';
  click(window, document.querySelector('[data-add-to-cart="mango-special-loaded-burger"]'));
  click(window, document.querySelector('[data-add-to-cart="margherita-pizza"]'));
  assert.equal(document.querySelector('[data-cart-count]').textContent, '2');

  click(window, document.querySelector('[data-cart-toggle]'));
  const panel = document.querySelector('[data-cart-panel]');
  assert.ok(panel.classList.contains('is-open'));
  assert.equal(panel.querySelectorAll('.cart-row').length, 2);
  assert.equal(panel.querySelector('[data-cart-subtotal]').textContent, '₹498');

  click(window, panel.querySelector('[data-cart-step="1"]'));
  assert.equal(panel.querySelector('[data-cart-subtotal]').textContent, '₹747');
  assert.equal(document.querySelector('[data-cart-count]').textContent, '3');

  click(window, panel.querySelector('[data-cart-order]'));
  await tick();
  const message = new URL(window.__waClicks.at(-1)).searchParams.get('text');
  assert.match(message, /The Mango Special Loaded Burger × 2/);
  assert.match(message, /Margherita Pizza × 1/);
  assert.match(message, /₹747/);

  click(window, panel.querySelector('[data-cart-clear]'));
  assert.equal(document.querySelector('[data-cart-count]').textContent, '0');
  assert.ok(panel.querySelector('.cart-empty'));
  assert.equal(panel.querySelector('[data-cart-order]').disabled, true);
});

test('gallery lightbox opens the correct full-size photo with next, prev, Escape and close', async () => {
  const { window, document } = await createApp('/gallery');
  const tiles = document.querySelectorAll('[data-lightbox-index]');
  assert.equal(tiles.length, galleryPhotos.length);

  click(window, tiles[2]);
  const box = document.querySelector('.lightbox');
  assert.ok(box.classList.contains('is-open'));
  assert.match(box.querySelector('img').getAttribute('src'), new RegExp(`${galleryPhotos[2].base}-1200\\.webp`));
  assert.equal(box.querySelector('[data-lightbox-counter]').textContent, `3 of ${galleryPhotos.length}`);
  assert.match(box.querySelector('[data-lightbox-full]').getAttribute('href'), new RegExp(`${galleryPhotos[2].base}-1200\\.webp`));

  click(window, box.querySelector('[data-lightbox-next]'));
  assert.equal(box.querySelector('[data-lightbox-counter]').textContent, `4 of ${galleryPhotos.length}`);
  assert.match(box.querySelector('img').getAttribute('src'), new RegExp(`${galleryPhotos[3].base}-1200\\.webp`));

  key(window, 'ArrowLeft');
  assert.equal(box.querySelector('[data-lightbox-counter]').textContent, `3 of ${galleryPhotos.length}`);
  key(window, 'ArrowRight');
  assert.equal(box.querySelector('[data-lightbox-counter]').textContent, `4 of ${galleryPhotos.length}`);

  key(window, 'Escape');
  assert.ok(!box.classList.contains('is-open'));

  click(window, tiles[0]);
  assert.ok(box.classList.contains('is-open'));
  assert.equal(box.querySelector('[data-lightbox-counter]').textContent, `1 of ${galleryPhotos.length}`);
  click(window, box.querySelector('[data-lightbox-close]'));
  assert.ok(!box.classList.contains('is-open'));
  assert.ok(!document.body.classList.contains('is-locked'));
});

test('home gallery teaser and dish photo open their own lightbox groups', async () => {
  const home = await createApp('/');
  const tiles = home.document.querySelectorAll('[data-lightbox-index]');
  assert.equal(tiles.length, 4);
  click(home.window, tiles[3]);
  const box = home.document.querySelector('.lightbox');
  assert.equal(box.querySelector('[data-lightbox-counter]').textContent, '4 of 4');
  click(home.window, box.querySelector('[data-lightbox-next]'));
  assert.equal(box.querySelector('[data-lightbox-counter]').textContent, '1 of 4', 'next wraps around');

  const dish = await createApp(`/menu/${dishes[0].slug}`);
  click(dish.window, dish.document.querySelector('[data-lightbox-dish]'));
  const dishBox = dish.document.querySelector('.lightbox');
  assert.ok(dishBox.classList.contains('is-open'));
  assert.match(dishBox.querySelector('img').getAttribute('src'), new RegExp(`${dishes[0].image}-1200\\.webp`));
  assert.equal(dishBox.querySelector('[data-lightbox-counter]').textContent, '1 of 1');
  assert.equal(dishBox.querySelector('[data-lightbox-prev]').hidden, true);
  assert.equal(dishBox.querySelector('[data-lightbox-next]').hidden, true);
});

test('mobile hamburger opens, closes after navigation, and supports Escape', async () => {
  const { window, document } = await createApp('/');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.mobile-nav');
  click(window, toggle);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.ok(nav.classList.contains('is-open'));
  assert.ok(document.body.classList.contains('is-locked'));

  click(window, nav.querySelector('a[href="/gallery"]'));
  assert.equal(window.location.pathname, '/gallery');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.ok(!nav.classList.contains('is-open'));
  assert.ok(!document.body.classList.contains('is-locked'));

  click(window, toggle);
  assert.ok(nav.classList.contains('is-open'));
  key(window, 'Escape');
  assert.ok(!nav.classList.contains('is-open'));
});

test('desktop menu dropdown opens and its category links navigate correctly', async () => {
  const { window, document } = await createApp('/');
  const toggle = document.querySelector('[data-menu-dropdown-toggle]');
  const panel = document.querySelector('[data-menu-dropdown]');
  click(window, toggle);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.ok(panel.classList.contains('is-open'));
  assert.equal(panel.querySelectorAll('a[href^="/menu?category="]').length, categories.length);

  click(window, panel.querySelector('a[href="/menu?category=pizza"]'));
  assert.equal(window.location.pathname, '/menu');
  assert.equal(window.location.search, '?category=pizza');
  assert.ok(!panel.classList.contains('is-open'));
  assert.equal(window.TMT.getRoute().name, 'menu');
});

test('signature carousel changes dish, detail link and order target together', async () => {
  const { window, document } = await createApp('/');
  const name = document.querySelector('[data-sig-name]');
  const first = name.textContent;
  click(window, document.querySelector('[data-sig-next]'));
  await tick(220);
  assert.notEqual(name.textContent, first);
  const href = document.querySelector('[data-sig-link]').getAttribute('href');
  assert.match(href, /^\/menu\/[a-z0-9-]+$/);
  assert.equal(window.TMT.resolve(new URL(href, window.location.href)).name, 'dish');
  assert.equal(document.querySelector('[data-order-signature]').dataset.orderSignature, href.split('/').pop());
  click(window, document.querySelector('[data-sig-prev]'));
  await tick(220);
  assert.equal(name.textContent, first);
});

test('related dishes and every rendered button have a real destination or handler', async () => {
  const known = '[data-wa-enquiry], [data-wa-contact], [data-order-card], [data-order-signature], [data-order-current], [data-add-current], [data-add-to-cart], [data-cart-toggle], [data-cart-close], [data-cart-clear], [data-cart-order], [data-cart-step], [data-cart-remove], [data-chip], [data-reset], [data-dot], [data-sig-prev], [data-sig-next], [data-qty-minus], [data-qty-plus], [data-menu-dropdown-toggle], [data-lightbox-index], [data-lightbox-dish], [data-lightbox-close], [data-lightbox-prev], [data-lightbox-next], [data-cat-tab], [data-search-clear], .nav-toggle';
  for (const url of ['/', '/menu', `/menu/${dishes[0].slug}`, '/gallery', '/about', '/contact', '/privacy', '/terms']) {
    const { window, document } = await createApp(url);
    const unhandled = Array.from(document.querySelectorAll('button')).filter((button) => !button.matches(known));
    assert.deepEqual(unhandled.map((button) => button.outerHTML.slice(0, 80)), [], `${url} has buttons without handlers`);
    if (url.startsWith('/menu/')) {
      const related = document.querySelectorAll('[data-related] .dish-card h3 a');
      assert.equal(related.length, 3);
      for (const link of related) assert.equal(window.TMT.resolve(new URL(link.href, window.location.href)).name, 'dish');
    }
  }
});

test('contact page only publishes links for configured details', async () => {
  const { window, document } = await createApp('/contact');
  assert.equal(document.querySelector('a[href^="tel:"]'), null);
  assert.equal(document.querySelector('a[href^="mailto:"]'), null);
  assert.equal(document.querySelector('[data-directions] a'), null);
  assert.equal(document.querySelector('[data-socials] a'), null);
  assert.match(document.querySelector('[data-directions]').textContent, /exact street address/i);

  click(window, document.querySelector('[data-wa-contact]'));
  await tick(40);
  assert.equal(window.__waClicks.length, 0);
  assert.match(window.__copied, /menu, timings and table availability/);

  Object.assign(window.TMT.site, {
    whatsapp: '919876543210',
    phone: '+91 98765 43210',
    email: 'hello@example.com',
    address: 'Station Road, Chhapra, Bihar',
    hours: '10:00–22:00',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Station+Road%2C+Chhapra',
    instagram: 'https://instagram.com/example-profile',
    facebook: 'https://facebook.com/example-profile',
  });
  window.TMT.refresh();

  assert.equal(document.querySelector('[data-contact="phone"] a').getAttribute('href'), 'tel:+919876543210');
  assert.equal(document.querySelector('[data-contact="email"] a').getAttribute('href'), 'mailto:hello%40example.com');
  assert.equal(document.querySelector('[data-contact="whatsapp"] a').getAttribute('href').startsWith('https://wa.me/919876543210'), true);
  assert.equal(document.querySelector('[data-directions] a').getAttribute('href'), window.TMT.site.mapsUrl);
  assert.equal(document.querySelectorAll('#main [data-socials] a').length, 2);
  assert.match(document.querySelector('#main [data-socials] a').getAttribute('href'), /^https:\/\/instagram\.com\//);
  assert.equal(document.querySelectorAll('#main a[href^="tel:"]').length, 1);

  click(window, document.querySelector('[data-wa-contact]'));
  await tick();
  assert.equal(window.__waClicks.length, 1);
  assert.match(window.__waClicks[0], /^https:\/\/wa\.me\/919876543210\?text=/);
});
