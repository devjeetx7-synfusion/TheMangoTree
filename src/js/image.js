// Import the manifest as a JavaScript module, never as .json: browsers reject
// an application/json response for an ES module ("strict MIME type checking"),
// which aborts the entire module graph on a plain static server.
import manifest from '../data/images.js';

/** Respect Vite's base; fall back to '/' when the source is served without Vite. */
const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/';

/** Branded inline placeholder used if a photograph fails to load. */
export const PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="Photograph unavailable">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1d4a36"/><stop offset="1" stop-color="#0e2a1f"/>
      </linearGradient></defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <g fill="none" stroke="#F4B942" stroke-width="6" opacity=".85" transform="translate(400 270)">
        <path d="M0 90V-10"/><path d="M0 10C-46 10-70-14-70-48c34 0 70 18 70 58Z"/>
        <path d="M0-6c46 0 70-24 70-58-34 0-70 18-70 58Z"/>
      </g>
      <text x="400" y="430" text-anchor="middle" fill="#FFF8EB" font-family="Georgia,serif" font-size="30">The Mango Tree Cafe</text>
      <text x="400" y="470" text-anchor="middle" fill="#c9d3bf" font-family="Helvetica,Arial,sans-serif" font-size="18" letter-spacing="2">PHOTOGRAPH COMING SOON</text>
    </svg>`
  );

export const imageInfo = (base) => manifest[base];

/** Build a srcset string from the generated variant widths. */
export function srcset(base) {
  const info = manifest[base];
  if (!info) return '';
  return info.variants.map((width) => `${BASE}images/${base}-${width}.png ${width}w`).join(', ');
}

export function largest(base, width) {
  const info = manifest[base];
  if (!info) return '';
  const available = info.variants;
  const chosen = available.find((w) => w >= width) ?? available[available.length - 1];
  return `${BASE}images/${base}-${chosen}.png`;
}

/** Largest available variant — used by the lightbox and its full-size link. */
export const fullSize = (base) => largest(base, 1200);

/**
 * Responsive <img> markup.
 * Intrinsic width/height come from the manifest so the browser reserves space
 * before the bytes arrive (prevents layout shift).
 */
export function img(base, {
  alt = '',
  sizes = '100vw',
  className = '',
  eager = false,
  position = '',
  base: _unused,
} = {}) {
  const info = manifest[base];
  if (!info) {
    return `<img class="img-fallback ${className}" src="${PLACEHOLDER}" alt="${escapeAttr(alt)}" width="800" height="600" loading="lazy" decoding="async" />`;
  }
  const width = info.width;
  const height = info.height;
  const style = position ? ` style="object-position:${position}"` : '';
  return `<img class="${className}" src="${largest(base, 768)}" srcset="${srcset(base)}" sizes="${sizes}" width="${width}" height="${height}" alt="${escapeAttr(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="${eager ? 'sync' : 'async'}" ${eager ? 'fetchpriority="high"' : ''}${style} />`;
}

/**
 * Decorative container that paints the photograph's average colour while the
 * image loads, so sections never flash white.
 */
export function ratioStyle(base, fallbackRatio = 4 / 3) {
  const info = manifest[base];
  if (!info) return `--ratio:${fallbackRatio}`;
  return `--ratio:${(info.width / info.height).toFixed(4)};background-color:${info.colour}`;
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

let imageGuardReady = false;

/** Replace broken images anywhere in the document with the branded placeholder. */
export function guardImages() {
  if (imageGuardReady) return;
  imageGuardReady = true;
  const swap = (image) => {
    if (image.dataset.failed) return;
    image.dataset.failed = 'true';
    image.removeAttribute('srcset');
    image.src = PLACEHOLDER;
    image.classList.add('img-fallback');
  };
  window.addEventListener(
    'error',
    (event) => {
      if (event.target instanceof HTMLImageElement) swap(event.target);
    },
    true
  );
  // Images that fail after this point are caught by the capture-phase listener
  // above. We intentionally do not pre-scan `complete` images: a not-yet-loaded
  // or src-less image would otherwise be replaced with a false positive.
}
