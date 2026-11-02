import test from 'node:test';
import assert from 'node:assert/strict';
import {
  waLink,
  buildOrderMessage,
  buildEnquiryMessage,
  unitPrice,
  orderItem,
  orderSubtotal,
  optionLines,
  combineOrderLines,
  CONFIRM_LINE,
} from '../src/js/whatsapp.js';
import { site, normalisePhone, phoneHref, directionsHref, socialLinks } from '../src/data/site.js';
import { dishBySlug, dishes, categories } from '../src/data/menu.js';

test('normalisePhone strips formatting and rejects short numbers', () => {
  assert.equal(normalisePhone('+91 98765 43210'), '919876543210');
  assert.equal(normalisePhone('(0612) 234-5678'), '06122345678');
  assert.equal(normalisePhone('12'), '');
  assert.equal(normalisePhone(undefined), '');
});

test('waLink builds an encoded wa.me deep link, empty when unconfigured', () => {
  assert.equal(waLink('919876543210', 'Hello & welcome'), 'https://wa.me/919876543210?text=Hello%20%26%20welcome');
  assert.equal(waLink('', 'hello'), '');
  assert.equal(waLink('   ', 'hello'), '');
});

test('single-dish order message includes dish, quantity, options, note and sample totals', () => {
  const burger = dishBySlug('mango-special-loaded-burger');
  const message = buildOrderMessage(burger, {
    quantity: 2,
    selections: { extras: ['cheese-slice', 'meal'] },
    note: 'No onion',
  });
  assert.match(message, /The Mango Special Loaded Burger × 2/);
  assert.match(message, /Extra cheese slice, Make it a meal · fries \+ drink/);
  assert.match(message, /No onion/);
  assert.equal((message.match(/No onion/g) || []).length, 1, 'the note must not be duplicated');
  assert.match(message, /₹378/); // unit price + extra cheese slice + meal
  assert.match(message, /₹756/); // line total and subtotal for two burgers
  assert.match(message, /Website sample subtotal/);
  assert.ok(message.includes(CONFIRM_LINE));
});

test('multi-item order subtotal adds option deltas and quantities correctly', () => {
  const pizza = dishBySlug('margherita-pizza');
  const momos = dishBySlug('steamed-veg-momos');
  const lines = [
    orderItem(pizza, { quantity: 2, selections: { size: 'large', extras: ['extra-cheese'] } }),
    orderItem(momos, { quantity: 1 }),
  ];
  assert.equal(unitPrice(pizza, lines[0].selections), 249 + 120 + 40);
  assert.equal(orderSubtotal(lines), (249 + 120 + 40) * 2 + 149);
  const message = buildOrderMessage(lines);
  assert.match(message, /1\. Margherita Pizza × 2/);
  assert.match(message, /2\. Steamed Veg Momos × 1/);
  assert.match(message, /Large · 12 inch/);
  assert.match(message, /Extra cheese/);
  assert.match(message, /₹967/);
  assert.match(message, /2 lines/);
});

test('combineOrderLines merges identical bag entries instead of charging twice', () => {
  const pizza = dishBySlug('margherita-pizza');
  const momos = dishBySlug('steamed-veg-momos');
  const bag = [orderItem(pizza, { quantity: 2 }), orderItem(momos, { quantity: 1 })];
  const selected = orderItem(pizza, { quantity: 1 });
  const lines = combineOrderLines([selected], bag);
  assert.equal(lines.length, 2);
  assert.equal(orderSubtotal(lines), 249 * 3 + 149);
  const message = buildOrderMessage(lines);
  assert.match(message, /Margherita Pizza × 3/);
  assert.match(message, /1\. Margherita Pizza × 3/);
  assert.match(message, /2\. Steamed Veg Momos × 1/);
  assert.match(message, /2 lines/);
});

test('optionLabels only includes real choices and unitPrice never mutates the dish', () => {
  const pizza = dishBySlug('margherita-pizza');
  assert.deepEqual(optionLines(pizza, { size: 'regular', extras: ['fake-choice'] }), ['Choose a size: Regular · 8 inch']);
  assert.equal(unitPrice(pizza, {}), 249);
  assert.equal(unitPrice(pizza, { size: 'large', extras: ['extra-cheese'] }), 249 + 120 + 40);
  assert.equal(pizza.price, 249);
});

test('general enquiries never claim an order was placed', () => {
  const message = buildEnquiryMessage();
  assert.match(message, /ask about the menu/);
  assert.match(message, /Nothing is confirmed until the cafe replies/);
  assert.doesNotMatch(message, /order confirmed|order placed|payment received/i);
});

test('unconfigured contact settings stay empty (no invented details)', () => {
  assert.equal(site.whatsapp, '');
  assert.equal(site.phone, '');
  assert.equal(site.address, '');
  assert.equal(site.mapsUrl, '');
  assert.equal(phoneHref(''), '');
  assert.equal(directionsHref(), '');
  assert.deepEqual(socialLinks(), []);
});

test('configured contact settings produce real links only when supplied', () => {
  const original = { ...site };
  try {
    site.phone = '+91 98765 43210';
    site.address = 'Station Road, Chhapra, Bihar';
    site.mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Station+Road%2C+Chhapra';
    site.instagram = 'https://instagram.com/example-profile';
    site.facebook = 'not-a-url';
    assert.equal(phoneHref(site.phone), 'tel:+919876543210');
    assert.equal(directionsHref(), site.mapsUrl);
    assert.deepEqual(socialLinks(), [{ id: 'instagram', label: 'Instagram', url: site.instagram }]);
  } finally {
    Object.assign(site, original);
  }
});

test('central menu data has unique, URL-safe slugs and one photo per dish', () => {
  const slugs = new Set();
  const images = new Set();
  for (const dish of dishes) {
    assert.equal(dish.slug, dish.id, `${dish.id} slug must match the canonical id`);
    assert.match(dish.slug, /^[a-z0-9-]+$/);
    assert.ok(dish.image && dish.price > 0 && dish.description.length > 12);
    assert.ok(!slugs.has(dish.slug), `duplicate dish slug ${dish.slug}`);
    assert.ok(!images.has(dish.image), `duplicate dish photo ${dish.image}`);
    assert.ok(categories.some((category) => category.id === dish.category), `${dish.slug} has an unknown category`);
    slugs.add(dish.slug);
    images.add(dish.image);
  }
  assert.equal(dishBySlug('not-a-real-dish'), undefined);
});
