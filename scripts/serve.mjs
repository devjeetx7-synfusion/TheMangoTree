#!/usr/bin/env node
/**
 * Zero-build static server for the raw source tree (the :8080 case).
 *
 * A generic `python -m http.server 8080` pointed at the repository root serves
 * index.html but gets two things wrong:
 *   1. `public/` is not exposed at the site root, so /images/*, /favicon.svg and
 *      /robots.txt all 404 (Vite normally copies public/ to the root).
 *   2. It has no SPA fallback, so clean routes like /menu or /gallery 404 on
 *      direct navigation / refresh.
 *
 * This server fixes both. It is intentionally tiny and dependency-free: the
 * source modules no longer need Vite transforms (see src/js/links.js and
 * src/js/image.js), so the site also works without a build step.
 *
 *   npm run serve                 # http://localhost:8080
 *   PORT=9000 npm run serve
 *
 * For the canonical Vite workflow use `npm run dev` (:5173) or
 * `npm run build && npm run preview` (:4173).
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const SHELL = path.join(ROOT, 'index.html');

const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const PORT = Number(process.env.PORT || (portArg ? portArg.slice('--port='.length) : 8080));
const HOST = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '': 'text/plain; charset=utf-8',
};

const isInside = (file) => file === ROOT || file.startsWith(ROOT + path.sep);

const send = (res, status, body, type = 'text/plain; charset=utf-8') => {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-cache' });
  res.end(body);
};

const server = http.createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return send(res, 400, 'Bad request');
  }

  const relative = pathname.replace(/^\/+/, '');
  const extension = path.extname(pathname).toLowerCase();
  // Extensionless paths and old .html bookmarks are SPA routes.
  const isRoute = !extension || extension === '.html';

  // Vite semantics: everything in public/ is served from the site root.
  const candidates = [path.resolve(PUBLIC, relative), path.resolve(ROOT, relative)];
  let file = null;
  for (const candidate of candidates) {
    if (!isInside(candidate)) continue;
    try {
      if ((await stat(candidate)).isFile()) {
        file = candidate;
        break;
      }
    } catch {
      // Try the next candidate.
    }
  }

  if (!file && isRoute) file = SHELL; // SPA fallback for direct navigation/refresh
  if (!file || !isInside(file)) return send(res, 404, 'Not found');

  try {
    const body = await readFile(file);
    return send(res, 200, body, MIME[path.extname(file).toLowerCase()] || MIME['']);
  } catch {
    return send(res, 404, 'Not found');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`The Mango Tree Cafe — static source server on http://localhost:${PORT}`);
  console.log(`  root:   ${ROOT}`);
  console.log(`  public: ${PUBLIC} (served at /)`);
  console.log('  clean routes fall back to index.html (SPA)');
});
