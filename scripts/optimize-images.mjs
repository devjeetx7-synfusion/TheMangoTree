/**
 * Build the web image set from the source photography in /assets-src.
 *
 *  - Writes responsive WebP variants (480 / 768 / 1200 px wide, never upscaled)
 *  - Records intrinsic dimensions + average colour in src/data/images.json so the
 *    UI can reserve space (no layout shift) and paint a matching placeholder
 *  - Creates an Open Graph cover image
 *
 * Run with: npm run images
 */
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'assets-src');
const OUT_DIR = path.join(ROOT, 'public', 'images');
const MANIFEST = path.join(ROOT, 'src', 'data', 'images.json');
const WIDTHS = [480, 768, 1200];
const SOURCE_EXT = /\.(jpe?g|png|webp)$/i;

const round = (n) => Math.round(n);

async function averageColour(file) {
  const { data } = await sharp(file).resize(1, 1, { fit: 'cover' }).raw().toBuffer({ resolveWithObject: true });
  const [r, g, b] = data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let files;
  try {
    files = (await readdir(SRC_DIR)).filter((f) => SOURCE_EXT.test(f)).sort();
  } catch {
    console.error(`No source photography folder found at ${SRC_DIR}`);
    process.exit(1);
  }

  const manifest = {};
  let written = 0;
  let bytes = 0;

  for (const file of files) {
    const base = file.replace(SOURCE_EXT, '');
    const input = path.join(SRC_DIR, file);
    const meta = await sharp(input).metadata();
    const variants = [];

    for (const width of WIDTHS) {
      if (meta.width && width > meta.width + 8) continue;
      const outFile = path.join(OUT_DIR, `${base}-${width}.webp`);
      await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 76, effort: 5, smartSubsample: true })
        .toFile(outFile);
      const info = await stat(outFile);
      written += 1;
      bytes += info.size;
      variants.push(width);
    }

    const lastWidth = variants[variants.length - 1] ?? meta.width;
    manifest[base] = {
      width: lastWidth,
      height: round((lastWidth / meta.width) * meta.height),
      sourceWidth: meta.width,
      sourceHeight: meta.height,
      variants,
      colour: await averageColour(input),
    };

    console.log(`✓ ${base.padEnd(30)} ${variants.join(', ')}px`);
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  // Social share cover (JPEG: universally supported by link previews).
  const heroSource = path.join(SRC_DIR, 'hero-spread.jpg');
  try {
    await sharp(heroSource)
      .resize(1200, 630, { fit: 'cover', position: 'right' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(OUT_DIR, 'og-cover.jpg'));
    console.log('✓ og-cover.jpg (1200×630)');
  } catch {
    console.warn('! hero-spread.jpg missing — skipped OG cover.');
  }

  console.log(
    `\n${Object.keys(manifest).length} images · ${written} WebP files · ${(bytes / 1024 / 1024).toFixed(2)} MB`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
