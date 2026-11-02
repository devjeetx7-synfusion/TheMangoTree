/**
 * Responsive/static layout audit. jsdom has no layout engine, so this checks
 * the CSS breakpoints, flexible grids and touch-target rules that drive the
 * responsive layouts at 320/360/390/430/768/1024/1440 px, and verifies that
 * the shared chrome behaves correctly when the viewport width changes.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createApp, click } from './helpers.mjs';

const ROOT = process.cwd();
const css = readFileSync(path.join(ROOT, 'src/styles/main.css'), 'utf8');

test('CSS covers every requested viewport width with a matching breakpoint', () => {
  const breakpoints = [...css.matchAll(/@media \(max-width:\s*(\d+)px\)/g)].map((match) => Number(match[1]));
  for (const width of [320, 360, 390, 430, 768, 1024]) {
    assert.ok(breakpoints.some((bp) => bp >= width), `no media query covers ${width}px`);
  }
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /min-width:\s*0/);
});

test('new interactive elements keep >=44px touch targets and flexible grids', () => {
  assert.match(css, /\.nav-toggle\s*\{[^}]*width:\s*44px;[\s\S]*?height:\s*44px/);
  assert.match(css, /\.cart-toggle\s*\{[^}]*width:\s*44px;[\s\S]*?height:\s*44px/);
  assert.match(css, /\.lightbox__nav\s*\{[^}]*width:\s*48px;[\s\S]*?height:\s*48px/);
  assert.match(css, /\.cart-row__qty button\s*\{[^}]*width:\s*44px;[\s\S]*?height:\s*44px/);
  assert.match(css, /\.contact-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(0, 1fr\)/);
  assert.match(css, /\.cart-row\s*\{[^}]*grid-template-columns:\s*56px minmax\(0, 1fr\)/);
  assert.match(css, /\.mobile-nav\s*\{[\s\S]*?max-height:\s*calc\(100dvh - var\(--header-h\)\)/);
});

test('mobile drawer closes when the viewport grows to desktop size', async () => {
  const { window, document } = await createApp('/');
  Object.defineProperty(window, 'innerWidth', { value: 390, configurable: true });
  click(window, document.querySelector('.nav-toggle'));
  assert.ok(document.querySelector('.mobile-nav').classList.contains('is-open'));
  Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
  window.dispatchEvent(new window.Event('resize'));
  assert.ok(!document.querySelector('.mobile-nav').classList.contains('is-open'));
  assert.ok(!document.body.classList.contains('is-locked'));
});
