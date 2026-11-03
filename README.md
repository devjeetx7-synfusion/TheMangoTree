# The Mango Tree Cafe — website

A mobile-first, clean-route cafe website for **The Mango Tree Cafe**, Chhapra, Bihar — built with Vite, vanilla JavaScript and a locally hosted, responsive PNG image set.

> **Illustrative imagery & sample menu**
> Every photograph is illustrative food/ambience photography, **not** a photograph of the real cafe. Dish names, descriptions, ingredients, allergens and prices are editable **sample data**. Disclosures are shown on the gallery, dish, contact, legal and footer pages — please keep them until real content is supplied. Nothing on this site claims an order has been placed or confirmed.

---

## Routes

The site is a single-page app with a History API router (`src/js/router.js`). All links are generated from `src/js/links.js` and work with Back / Forward, deep links and page refresh (on hosts with an SPA fallback).

| Route | Page | Highlights |
| --- | --- | --- |
| `/` | Home | Cinematic photo hero, featured dishes, interactive category explorer, signature dish carousel, story teaser, gallery teaser, ambience quote, visit panel |
| `/menu` | Complete food menu | Category filters, live search, deep links (`/menu?category=pizza&q=…`), dish cards, order bag |
| `/menu/[slug]` | Dish detail | Photograph + lightbox, sample ingredients/allergens, options, quantity, live sample subtotal, WhatsApp order, related dishes |
| `/gallery` | Photo gallery | Full illustrative photo set, lightbox with prev/next/close, keyboard controls, full-size image link |
| `/about` | About the cafe | Story, illustrative collage, links to menu/gallery/contact |
| `/contact` | Contact | Config-driven phone/email/address/hours, WhatsApp contact, directions and socials only when configured |
| `/privacy`, `/terms` | Published legal pages | Honest preview-site policies, linked from the footer |
| anything else | Custom 404 | Includes invalid `/menu/[slug]` URLs; `noindex` + working links home/menu/gallery/contact |

Legacy bookmarks (`/index.html`, `/menu.html?…`, `/dish.html?id=…`) redirect to the canonical clean route. A Vite dev/preview middleware in `vite.config.mjs` serves the SPA shell for the old `.html` paths so no static `menu.html` can shadow the `/menu` route. On production hosts, the SPA fallback does the same.

---

## Design system

One stylesheet (`src/styles/main.css`) drives every page: custom properties for
colour, type, spacing, radii, shadows and easing, then a small set of reusable
component classes that the page views compose. Nothing is styled ad-hoc in JS.

| Token group | Values |
| --- | --- |
| Colour | forest green `#173D2D` (with `#0E2A1F` deep / `#081C14` ink / `#23513B` soft), mango `#F4B942` (light `#FFD785`, `#8A5A14` amber for text), warm cream `#FFF8EB` (`#F9F0DD`, `#F0E2C8`), ink `#221A13`, muted `#6B5C4D`, WhatsApp `#17864A`, hairline borders, three shadow steps |
| Type | Fraunces (serif display, 100–900 + italic) for headings, numbers and pull quotes; DM Sans (sans body) for prose, labels and UI. Fluid `clamp()` scale, `text-wrap: balance` on headings, `pretty` on paragraphs |
| Space & shape | `--gutter` 20 → 40 px, `--section-y` fluid section rhythm, `--container` 1240 px, 8–20 px radii (no pill-shaped cards), 1 px hairline borders |
| Motion | three keyframe sets (`heroRise`, `drawerIn`, `fadeIn`), 180–320 ms transitions on hover/focus, one shared `--ease` curve, `.reveal` scroll-in that is fail-open, full `prefers-reduced-motion` override |

Reusable components: `.btn` (`--mango`, `--green`, `--wa`, `--ghost`,
`--outline-light`, `--ghost-dark`, `--sm`, `--lg`, `--block`),
`.link-arrow`, `.eyebrow`, `.lead`, `.fine-print`, `.icon-btn`, `.chip`,
`.cat-tab`, `.dish-card`, `.gallery-tile`, `.signature`, `.order-card`,
`.option`, `.qty`, `.cart-row`, `.visit-panel`, `.principle`, `.toast`,
`.lightbox` and the header/drawer/footer chrome. Interactive states are styled
once (`:hover` behind `@media (hover: hover)`, `:focus-visible` with a green ring
on cream and a mango ring on the dark bands).

---

## Quick start

```bash
npm install          # Vite, esbuild, sharp, jsdom (dev only)
npm run dev          # http://localhost:5173 (Vite dev server — recommended)
npm run build        # verify assets → bundle to /dist → write dist/404.html
npm run preview      # serve the production build at :4173
npm run serve        # dependency-free static server for raw source at :8080
npm test             # route/link/image, interaction, WhatsApp, responsive and build tests
npm run verify       # image + menu-data integrity check
npm run check        # test + verify + build
npm run images       # rebuild responsive WebP assets from /assets-src
npm run test:browser # optional real-Chromium audit (see Testing)
```

Node 20+ is recommended (developed on Node 22).

### Which server should be running? (the `:8080` trap)

Vite is configured for **5173** (`dev`) and **4173** (`preview`). There is no Vite
config for 8080. If you see the site at `http://localhost:8080/index.html`, a
generic static file server (for example `python -m http.server 8080`) is serving
the repository root — not Vite and not `dist/`. That used to produce a page with
only the header, the illustrative-photography disclaimer, the footer and the
bottom action bar: `<main id="main">` is filled by JavaScript, and the module
graph aborted before `app.js` could mount the router.

Two things were wrong and are now fixed in code:

1. `src/js/image.js` imported `../data/images.json` directly. Browsers enforce
   strict MIME checking on ES modules, so an `application/json` response aborts
   the entire graph. The manifest is now a generated JS module
   (`src/data/images.js`), kept in sync with `images.json` by `npm run images`
   and checked by `npm run verify`.
2. `src/js/links.js` and `src/js/image.js` read `import.meta.env.BASE_URL`
   unguarded. That object only exists after Vite transforms the module; in native
   ESM it throws and prevents `initRouter()` / `renderCurrent()` from running.
   Both now fall back to `/`.

A plain static server aimed at the repo root also 404s `/images/*`,
`/favicon.svg` and `/robots.txt` (they live in `public/`) and 404s clean routes
on refresh. `npm run serve` is a tiny dependency-free server that fixes both:
it exposes `public/` at the site root and falls back to `index.html` for SPA
routes. Run it instead of `python -m http.server` if you want to serve the raw
source on 8080. The canonical options remain `npm run dev` (5173) or
`npm run build && npm run preview` (4173, serving `dist/`).

---

## Editing content

### Cafe details, WhatsApp number, socials — `src/data/site.js`

```js
whatsapp: '',   // digits only incl. country code, e.g. '919876543210'
phone: '',      // becomes a tel: link only when set
email: '',      // becomes a mailto: link only when set
address: '',    // shown as "to be confirmed" until supplied
hours: '',
mapsUrl: '',    // directions link appears only when BOTH address and mapsUrl are set
instagram: '',  // only real https:// profile URLs become links
facebook: '',
```

Until `whatsapp` is filled in, order buttons **do not pretend to place an order**: they copy the exact ready-to-send order text to the clipboard and explain that WhatsApp ordering is not connected yet. Add the number and every button becomes a real `https://wa.me/…?text=…` deep link (Android app link / desktop browser). No contact information or social profile is invented; unconfigured fields show a clear "to be confirmed" state.

The cafe confirms availability, customisation, the final price and the order **in the WhatsApp chat**. The site never shows a fake order confirmation.

### Menu items and prices — `src/data/menu.js`

The single source of truth for categories, dishes, prices, descriptions, diets, tags, photos, customisation options and `slug` (the `/menu/[slug]` identifier).

```js
{
  id: 'margherita-pizza',      // also used as `slug`
  name: 'Margherita Pizza',
  category: 'pizza',
  price: 249,                  // sample price — edit freely
  description: '…', story: '…', ingredients: ['…'], allergens: '…', serves: '…',
  image: 'pizza-margherita',   // base name in /public/images
}
```

Category filters, the desktop dropdown, homepage features, the signature carousel, dish pages, related dishes, the order bag and WhatsApp messages all read from this file. `npm run verify` fails on a missing photo, a reused dish photo, an invalid slug or missing alt text/captions.

### Photography — `src/data/photography.js`

Hero, story collage, gallery order/captions and the two lightbox groups (home teaser / full gallery). Alt text and captions are written as **illustrative** so stock-style imagery is never presented as the cafe's own.

---

## Images

```
assets-src/           original photographs (source of truth)
public/images/        generated 480 / 768 / 1200 px WebP variants + og-cover.jpg
src/data/images.json  generated manifest: intrinsic size, variants, average colour
scripts/optimize-images.mjs
```

`npm run images` generates the responsive WebP set and manifest. The UI uses the manifest to set `width`/`height`, paint an average-colour placeholder, and build `srcset`/`sizes` so images are never stretched (`object-fit: cover`) and phones download the right variant. A capture-phase error handler swaps any failed photograph for a branded SVG fallback.

Gallery tiles and the dish hero are real `<button>` elements wired to a lightbox (`src/js/ui.js`) that supports next / previous / close, Escape, ← / →, a full-size image link and focus management. Decorative story/hero images are deliberately **not** interactive.

`npm run build` fails if a referenced photo or variant is missing, if two dishes share a photograph, or if a caption/alt disclosure is missing.

---

## WhatsApp ordering & the order bag

`src/js/whatsapp.js` is the single ordering module:

* `waLink(number, message)` — normalises the configured number and URL-encodes the message.
* `buildOrderMessage(lines, options)` — accepts one dish or every cart line; prints each dish, quantity, chosen options, notes, unit price, line total and a correctly calculated **website sample subtotal**.
* `openWhatsApp(message)` — opens a `wa.me` deep link via a real `<a target="_blank">` (works on Android and desktop); with no configured number it copies the message and shows an honest notice.
* `unitPrice()` / `optionLines()` / `orderSubtotal()` — sample price maths shared by the dish page, cart UI and tests.

`src/js/cart.js` holds a localStorage-backed multi-item order bag. "Order" buttons on cards, the signature carousel, the header/footer and the bag all include the correct dish (and existing bag lines) in the message. The bag is only a message builder — no payment, no confirmation.

---

## Navigation, accessibility & mobile

* Desktop nav with a click/keyboard-driven **Menu → categories** dropdown; mobile hamburger drawer closes on navigation, Escape and resize; header/footer links are `data-nav` marked with `aria-current`.
* Shared header/footer/mobile bar on every route; logo always returns to `/`.
* ≥44 px touch targets (invisible padding on dense text links so the layout still reads tight), scrollable drawer that starts below the header, `min-width: 0` grids, `overflow-x: clip`, and max-width refinements at 1080 / 920 / 820 / 768 / 720 / 560 / 430 / 420 / 375 / 340 px plus a 600–920 px tablet pass (covers 320, 360, 375, 390, 414, 430, 768, 1024 and 1440 px).
* Reduced-motion, `inert`-based cart drawer, focus returned to the trigger on close, focus trapped in the lightbox, and `Home` / `End` / swipe support in the lightbox.
* Semantic landmarks, skip link, labelled controls, `aria-live` status messages, visible focus rings, reduced-motion support and lightbox focus trapping.

---

## Testing

```bash
npm test
```

* `tests/whatsapp.test.mjs` — phone normalisation, encoded deep links, single/multi-item messages, option pricing, subtotals, graceful unconfigured state, menu data integrity.
* `tests/render.test.mjs` — every route renders, **every internal link resolves to a real page**, no `href="#"` / stale `.html` links, all images (and `srcset` variants) exist with `alt`/`width`/`height`, no duplicate IDs, no console errors, legacy redirects, custom 404.
* `tests/interactions.test.mjs` — filters/search, card navigation, Back/Forward, dish options/quantity/notes, WhatsApp messages (configured + fallback), cart subtotals, lightbox next/prev/Escape/close, mobile nav, dropdown, signature carousel, contact links.
* `tests/responsive.test.mjs` — CSS breakpoint coverage, flexible grids and touch-target rules for the requested viewports.
* `tests/build.test.mjs` — production build, bundled assets, `404.html` and `_redirects` fallbacks.
* `tests/native-esm.test.mjs` — regression guard: `links.js` / `image.js` must load in plain native ESM (no Vite transform), no browser module may import `.json`, and the generated JS manifest must match `images.json`.

The DOM tests bundle the real application entry with esbuild and run it in jsdom; they exercise the same markup and handlers as the browser.

### Real-browser audit (optional)

```bash
npm install --no-save --package-lock=false puppeteer-core @sparticuz/chromium
npm run build && npm run preview
AWS_EXECUTION_ENV=AWS_Lambda_nodejs22.x npm run test:browser
```

`scripts/browser-audit.mjs` loads **every route at 320 / 360 / 375 / 390 / 414 / 430 / 768 / 1024 / 1440 px** in headless Chromium and checks HTTP status, `h1`, empty links, unresolved internal links, real pixel data for every `<img>`, console/page errors, horizontal scrolling, the lightbox, menu filters, mobile navigation, WhatsApp deep links and the 404 page. It also writes screenshots to `.arena/shots` (excluded from Git). Point it at any server with `AUDIT_URL`, e.g. `AUDIT_URL=http://localhost:8080 npm run test:browser` to verify the raw-source server.

The last run: **117 page loads, 9 viewports, 5,580 internal links, 585 images, 9 interaction checks — 0 problems** on the production preview (`npm run build && npm run preview`). This audit caught and fixed a real `/menu` redirect loop, a mobile horizontal-overflow bug, an empty-homepage module-graph failure that jsdom could not see, a desktop dropdown that never opened, and a fixed bottom bar that could swallow taps on the last card row.

---

## Deployment

`npm run build` emits a static site in `dist/`. Because the site uses clean History API routes, the host must serve `index.html` for unknown paths:

* `dist/_redirects` — Netlify / Cloudflare Pages.
* `dist/404.html` — a copy of the built shell for GitHub Pages-style hosts.
* `vite dev` and `vite preview` already provide the SPA fallback.

Deploy at a domain root (`base: '/'`). For a sub-folder deployment, change `base` in `vite.config.mjs`; `src/js/links.js` prefixes every route and `src/js/image.js` prefixes every image URL with it automatically. Set an absolute `og:image` URL once the production domain is known.

---

## Repository notes

* The old three-page build (`menu.html`, `dish.html`, `theme.xml` — a legacy Blogger theme with hotlinked images and hash-only links) was removed so no stale or dead links remain in the codebase.
* No analytics, tracking or third-party scripts are included. Fonts are **self-hosted** in `public/fonts/` (Fraunces variable normal + italic, DM Sans variable, plus tiny `₹` subsets), so the site renders with no third-party requests and no blocking font CDN; system serif/sans fallbacks are declared in the stacks.

## Known limitations

* The cafe's real WhatsApp number, phone, email, exact address, opening hours and social profiles have not been supplied, so those fields show "to be confirmed" and WhatsApp ordering uses the clipboard fallback. No directions link is published because there is no verified street address.
* Prices, ingredients and allergens are sample data and must be confirmed with the cafe.
