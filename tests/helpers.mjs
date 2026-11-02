/**
 * jsdom harness for the routed site: bundles the real application entry with
 * esbuild, evaluates it in a DOM at a chosen URL, and captures external
 * navigation / clipboard side effects so interactions can be asserted.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { JSDOM, VirtualConsole } from 'jsdom';

const ROOT = process.cwd();
let bundleCode = null;

export async function appBundle() {
  if (bundleCode) return bundleCode;
  const result = await build({
    entryPoints: [path.join(ROOT, 'src/js/app.js')],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2020',
    logLevel: 'silent',
    define: { 'import.meta.env.BASE_URL': '"/"' },
  });
  bundleCode = result.outputFiles[0].text;
  return bundleCode;
}

export const tick = (ms = 25) => new Promise((resolve) => setTimeout(resolve, ms));

export async function createApp(url = '/') {
  const html = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => {
    if (!/Not implemented: navigation/.test(error.message)) errors.push(error.message);
  });
  virtualConsole.on('error', (message) => errors.push(String(message)));

  const dom = new JSDOM(html, {
    url: `http://localhost${url}`,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole,
  });
  const { window } = dom;

  window.matchMedia = () => ({
    matches: false,
    media: '',
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      this.callback([{ isIntersecting: true, target }], this);
    }
    unobserve() {}
    disconnect() {}
  };
  window.scrollTo = () => {};
  window.Element.prototype.scrollIntoView = () => {};

  // Capture WhatsApp deep-link clicks instead of trying to navigate in jsdom.
  window.__waClicks = [];
  const nativeAnchorClick = window.HTMLAnchorElement.prototype.click;
  window.HTMLAnchorElement.prototype.click = function patchedClick() {
    if (this.hostname === 'wa.me') {
      window.__waClicks.push(this.href);
      return undefined;
    }
    return nativeAnchorClick.call(this);
  };

  // Clipboard fallback used when no WhatsApp number is configured.
  window.__copied = '';
  Object.defineProperty(window.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (text) => { window.__copied = text; } },
  });

  window.eval(await appBundle());
  await tick();
  return { dom, window, document: window.document, errors };
}

export const click = (window, element) =>
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

export const key = (window, value, target = window.document) =>
  target.dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));

export const input = (window, element, value, type = 'input') => {
  element.value = value;
  element.dispatchEvent(new window.Event(type, { bubbles: true }));
};

/** Internal anchors in the rendered document (hash-only skip links excluded). */
export function internalLinks(document) {
  return Array.from(document.querySelectorAll('a[href]')).filter((link) => {
    const href = link.getAttribute('href');
    return href && !href.startsWith('#') && /^(\/|\.\/)/.test(href);
  });
}
