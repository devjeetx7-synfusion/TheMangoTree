/**
 * Small client-side order bag for multi-item WhatsApp ordering.
 *
 * The cart is never an order: it only collects dishes so the WhatsApp message
 * can contain every line with a correctly calculated sample subtotal. It is
 * stored in localStorage for convenience; no payment or confirmation happens.
 */
import { dishBySlug } from '../data/menu.js';
import { cartLineKey, clampInt } from './utils.js';
import { unitPrice } from './whatsapp.js';

const STORAGE_KEY = 'the-mango-tree-cart-v1';
const listeners = new Set();

const read = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => entry && typeof entry.slug === 'string' && dishBySlug(entry.slug))
      .map((entry) => ({
        slug: entry.slug,
        quantity: clampInt(entry.quantity, 1, 20, 1),
        selections: entry.selections && typeof entry.selections === 'object' ? entry.selections : {},
        note: String(entry.note || '').slice(0, 300),
      }));
  } catch {
    return [];
  }
};

let items = read();

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* private browsing / storage disabled — the in-memory cart still works */
  }
  listeners.forEach((listener) => listener(items));
};

export const cart = {
  getItems: () => items.map((item) => ({ ...item, selections: { ...item.selections } })),

  /** Add a dish (or merge with an identical line). Returns the line key. */
  add(dishOrSlug, { quantity = 1, selections = {}, note = '' } = {}) {
    const dish = typeof dishOrSlug === 'string' ? dishBySlug(dishOrSlug) : dishOrSlug;
    if (!dish) return '';
    const line = {
      slug: dish.slug,
      quantity: clampInt(quantity, 1, 20, 1),
      selections: { ...selections },
      note: String(note || '').trim().slice(0, 300),
    };
    const key = cartLineKey(line);
    const existing = items.find((item) => cartLineKey(item) === key);
    if (existing) existing.quantity = clampInt(existing.quantity + line.quantity, 1, 20, 20);
    else items.push(line);
    persist();
    return key;
  },

  setQuantity(key, quantity) {
    const item = items.find((entry) => cartLineKey(entry) === key);
    if (!item) return;
    item.quantity = clampInt(quantity, 1, 20, 1);
    persist();
  },

  stepQuantity(key, delta) {
    const item = items.find((entry) => cartLineKey(entry) === key);
    if (item) cart.setQuantity(key, item.quantity + delta);
  },

  remove(key) {
    items = items.filter((item) => cartLineKey(item) !== key);
    persist();
  },

  clear() {
    items = [];
    persist();
  },

  count: () => items.reduce((sum, item) => sum + item.quantity, 0),

  /** Resolve cart lines against the central menu data (skips stale entries). */
  orderLines: () =>
    items
      .map((item) => ({ dish: dishBySlug(item.slug), quantity: item.quantity, selections: item.selections, note: item.note }))
      .filter((line) => line.dish),

  subtotal: () =>
    cart.orderLines().reduce((sum, line) => sum + unitPrice(line.dish, line.selections) * line.quantity, 0),

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
