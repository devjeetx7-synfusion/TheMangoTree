/** Production build + static-host deep-link fallback verification. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('npm run build succeeds and emits working production assets', () => {
  const result = spawnSync('npm', ['run', 'build'], { cwd: ROOT, encoding: 'utf8', timeout: 180_000 });
  assert.equal(result.status, 0, `build failed:\n${result.stdout}\n${result.stderr}`);

  const dist = path.join(ROOT, 'dist');
  for (const file of ['index.html', '404.html', '_redirects', 'favicon.svg', 'robots.txt', 'images/og-cover.jpg']) {
    assert.ok(existsSync(path.join(dist, file)), `dist/${file} missing`);
  }
  // A static menu.html/dish.html would be served for the clean /menu route by
  // history fallbacks and cause a redirect loop. The SPA shell handles those
  // legacy bookmarks instead.
  for (const stale of ['menu.html', 'dish.html']) {
    assert.ok(!existsSync(path.join(dist, stale)), `dist/${stale} must not shadow the clean route`);
  }

  const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
  const script = html.match(/src="(\/assets\/[^"]+\.js)"/);
  const stylesheet = html.match(/href="(\/assets\/[^"]+\.css)"/);
  assert.ok(script, 'built HTML has no bundled script');
  assert.ok(stylesheet, 'built HTML has no bundled stylesheet');
  assert.ok(existsSync(path.join(dist, script[1].replace(/^\//, ''))), 'bundled JS missing');
  assert.ok(existsSync(path.join(dist, stylesheet[1].replace(/^\//, ''))), 'bundled CSS missing');
  assert.equal(readFileSync(path.join(dist, '404.html'), 'utf8'), html, '404.html must be a copy of the SPA shell');
  assert.match(readFileSync(path.join(dist, '_redirects'), 'utf8'), /\/\*\s+\/index\.html\s+200/);

  // Every local image referenced by the built HTML exists.
  for (const match of html.matchAll(/(?:src|href)="(\/images\/[^"]+)"/g)) {
    assert.ok(existsSync(path.join(dist, match[1].replace(/^\//, ''))), `missing built image ${match[1]}`);
  }
});
