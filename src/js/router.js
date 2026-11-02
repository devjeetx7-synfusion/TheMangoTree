/**
 * Tiny History API router for the site's clean routes.
 *
 *   /                 home
 *   /menu             complete food menu (with ?category= & ?q= deep links)
 *   /menu/[slug]      dish detail
 *   /gallery          photo gallery
 *   /about            our story
 *   /contact          contact details + WhatsApp
 *   /privacy, /terms  published legal pages
 *   anything else     custom 404 view
 *
 * Legacy .html bookmarks are redirected to the canonical clean URL, and all
 * internal anchors are intercepted so browser Back / Forward work without a
 * full page reload.
 */
import { dishBySlug } from '../data/menu.js';
import { ROUTES, BASE, path as sitePath, relativePath, dishHref } from './links.js';
import * as home from './views/home.js';
import * as menu from './views/menu.js';
import * as dish from './views/dish.js';
import * as gallery from './views/gallery.js';
import * as about from './views/about.js';
import * as contact from './views/contact.js';
import * as legal from './views/legal.js';
import * as notFound from './views/not-found.js';
import { afterRender, closeOverlays } from './ui.js';

const VIEWS = { home, menu, dish, gallery, about, contact, privacy: legal, terms: legal, notFound };

const NAV_KEYS = {
  home: 'home',
  menu: 'menu',
  dish: 'menu',
  gallery: 'gallery',
  about: 'about',
  contact: 'contact',
  privacy: '',
  terms: '',
  notFound: '',
};

/** Resolve a location into a route (or a canonical redirect). */
export function resolve(location = window.location) {
  const clean = (relativePath(location.pathname) || '/').replace(/\/+$/, '') || '/';
  const query = new URLSearchParams(location.search || '');
  const hash = location.hash || '';
  const suffix = `${query.toString() ? `?${query}` : ''}${hash}`;

  // Legacy bookmarks from the previous three-page build.
  if (clean === '/index.html') return { redirect: `${ROUTES.home}${suffix}` };
  if (clean === '/menu.html') return { redirect: `${ROUTES.menu}${suffix}` };
  if (clean === '/dish.html') {
    const legacyDish = dishBySlug(query.get('id') ?? '');
    return { redirect: legacyDish ? dishHref(legacyDish) : `${sitePath('404')}` };
  }

  const make = (name, params = {}, view = VIEWS[name], canonical = clean) => ({
    name,
    params,
    query,
    view,
    navKey: NAV_KEYS[name],
    canonical: `${BASE}${canonical.replace(/^\/+/, '')}${hash}`,
  });

  if (clean === '/') return make('home');
  if (clean === '/menu' || clean === '/menu/') return make('menu', {}, VIEWS.menu, '/menu');
  if (clean.startsWith('/menu/')) {
    const slug = decodeURIComponent(clean.slice('/menu/'.length).replace(/\/+$/, ''));
    if (!slug || !dishBySlug(slug)) return make('notFound', { slug }, VIEWS.notFound);
    return make('dish', { slug }, VIEWS.dish, `/menu/${encodeURIComponent(slug)}`);
  }
  if (clean === '/gallery') return make('gallery');
  if (clean === '/about') return make('about');
  if (clean === '/contact') return make('contact');
  if (clean === '/privacy') return make('privacy');
  if (clean === '/terms') return make('terms');
  if (clean === '/404') return make('notFound', {}, VIEWS.notFound);
  return make('notFound', { unknownPath: clean }, VIEWS.notFound);
}

let currentController = null;
let currentRoute = null;

export const getRoute = () => currentRoute;

export function initRouter() {
  const main = document.querySelector('#main');
  if (!main) throw new Error('Router requires <main id="main">');

  const applyMeta = (route) => {
    const meta = route.view.meta?.(route) ?? { title: route.view.title, description: route.view.description };
    document.title = meta.title || 'The Mango Tree Cafe';
    const description = document.querySelector('meta[name="description"]');
    if (description && meta.description) description.setAttribute('content', meta.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title || '');
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', new URL(`${BASE}images/${meta.image || 'og-cover.jpg'}`, window.location.href).href);
    }
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', meta.robots || 'index,follow');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = new URL(route.canonical, window.location.href).href;

    document.querySelectorAll('[data-nav]').forEach((link) => {
      if (route.navKey && link.dataset.nav === route.navKey) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const renderCurrent = ({ scroll = false } = {}) => {
    let route = resolve(window.location);
    if (route.redirect) {
      window.history.replaceState(window.history.state || {}, '', route.redirect);
      route = resolve(window.location);
    }
    // Canonicalise trailing slashes without adding a history entry.
    const canonicalPath = new URL(route.canonical, window.location.href).pathname;
    if (window.location.pathname !== canonicalPath) {
      const url = `${canonicalPath}${window.location.search}${window.location.hash}`;
      window.history.replaceState(window.history.state || {}, '', url);
      route = resolve(window.location);
    }

    currentController?.abort();
    currentController = new AbortController();
    currentRoute = route;

    closeOverlays();
    main.innerHTML = route.view.render?.(route) ?? '';
    applyMeta(route);
    route.view.mount?.(main, route, currentController.signal);
    afterRender(main, route);

    if (scroll) {
      const hash = window.location.hash;
      if (hash) {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (target?.scrollIntoView) target.scrollIntoView();
      } else {
        window.scrollTo?.(0, 0);
      }
    }
    return route;
  };

  const navigate = (href, { replace = false } = {}) => {
    const url = new URL(href, window.location.href);
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (replace) window.history.replaceState(window.history.state || {}, '', next);
    else window.history.pushState({}, '', next);
    return renderCurrent({ scroll: true });
  };

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#')) return;
    if (anchor.target === '_blank' || anchor.hasAttribute('download') || anchor.dataset.external !== undefined) return;
    let url;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return; // tel:, mailto:, wa.me, maps…
    event.preventDefault();
    navigate(`${url.pathname}${url.search}${url.hash}`);
  });

  window.addEventListener('popstate', () => renderCurrent({ scroll: false }));
  window.addEventListener('hashchange', () => {
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    target?.scrollIntoView?.();
  });

  renderCurrent();
  return { navigate, renderCurrent };
}
