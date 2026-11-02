/**
 * Regression guard for the "homepage is empty" bug.
 *
 * The site was being served as raw source on :8080 by a plain static server.
 * Two Vite-only constructs (a .json ES-module import and an unguarded
 * `import.meta.env.BASE_URL`) aborted the module graph before app.js mounted the
 * router, so <main id="main"> stayed empty while the static header/footer/bar
 * remained visible. These tests load the modules with plain Node ESM — no
 * esbuild, no Vite define — so any return of those constructs fails immediately.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

async function jsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await jsFiles(full)));
    else if (entry.name.endsWith('.js')) files.push(full);
  }
  return files;
}

test('links.js and image.js load with plain native ESM (no Vite transform)', async () => {
  // A bare `import.meta.env.BASE_URL` throws here in Node, exactly as it does in
  // a browser that has not been transformed by Vite.
  const links = await import('../src/js/links.js');
  assert.equal(links.BASE, '/');
  assert.equal(links.ROUTES.home, '/');
  assert.equal(links.ROUTES.menu, '/menu');
  assert.equal(links.dishHref('margherita-pizza'), '/menu/margherita-pizza');

  const image = await import('../src/js/image.js');
  assert.match(image.srcset('pizza-margherita'), /\/images\/pizza-margherita-480\.webp 480w/);
  assert.match(image.fullSize('pizza-margherita'), /\/images\/pizza-margherita-1200\.webp$/);
  assert.match(image.img('pizza-margherita', { alt: 'Pizza' }), /srcset="[^"]+"/);
});

test('no browser module imports a .json file (strict MIME checking aborts ESM)', async () => {
  const files = await jsFiles(path.join(ROOT, 'src/js'));
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    assert.ok(
      !/from\s+['"][^'"]+\.json['"]/.test(source),
      `${path.relative(ROOT, file)} imports a .json module — use the generated .js manifest instead`
    );
  }
});

test('generated JS image manifest matches src/data/images.json', async () => {
  const json = JSON.parse(await readFile(path.join(ROOT, 'src/data/images.json'), 'utf8'));
  const { default: moduleManifest } = await import('../src/data/images.js');
  assert.deepStrictEqual(moduleManifest, json);
  assert.equal(Object.keys(moduleManifest).length, 19);
});

test('the :8080 static source server exists and serves public/ at the site root', async () => {
  const source = await readFile(path.join(ROOT, 'scripts/serve.mjs'), 'utf8');
  assert.match(source, /PUBLIC/);
  assert.match(source, /SPA|fallback/i);
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts.serve, 'node scripts/serve.mjs');
});


test('reveal animations fail open and narrow mobile layouts have overflow guards', async () => {
  const ui = await readFile(path.join(ROOT, 'src/js/ui.js'), 'utf8');
  const css = await readFile(path.join(ROOT, 'src/styles/main.css'), 'utf8');

  // If IntersectionObserver is missing or does not report an element, content
  // must still become visible rather than leaving the page looking empty.
  assert.match(ui, /items\.forEach\(\(item\) => \{\s*item\.classList\.add\('is-pending'\)/);
  assert.match(ui, /window\.setTimeout\(\(\) => \{[\s\S]*?classList\.remove\('is-pending'\)[\s\S]*?classList\.add\('is-visible'\)[\s\S]*?\}, 1800\)/);
  assert.match(css, /\.reveal\s*\{\s*opacity:\s*1;/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*?\.footer-grid\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 340px\)[\s\S]*?\.mobile-bar \.btn/);
});
