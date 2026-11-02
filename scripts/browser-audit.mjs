/**
 * Optional real-browser audit (Chromium via puppeteer-core).
 *
 *   npm install --no-save puppeteer-core @sparticuz/chromium
 *   npm run preview
 *   AWS_EXECUTION_ENV=AWS_Lambda_nodejs22.x npm run test:browser
 *
 * It verifies real image loads, console errors, horizontal overflow at seven
 * viewport widths, clean routes, lightbox/menu/mobile/WhatsApp interactions and
 * writes screenshots to .arena/shots (excluded from Git).
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.AUDIT_URL || 'http://localhost:4173';
const WIDTHS = [320, 360, 390, 430, 768, 1024, 1440];
const ROUTES = [
  '/',
  '/menu',
  '/menu/',
  '/menu/margherita-pizza',
  '/gallery',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/not-a-page',
  '/menu.html?category=desserts',
  '/dish.html?id=margherita-pizza',
];
const SHOTS = path.join(process.cwd(), '.arena', 'shots');

let puppeteer;
let chromium;
try {
  puppeteer = (await import('puppeteer-core')).default;
  chromium = (await import('@sparticuz/chromium')).default;
} catch {
  console.log('Browser audit skipped: install with `npm install --no-save puppeteer-core @sparticuz/chromium`.');
  process.exit(0);
}

const executablePath = await chromium.executablePath();
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: [...chromium.args, '--no-sandbox'],
  env: {
    ...process.env,
    LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || '/tmp/al2023/lib',
    FONTCONFIG_PATH: process.env.FONTCONFIG_PATH || '/tmp/fonts',
  },
});

const problems = [];
const stats = { pages: 0, images: 0, widths: 0, links: 0, interactions: 0, screenshots: 0 };
const external = (url) => !url.startsWith(BASE) && !url.startsWith('data:') && !url.startsWith('blob:');

async function newPage(width, height = 900) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  // Font CDN requests fail fast in this offline sandbox; the CSS ships with
  // system-font fallbacks, so we only ignore those expected network errors.
  page.on('console', (message) => {
    if (message.type() === 'error' && !/net::ERR|fonts\.googleapis|fonts\.gstatic/.test(message.text())) {
      problems.push(`console error @${width}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => problems.push(`page error @${width}: ${error.message}`));
  page.on('requestfailed', (request) => {
    if (!external(request.url())) problems.push(`local request failed @${width}: ${request.url()}`);
  });
  return page;
}

async function open(page, route) {
  const response = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  if (!response || response.status() >= 400) problems.push(`${route} returned HTTP ${response?.status()}`);
  await page.waitForFunction(
    () => document.documentElement.dataset.appReady === 'true' && Boolean(document.querySelector('#main h1')),
    { timeout: 15_000 }
  );
  stats.pages += 1;
  return response;
}

async function auditPage(page, width, route) {
  // Trailing slashes and legacy bookmarks must canonicalise without a loop.
  const canonical = await page.evaluate(() => `${location.pathname}${location.search}`);
  const expected = {
    '/menu/': '/menu',
    '/menu.html?category=desserts': '/menu?category=desserts',
    '/dish.html?id=margherita-pizza': '/menu/margherita-pizza',
  }[route];
  if (expected && canonical !== expected) {
    problems.push(`${route} @${width}: canonical URL is ${canonical}, expected ${expected}`);
  }

  const structure = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return {
      title: document.title,
      h1: document.querySelector('#main h1')?.textContent ?? '',
      emptyLinks: anchors.filter((a) => !a.hasAttribute('href') || a.getAttribute('href') === '#').length,
      internalHrefs: anchors.map((a) => a.getAttribute('href')).filter((href) => href && /^\//.test(href)),
      deadHrefs: anchors
        .map((a) => a.getAttribute('href'))
        .filter((href) => href && /^\//.test(href) && !window.TMT.resolve(new URL(href, location.href)).name)
        .length,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      bodyScrollWidth: document.body.scrollWidth,
    };
  });
  stats.links += structure.internalHrefs.length;
  if (structure.emptyLinks) problems.push(`${route} @${width}: ${structure.emptyLinks} empty links`);
  if (structure.deadHrefs) problems.push(`${route} @${width}: ${structure.deadHrefs} unresolved links`);
  if (!structure.h1.trim()) problems.push(`${route} @${width}: missing h1`);

  // Force lazy images to load and verify every one has real pixels.
  await page.evaluate(() => document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; }));
  const images = await page.evaluate(async () => {
    const list = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      list.map((image) =>
        image.complete && image.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((resolve) => {
              image.addEventListener('load', resolve, { once: true });
              image.addEventListener('error', resolve, { once: true });
              setTimeout(resolve, 6000);
            })
      )
    );
    return list.map((image) => ({ src: image.currentSrc || image.src, ok: image.complete && image.naturalWidth > 0, alt: image.getAttribute('alt') }));
  });
  stats.images += images.length;
  const broken = images.filter((image) => !image.ok);
  if (broken.length) problems.push(`${route} @${width}: broken images ${broken.map((i) => i.src).join(', ')}`);

  // Horizontal scroll must be impossible even after trying to scroll right.
  await page.evaluate(() => window.scrollTo(9999, window.scrollY));
  const scrollX = await page.evaluate(() => window.scrollX);
  if (structure.scrollWidth > structure.innerWidth + 1 || scrollX > 1) {
    problems.push(`${route} @${width}: horizontal overflow (scrollWidth ${structure.scrollWidth} vs ${structure.innerWidth}, scrollX ${scrollX})`);
  }
  return structure;
}

try {
  await mkdir(SHOTS, { recursive: true });

  // 1. Every route at every requested viewport width.
  for (const width of WIDTHS) {
    const page = await newPage(width);
    for (const route of ROUTES) {
      if (process.env.AUDIT_VERBOSE) console.log(`  → ${width}px ${route}`);
      await open(page, route);
      await auditPage(page, width, route);
      if (width === 390 || width === 1440) {
        if (['/', '/menu', '/gallery', '/contact', '/not-a-page'].includes(route)) {
          await page.screenshot({ path: path.join(SHOTS, `${width}-${route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')}.png`), fullPage: false });
          stats.screenshots += 1;
        }
      }
    }
    stats.widths += 1;
    await page.close();
  }

  // 2. Real interaction checks at mobile and desktop widths.
  for (const width of [390, 1440]) {
    const page = await newPage(width);

    await open(page, '/gallery');
    await page.click('[data-lightbox-index="2"]');
    const opened = await page.$eval('.lightbox', (el) => el.classList.contains('is-open'));
    const before = await page.$eval('[data-lightbox-counter]', (el) => el.textContent);
    await page.keyboard.press('ArrowRight');
    const after = await page.$eval('[data-lightbox-counter]', (el) => el.textContent);
    await page.keyboard.press('Escape');
    const closed = await page.$eval('.lightbox', (el) => !el.classList.contains('is-open'));
    if (!opened || before === after || !closed) problems.push(`lightbox controls failed @${width}`);
    stats.interactions += 1;

    await open(page, '/menu');
    await page.click('[data-chip="pizza"]');
    const pizzaCount = await page.$$eval('[data-menu-grid] .dish-card', (els) => els.length);
    await page.type('[data-search]', 'margherita');
    await page.waitForFunction(() => document.querySelectorAll('[data-menu-grid] .dish-card').length === 1, { timeout: 5000 });
    if (pizzaCount !== 3) problems.push(`menu filter failed @${width} (${pizzaCount} pizza dishes)`);
    stats.interactions += 1;

    if (width <= 920) {
      await open(page, '/');
      await page.click('.nav-toggle');
      const navOpen = await page.$eval('.mobile-nav', (el) => el.classList.contains('is-open'));
      await page.click('.mobile-nav a[href="/gallery"]');
      await page.waitForFunction(() => location.pathname === '/gallery', { timeout: 5000 });
      const navClosed = await page.$eval('.mobile-nav', (el) => !el.classList.contains('is-open'));
      if (!navOpen || !navClosed) problems.push(`mobile navigation failed @${width}`);
      stats.interactions += 1;
    }

    await open(page, '/menu');
    await page.evaluate(() => {
      const original = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function patched() {
        if (this.hostname === 'wa.me') { window.__lastWaHref = this.href; return undefined; }
        return original.call(this);
      };
      window.TMT.site.whatsapp = '919876543210';
    });
    await page.click('[data-order-card="margherita-pizza"]');
    const order = await page.evaluate(() => ({
      href: window.__lastWaHref || '',
      message: window.TMT.whatsapp.getLastOrder()?.message || '',
    }));
    if (!order.href.startsWith('https://wa.me/919876543210?text=') || !order.message.includes('Margherita Pizza × 1')) {
      problems.push(`WhatsApp order flow failed @${width}`);
    }
    stats.interactions += 1;

    await open(page, '/not-a-page');
    const notFound = await page.evaluate(() => ({
      heading: document.querySelector('#main h1').textContent,
      robots: document.querySelector('meta[name="robots"]').content,
    }));
    if (!/isn’t on the menu/.test(notFound.heading) || notFound.robots !== 'noindex') {
      problems.push(`custom 404 failed @${width}`);
    }
    stats.interactions += 1;

    await page.close();
  }
} finally {
  await browser.close();
}

console.log('\nBrowser audit');
console.log(`  ${stats.pages} page loads · ${stats.widths} viewport widths · ${stats.links} internal links checked`);
console.log(`  ${stats.images} images verified · ${stats.interactions} interaction checks · ${stats.screenshots} screenshots`);
if (problems.length) {
  console.log(`  ✗ ${problems.length} problem(s):`);
  problems.forEach((problem) => console.log(`    - ${problem}`));
  process.exit(1);
}
console.log('  ✓ no console errors, broken images, dead links or horizontal overflow\n');
