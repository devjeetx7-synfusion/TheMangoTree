import test from 'node:test';
import assert from 'node:assert/strict';
import { waLink, buildOrderMessage, unitPrice } from '../src/js/whatsapp.js';
import { normalisePhone } from '../src/data/site.js';
import { dishById, dishes } from '../src/data/menu.js';

test('normalisePhone strips formatting and rejects short numbers', () => {
  assert.equal(normalisePhone('+91 98765 43210'), '919876543210');
  assert.equal(normalisePhone('(0612) 234-5678'), '06122345678');
  assert.equal(normalisePhone('12'), '');
  assert.equal(normalisePhone(undefined), '');
});

test('waLink builds an encoded wa.me deep link', () => {
  const url = waLink('919876543210', 'Hello & welcome');
  assert.equal(url, 'https://wa.me/919876543210?text=Hello%20%26%20welcome');
  assert.equal(waLink('', 'hello'), '');
});

test('buildOrderMessage includes dish, quantity and chosen options', () => {
  const burger = dishById('mango-special-loaded-burger');
  const message = buildOrderMessage(burger, {
    quantity: 2,
    selections: { extras: ['cheese-slice', 'meal'] },
    note: 'No onion',
  });
  assert.match(message, /The Mango Special Loaded Burger × 2/);
  assert.match(message, /Extra cheese slice, Make it a meal · fries \+ drink/);
  assert.match(message, /No onion/);
  assert.match(message, /₹249/);
});

test('unitPrice adds option deltas without mutating the dish', () => {
  const pizza = dishById('margherita-pizza');
  assert.equal(unitPrice(pizza, {}), 249);
  assert.equal(unitPrice(pizza, { size: 'large', extras: ['extra-cheese'] }), 249 + 120 + 40);
  assert.equal(pizza.price, 249);
});

test('every dish has an image, price, description and unique id', () => {
  const ids = new Set();
  for (const dish of dishes) {
    assert.ok(dish.image, `${dish.id} has no image`);
    assert.ok(dish.price > 0, `${dish.id} has no price`);
    assert.ok(dish.description.length > 12, `${dish.id} description too short`);
    assert.ok(!ids.has(dish.id), `duplicate dish id ${dish.id}`);
    ids.add(dish.id);
  }
});
