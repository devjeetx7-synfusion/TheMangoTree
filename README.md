# The Mango Tree Cafe — website

A cinematic, mobile-first cafe website for **The Mango Tree Cafe**, Chhapra, Bihar — built with Vite, vanilla JavaScript and a locally hosted, responsive WebP image set.

> **Illustrative imagery & sample menu**
> Every photograph on this site is illustrative food/ambience photography, **not** a photograph of the real cafe. Dish names, descriptions, ingredients, allergens and prices are editable **sample data**. Both disclosures are shown in the gallery, dish pages and footer — please keep them until real content is supplied.

---

## What's included

| Page | File | Highlights |
| --- | --- | --- |
| Home | `index.html` | Hero, category grid, featured dishes, signature-dish carousel, brand story, photo gallery + lightbox, sample reviews, visit/contact, footer |
| Full menu | `menu.html` | Sticky category filters, live search, 15 sample dishes, deep links (`menu.html?category=pizza`), WhatsApp order buttons |
| Dish detail | `dish.html?id=<dish-id>` | Large photograph, description, sample ingredients/allergens, size + extras, quantity, live total, special requests, WhatsApp order, related dishes |
| 404-style state | `dish.html?id=unknown` | Friendly empty state with a route back to the menu |

**Brand palette** — Forest green `#173D2D`, mango yellow `#F4B942`, warm cream `#FFF8EB`, with an accessible amber `#8A5A14` for text accents on cream.

Typography: *Playfair Display* (headings, Google Fonts) and *DM Sans* (body, Google Fonts), with system fallbacks so the layout stays intact offline.

---

## Quick start

```bash
npm install          # installs Vite, sharp and jsdom (dev only)
npm run images       # builds responsive WebP assets from /assets-src
npm run dev          # http://localhost:5173
npm run build        # verifies assets, then bundles to /dist
npm run preview      # serve the production build
npm test             # WhatsApp + DOM smoke tests
npm run verify       # image integrity check
```

Node 20+ is recommended (developed on Node 22).

---

## Editing content

### Cafe details, WhatsApp number, socials
`src/data/site.js`

```js
whatsapp: '919876543210', // digits only, with country code, no + or spaces
phone: '+91 …',
address: '…',
hours: 'Mon–Sun · 10:00–23:00',
```

Until `whatsapp` is filled in, order buttons **do not pretend to place an order**: they copy the ready-to-send order text to the clipboard and explain that WhatsApp ordering is not connected yet. Add the number and every button becomes a real `wa.me` deep link (menu cards, dish page, header, hero and footer).

### Menu items and prices
`src/data/menu.js` — the single source of truth for categories, dishes, prices, descriptions, diets, tags and customisation options.

```js
{
  id: 'margherita-pizza',          // used in dish.html?id=…
  name: 'Margherita Pizza',
  category: 'pizza',
  price: 249,                      // sample price — edit freely
  diet: 'veg',                     // 'veg' | 'non-veg'
  tags: ['Classic'],               // first tag becomes the card ribbon
  description: '…',                // card copy
  story: '…',                      // dish-page copy
  ingredients: ['…'],              // clearly labelled as sample
  allergens: 'Sample list: gluten, milk.',
  serves: 'Serves 1–2',
  image: 'pizza-margherita',       // base name in /public/images
}
```

Category ordering, homepage features and the signature carousel live in the same file (`categories`, `featuredIds`, `signatureSlides`).

### Photography used on the homepage
`src/data/photography.js` — hero, about collage, gallery order and captions.

---

## Images

```
assets-src/           original photographs (source of truth)
public/images/        generated 480 / 768 / 1200 px WebP variants + og-cover.jpg
src/data/images.json  generated manifest: intrinsic size, variants, average colour
scripts/optimize-images.mjs
```

`npm run images` reads every image in `assets-src/`, strips metadata, writes responsive WebP files (quality 76, never upscaled) and records each photo's dimensions plus average colour. The UI uses that manifest to:

* set `width`/`height` on every `<img>` → **no layout shift**;
* paint the photo's average colour as a placeholder;
* generate `srcset`/`sizes` so phones never download desktop-sized files.

To add or replace a photo: drop a `.jpg`/`.png`/`.webp` into `assets-src/` using a meaningful kebab-case filename (e.g. `momos-tandoori.jpg`), update the matching `image` value in the data file, then run `npm run images`. `npm run build` fails if any referenced photo is missing its variants, if two dishes share the same photo, or if a single web image exceeds 400 KB.

### Licensing / provenance
The photographs in this repository were produced specifically for this design preview and are committed with it, so there are no third-party hotlinks, expiring URLs or attribution requirements. **They are illustrative, not photographs of the real cafe.** Before launch, replace them with the cafe's own photography (preferred) or properly licensed stock images, and update the captions/disclosures accordingly. Do not present illustrative photography as the venue's own.

The build deliberately refuses to complete while a referenced photo is missing or when two dishes share one photograph, so an empty image slot can never ship unnoticed.

The current set is 19 photographs: 15 dish photographs (one per menu item), a hero spread, and three cafe ambience images used in the story block and gallery.

---

## Performance & reliability

* Responsive WebP with `srcset`/`sizes`; the hero is the only eagerly loaded image (`fetchpriority="high"`), everything below the fold is lazy-loaded.
* Fixed `width`/`height` + CSS `aspect-ratio` prevent layout shift; average-colour placeholders avoid white flashes.
* Hero and gallery markup are static; the menu and dish data are tiny ES modules (~35 KB JS gzipped in total, ~10 KB for the shared chunk).
* A capture-phase error handler swaps any failed image for a branded SVG fallback, so no broken-image icons can appear.
* Fonts are loaded with `display=swap` and preconnected; the layout uses local fallbacks if Google Fonts is blocked.

## Accessibility & mobile

* Semantic landmarks, skip link, one `<h1>` per page, labelled form controls and buttons, visible focus rings, `aria-live` status messages.
* Colour contrast checked for body, muted and accent text (amber `#8A5A14` replaces yellow for text on cream specifically to pass 4.5:1).
* Mobile: compact navigation drawer, sticky two-button action bar, 42–48 px touch targets, swipeable featured/quote rows, list-style menu cards, no horizontal scrolling (containers use `min-width: 0` and clipped decorative elements).
* Layouts designed for 320 / 360 / 375 / 390 / 414 / 430 px, plus tablet and desktop.
* `prefers-reduced-motion` disables transitions and reveal animations.

## Testing

```bash
npm test
```

* `tests/whatsapp.test.mjs` — phone normalisation, `wa.me` links, order-message content, option pricing, menu data validity.
* `tests/render.test.mjs` — bundles each page's real script with esbuild and runs it in jsdom, asserting rendered counts, deep links, signature carousel, category filtering, search, empty states, quantity/option totals, order-message content, unknown-dish handling, duplicate IDs, and that every rendered image has `alt`, `width`, `height` and a local `src`.
* `npm run verify` — every referenced photograph has its WebP variants, no photo is reused across dishes.

> Note: Chromium could not be downloaded in the build environment, so pixel-level browser screenshots were not captured here. The DOM tests exercise the same scripts and markup; a final visual pass in a real browser is recommended after replacing the photography.

## Deployment

`npm run build` emits a static site in `dist/` (`index.html`, `menu.html`, `dish.html`, `assets/`, `images/`, `favicon.svg`, `robots.txt`). Deploy to any static host (Netlify, Vercel, GitHub Pages, S3). Vite is configured with a relative `base` so the build also works from a sub-folder.

`og:image` is written as a relative path; set an absolute URL once the production domain is known.

## Repository notes

* `theme.xml` is the original single-page Blogger theme that predated this upgrade. It is left untouched for reference; the Vite site in `/src` + root HTML files replaces it. Delete it if you no longer need the Blogger version.
* Sample reviews on the homepage are written placeholder copy and labelled as such — they are not real customer feedback.
* No analytics, tracking or third-party scripts are included.

## Known limitations

* The cafe's real WhatsApp number, phone, address, opening hours and social links have not been supplied, so those fields show "to be confirmed" and WhatsApp ordering uses the clipboard fallback.
* Google Maps directions point to the Chhapra locality, not a verified street address.
* Prices, ingredients and allergens are sample data and must be confirmed with the cafe.
