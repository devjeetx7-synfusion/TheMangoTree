/**
 * Asset integrity check.
 *
 * Verifies that every photograph referenced by the site exists as a responsive
 * WebP set, that no two dishes share an image, and that no oversized files slip
 * into /public/images. Run with `--warn` to report without failing the build.
 */
import { readFile, stat } from 'node:fs/promises';
import { deepStrictEqual } from 'node:assert/strict';
import path from 'node:path';
import { dishes, categories } from '../src/data/menu.js';
import { galleryPhotos, homeGalleryPhotos, aboutPhotos, heroPhoto } from '../src/data/photography.js';
import imageManifest from '../src/data/images.js';

const ROOT = process.cwd();
const IMAGE_DIR = path.join(ROOT, 'public', 'images');
const MAX_BYTES = 400 * 1024; // no single web image should exceed 400 KB

const warnOnly = process.argv.includes('--warn');
const problems = [];
const warnings = [];

const fileSize = async (file) => {
  try {
    return (await stat(file)).size;
  } catch {
    return null;
  }
};

let manifest = {};
try {
  manifest = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'images.json'), 'utf8'));
} catch {
  problems.push('src/data/images.json is missing — run `npm run images`.');
}

// The browser imports images.js, while the tooling reads images.json. Both must
// describe the same photographs or `srcset()` would point at wrong variants.
try {
  deepStrictEqual(imageManifest, manifest);
} catch {
  problems.push('src/data/images.js is out of sync with src/data/images.json — run `npm run images`.');
}

const required = new Map(); // base -> list of "where" labels

const register = (base, where) => {
  if (!base) return;
  if (!required.has(base)) required.set(base, []);
  required.get(base).push(where);
};

register(heroPhoto.base, 'homepage hero');
aboutPhotos.forEach((photo) => register(photo.base, 'story collage'));
galleryPhotos.forEach((photo) => register(photo.base, 'gallery / lightbox'));
homeGalleryPhotos.forEach((photo) => register(photo.base, 'homepage gallery teaser'));
dishes.forEach((dish) => register(dish.image, `dish "${dish.name}"`));
categories.forEach((category) => register(category.image, `category "${category.name}"`));

// The homepage hero markup hard-codes these two filenames as well.
register('og-cover', 'social share cover (JPEG, not WebP)');

const seenImages = new Map();
for (const dish of dishes) {
  if (!seenImages.has(dish.image)) seenImages.set(dish.image, []);
  seenImages.get(dish.image).push(dish.name);
}

for (const [base, where] of required.entries()) {
  if (base === 'og-cover') {
    const size = await fileSize(path.join(IMAGE_DIR, 'og-cover.jpg'));
    if (size === null) problems.push('Missing public/images/og-cover.jpg (social share image).');
    continue;
  }
  const entry = manifest[base];
  if (!entry) {
    problems.push(`Missing source photograph for ${base} — used by ${where.slice(0, 3).join(', ')}${where.length > 3 ? ` +${where.length - 3} more` : ''}.`);
    continue;
  }
  for (const width of entry.variants ?? []) {
    const file = path.join(IMAGE_DIR, `${base}-${width}.webp`);
    const size = await fileSize(file);
    if (size === null) {
      problems.push(`Missing generated file ${path.relative(ROOT, file)}.`);
      continue;
    }
    if (size > MAX_BYTES) {
      warnings.push(`${path.relative(ROOT, file)} is ${Math.round(size / 1024)} KB (over 400 KB).`);
    }
  }
  if (!entry.variants?.length) problems.push(`${base} has no generated variants.`);
  if (entry.colour === undefined) warnings.push(`${base} is missing an average colour for the placeholder.`);
}

for (const [base, names] of seenImages.entries()) {
  if (names.length > 1) problems.push(`The same photograph (${base}) is used for several dishes: ${names.join(', ')}.`);
}

// Data-integrity checks for the routed site.
const slugs = new Set();
for (const dish of dishes) {
  if (!dish.slug || !/^[a-z0-9-]+$/.test(dish.slug)) problems.push(`Dish "${dish.name}" has no URL-safe slug.`);
  if (slugs.has(dish.slug)) problems.push(`Duplicate dish slug: ${dish.slug}.`);
  slugs.add(dish.slug);
}
for (const photo of [...galleryPhotos, ...aboutPhotos, heroPhoto]) {
  if (!photo.alt?.trim()) problems.push(`Photograph ${photo.base} is missing alt text.`);
}
for (const photo of galleryPhotos) {
  if (!photo.caption?.trim()) problems.push(`Gallery photograph ${photo.base} is missing a caption.`);
  if (!/illustrative/i.test(photo.caption)) warnings.push(`Gallery caption for ${photo.base} should disclose that the photo is illustrative.`);
}
for (const photo of homeGalleryPhotos) {
  if (!galleryPhotos.includes(photo)) problems.push('Homepage gallery teaser contains a photo not present on the gallery page.');
}

for (const [base] of Object.entries(manifest)) {
  if (!required.has(base) && base !== 'og-cover') warnings.push(`${base} is generated but not referenced by the site.`);
}

const total = Object.keys(manifest).length;
const line = (ok, message) => console.log(`${ok ? '  ✓' : '  ✗'} ${message}`);

console.log(`\nImage check — ${total} photographs, ${required.size} references\n`);

if (!problems.length && !warnings.length) {
  console.log(`  ✓ All ${required.size} referenced images are present with responsive variants.`);
}

problems.forEach((message) => line(false, message));
warnings.forEach((message) => console.log(`  ! ${message}`));

console.log(
  `\n${problems.length} problem(s), ${warnings.length} warning(s).\n`
);

if (problems.length && !warnOnly) {
  console.error('Asset check failed. Run `npm run images` after adding photographs to assets-src.\n');
  process.exit(1);
}
