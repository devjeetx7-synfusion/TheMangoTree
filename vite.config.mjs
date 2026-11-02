import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const page = (name) => fileURLToPath(new URL(`${name}.html`, import.meta.url));

/**
 * Old bookmarks point at /menu.html and /dish.html. Those files no longer exist
 * (a static menu.html would shadow the clean /menu route), so serve the SPA
 * shell for them and let the router canonicalise the URL.
 */
const rewriteLegacyHtml = (req, _res, next) => {
  if (req.url && /^\/(?:menu|dish)\.html(?:\?|$)/.test(req.url)) {
    const query = req.url.slice(req.url.indexOf('?') >= 0 ? req.url.indexOf('?') : req.url.length);
    req.url = `/index.html${query}`;
  }
  next();
};

const legacyRedirects = {
  name: 'legacy-html-bookmarks-to-spa',
  configureServer(server) {
    server.middlewares.use(rewriteLegacyHtml);
  },
  configurePreviewServer(server) {
    server.middlewares.use(rewriteLegacyHtml);
  },
};

export default defineConfig({
  // Clean routes (/menu, /menu/[slug], /gallery, …) require a root base and a
  // SPA fallback on the host. `npm run build` emits 404.html and _redirects so
  // deep links work on static hosts too.
  base: '/',
  appType: 'spa',
  plugins: [legacyRedirects],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2020',
    rollupOptions: {
      input: {
        app: page('index'),
      },
    },
  },
});
