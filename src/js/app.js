/** Application entry point for the single-page, clean-route website. */
import { site } from '../data/site.js';
import { categories } from '../data/menu.js';
import { ROUTES, categoryHref } from './links.js';
import { escapeHtml } from './utils.js';
import { initChrome, refreshChrome } from './ui.js';
import { initRouter, getRoute, resolve } from './router.js';
import { cart } from './cart.js';
import * as whatsapp from './whatsapp.js';

const polyfillMatchMedia = () => {
  if (window.matchMedia) return;
  window.matchMedia = () => ({
    matches: false,
    media: '',
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
};

polyfillMatchMedia();

// Created at runtime (instead of written in index.html) so Vite's HTML asset
// plugin does not try to treat the root path "/" as a file to bundle.
if (!document.querySelector('link[rel="canonical"]')) {
  const canonical = document.createElement('link');
  canonical.rel = 'canonical';
  document.head.appendChild(canonical);
}

// The desktop "Menu" dropdown is generated from the same central data file as
// the menu filters, so it can never drift out of sync.
const dropdownCategories = document.querySelector('[data-dropdown-categories]');
if (dropdownCategories) {
  dropdownCategories.innerHTML = categories
    .map((category) => `<a href="${categoryHref(category)}">${escapeHtml(category.name)}</a>`)
    .join('');
}

// The mobile drawer gets the same category shortcuts from the same data file.
const drawerCategories = document.querySelector('[data-drawer-categories]');
if (drawerCategories) {
  drawerCategories.innerHTML = categories
    .map((category) => `<a href="${categoryHref(category)}">${escapeHtml(category.name)}</a>`)
    .join('');
}

initChrome();
const router = initRouter();

/**
 * A small, read/write-free-in-production helper used by the DOM test suite and
 * by anyone inspecting the site in devtools. It contains no secrets: all of
 * these values are already public in the browser bundle.
 */
window.TMT = {
  site,
  routes: ROUTES,
  cart,
  whatsapp,
  resolve,
  getRoute,
  navigate: router.navigate,
  render: router.renderCurrent,
  refresh: () => {
    refreshChrome();
    return router.renderCurrent();
  },
};

document.documentElement.dataset.appReady = 'true';
