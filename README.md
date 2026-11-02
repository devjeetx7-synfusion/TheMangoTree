# The Mango Tree Cafe — website

A mobile-first, clean-route cafe website for **The Mango Tree Cafe**, Chhapra, Bihar — built with Vite, vanilla JavaScript and a locally hosted, responsive WebP image set.

> **Illustrative imagery & sample menu**
> Every photograph is illustrative food/ambience photography, **not** a photograph of the real cafe. Dish names, descriptions, ingredients, allergens and prices are editable **sample data**. Disclosures are shown on the gallery, dish, contact, legal and footer pages — please keep them until real content is supplied. Nothing on this site claims an order has been placed or confirmed.

---

## Routes

The site is a single-page app with a History API router (`src/js/router.js`). All links are generated from `src/js/links.js` and work with Back / Forward, deep links and page refresh (on hosts with an SPA fallback).

| Route | Page | Highlights |
| --- | --- | --- |
| `/` | Home | Hero, category grid, featured dishes, signature carousel, story teaser, gallery teaser, sample reviews, visit CTA |
| `/menu` | Complete food menu | Category filters, live search, deep links (`/menu?category=pizza&q=…`), dish cards, order bag |
| `/menu/[slug]` | Dish detail | Photograph + lightbox, sample ingredients/allergens, options, quantity, live sample subtotal, WhatsApp order, related dishes |
| `/gallery` | Photo gallery | Full illustrative photo set, lightbox with prev/next/close, keyboard controls, full-size image link |
| `/about` | About the cafe | Story, illustrative collage, links to menu/gallery/contact |
| `/contact` | Contact | Config-driven phone/email/address/hours, WhatsApp contact, directions and socials only when configured |
| `/privacy`, `/terms` | Published legal pages | Honest preview-site policies, linked from the footer |
| anything else | Custom 404 | Includes invalid `/menu/[slug]` URLs; `noindex` + working links home/menu/gallery/contact |

Legacy bookmarks (`/index.html`, `/menu.html?…`, `/dish.html?id=…`) redirect to the canonical clean route. A Vite dev/preview middleware in `vite.config.mjs` serves the SPA shell for the old `.html` paths so no static `menu.html` can shadow the `/menu` route. On production hosts, the SPA fallback does the same.

---

## Quick start

```bash
npm install          # Vite, esbuild, sharp, jsdom (dev only)
npm run dev          # http://localhost:5173
npm run build        # verify assets → bundle to /dist → write dist/404.html
npm run preview      # serve the production build at :4173
npm test             # route/link/image, interaction, WhatsApp, responsive and build tests
npm run verify       # image + menu-data integrity check
npm run check        # test + verify + build
npm run images       # rebuild responsive WebP assets from /assets-src
npm run test:browser # optional real-Chromium audit (see Testing)
```

Node 20+ is recommended (developed on Node 22).

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
* ≥44 px touch targets, scrollable drawer that starts below the header, `min-width: 0` grids, `overflow-x: clip`, and breakpoints at 1080 / 920 / 720 / 420 / 340 px (covering 320, 360, 390, 430, 768, 1024 and 1440 px).
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

The DOM tests bundle the real application entry with esbuild and run it in jsdom; they exercise the same markup and handlers as the browser.

### Real-browser audit (optional)

```bash
npm install --no-save --package-lock=false puppeteer-core @sparticuz/chromium
npm run build && npm run preview
AWS_EXECUTION_ENV=AWS_Lambda_nodejs22.x npm run test:browser
```

`scripts/browser-audit.mjs` loads **every route at 320 / 360 / 390 / 430 / 768 / 1024 / 1440 px** in headless Chromium and checks HTTP status, `h1`, empty links, unresolved internal links, real pixel data for every `<img>`, console/page errors, horizontal scrolling, the lightbox, menu filters, mobile navigation, WhatsApp deep links and the 404 page. It also writes screenshots to `.arena/shots` (excluded from Git). The last run: **93 page loads, 7 viewports, 3,843 internal links, 504 images, 9 interaction checks — 0 problems**. This audit caught and fixed a real `/menu` redirect loop and a mobile horizontal-overflow bug that jsdom could not see.

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
* Sample reviews are labelled placeholder copy, not real customer feedback.
* No analytics, tracking or third-party scripts are included. Fonts are loaded from Google Fonts with system fallbacks.

## Known limitations

* The cafe's real WhatsApp number, phone, email, exact address, opening hours and social profiles have not been supplied, so those fields show "to be confirmed" and WhatsApp ordering uses the clipboard fallback. No directions link is published because there is no verified street address.
* Prices, ingredients and allergens are sample data and must be confirmed with the cafe.
