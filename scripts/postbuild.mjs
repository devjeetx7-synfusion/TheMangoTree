/**
 * Static-host deep-link support.
 *
 * The site uses History API routes (/menu, /menu/[slug], /gallery, …). A static
 * host must serve index.html for unknown paths. Vite's dev and preview servers
 * already do that; this step adds a 404.html copy of the built shell for hosts
 * such as GitHub Pages that serve 404.html for unknown paths. Netlify/Vercel
 * style hosts can use public/_redirects instead.
 */
import { copyFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const index = path.join(ROOT, 'dist', 'index.html');

try {
  await stat(index);
} catch {
  console.error('postbuild: dist/index.html not found — run `vite build` first.');
  process.exit(1);
}

await copyFile(index, path.join(ROOT, 'dist', '404.html'));
console.log('✓ dist/404.html — SPA fallback for clean routes on static hosts');
