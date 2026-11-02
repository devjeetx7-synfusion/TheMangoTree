/**
 * All internal URLs live here. Every page, card, button and footer link uses
 * these helpers, so a route can only be changed in one place.
 *
 * Vite's `base` is honoured: with the default `base: '/'` these resolve to the
 * exact routes `/`, `/menu`, `/menu/[slug]`, `/gallery`, `/about`, `/contact`.
 * If the site is deployed under a sub-folder, set `base` in vite.config.mjs
 * and every link gets the same prefix automatically.
 */
/**
 * Vite injects `import.meta.env` when it transforms this module. A plain static
 * server (e.g. `python -m http.server 8080`) has no such object, so guard it
 * and fall back to the site root — otherwise the whole module graph throws
 * `TypeError: Cannot read properties of undefined (reading 'BASE_URL')` before
 * app.js can mount the router.
 */
const rawBase = (import.meta.env && import.meta.env.BASE_URL) || '/';
export const BASE = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

/** Absolute, base-aware path for a route without a leading slash. */
export const path = (route = '') => `${BASE}${String(route).replace(/^\/+/, '')}`;

export const ROUTES = Object.freeze({
  home: path(''),
  menu: path('menu'),
  gallery: path('gallery'),
  about: path('about'),
  contact: path('contact'),
  privacy: path('privacy'),
  terms: path('terms'),
});

/** Canonical detail page for one dish. */
export const dishHref = (dishOrSlug) => {
  const slug = typeof dishOrSlug === 'string' ? dishOrSlug : dishOrSlug.slug;
  return path(`menu/${encodeURIComponent(slug)}`);
};

/** Menu page with optional category filter and/or search query. */
export const menuHref = ({ category = '', q = '' } = {}) => {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (q && q.trim()) params.set('q', q.trim());
  const query = params.toString();
  return query ? `${ROUTES.menu}?${query}` : ROUTES.menu;
};

/** Category tile / dropdown links. */
export const categoryHref = (categoryOrId) =>
  menuHref({ category: typeof categoryOrId === 'string' ? categoryOrId : categoryOrId.id });

/** Strip the deployment base from a pathname, leaving a clean route. */
export const relativePath = (pathname) => {
  const prefix = BASE === '/' ? '' : BASE.replace(/\/$/, '');
  if (prefix && pathname.startsWith(prefix)) return pathname.slice(prefix.length) || '/';
  return pathname || '/';
};
