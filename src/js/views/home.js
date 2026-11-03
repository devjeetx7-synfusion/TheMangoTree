/** Home page (/) — cinematic hero, menu explorer, signatures, story & visit. */
import {
  categories,
  dishesByCategory,
  featuredIds,
  signatureSlides,
  dishBySlug,
  formatPrice,
} from '../../data/menu.js';
import { heroPhoto, aboutPhotos, homeGalleryPhotos, heroChips, ambiencePhoto } from '../../data/photography.js';
import { site } from '../../data/site.js';
import { img, srcset, largest, imageInfo } from '../image.js';
import { ROUTES, dishHref, categoryHref } from '../links.js';
import { icon } from '../icons.js';
import { dishCard, galleryTile } from '../components.js';
import { escapeHtml } from '../utils.js';

export const title = `The Mango Tree Cafe — Good Food. Great Moments. | ${site.shortCity}`;
export const description =
  'The Mango Tree Cafe in Chhapra, Bihar — explore the illustrated sample menu, gallery, our story and contact details. Order enquiries are confirmed by the cafe on WhatsApp.';

const firstSlide = signatureSlides[0];
const firstDish = dishBySlug(firstSlide.dishId);
const firstCategory = categories[0];

/** Category summary rows used by the interactive menu explorer. */
const categoryDishes = (categoryId) => dishesByCategory(categoryId).slice(0, 3);

export function render() {
  return `
    <section class="hero" data-hero>
      <div class="hero__media">
        ${img(heroPhoto.base, {
          alt: heroPhoto.alt,
          sizes: '100vw',
          eager: true,
          className: 'hero__photo',
        })}
      </div>
      <div class="hero__veil" aria-hidden="true"></div>

      <div class="container hero__inner">
        <div class="hero__copy">
          <p class="eyebrow eyebrow--light">${site.tagline}</p>
          <h1>Good food.<br /><em>Great moments.</em></h1>
          <p class="hero__lead">A warm little corner of ${site.city} for generous plates, slow coffee and conversations that outlast the last cup.</p>
          <div class="hero__actions">
            <a class="btn btn--mango btn--lg" href="${ROUTES.menu}">${icon('arrowRight')} Explore the menu</a>
            <button class="btn btn--outline-light btn--lg" type="button" data-wa-enquiry>${icon('whatsapp')} Order on WhatsApp</button>
          </div>
          <ul class="hero__meta">
            <li>${icon('location')} ${site.city}</li>
            <li>${icon('leaf')} Illustrative photography</li>
            <li>${icon('info')} Sample menu</li>
          </ul>
        </div>
      </div>

      <div class="container hero__foot">
        <ul class="hero__chips" aria-label="What we love">
          ${heroChips.map((chip) => `<li>${icon('leaf')} ${escapeHtml(chip)}</li>`).join('')}
        </ul>
        <p class="hero__credit">Illustrative food photography · not a photograph of the cafe</p>
        <a class="hero__scroll" href="#menu-highlights">Scroll to explore <span aria-hidden="true"></span></a>
      </div>
    </section>

    <section class="section" id="featured">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <p class="eyebrow">Crowd favourites</p>
            <h2>Plates worth<br /><em>coming back for.</em></h2>
          </div>
          <div class="section-head__aside">
            <p>Four plates from our sample menu that tell the story of the cafe — generous, familiar and made to share.</p>
            <p class="section-head__link"><a class="link-arrow" href="${ROUTES.menu}">View the full menu ${icon('arrowRight')}</a></p>
          </div>
        </div>
        <div class="dish-carousel" data-featured>
          ${featuredIds.map(dishBySlug).filter(Boolean).map((dish, index) => dishCard(dish, { index })).join('')}
        </div>
        <p class="fine-print">Sample dishes and prices for this design preview. Food photography is illustrative — the cafe confirms everything in chat.</p>
      </div>
    </section>

    <section class="section section--cream-2" id="menu-highlights">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <p class="eyebrow">Explore by craving</p>
            <h2>A little something<br /><em>for every mood.</em></h2>
          </div>
          <div class="section-head__aside">
            <p>Eight ways into the menu — from blistering pizza crusts to thick, cold shakes. Pick a craving to see what is on that page.</p>
            <p class="section-head__link"><a class="link-arrow" href="${ROUTES.menu}">Browse all dishes ${icon('arrowRight')}</a></p>
          </div>
        </div>

        <div class="menu-showcase reveal" data-cat-explorer data-categories>
          <div class="menu-showcase__tabs" role="tablist" aria-label="Food categories">
            ${categories
              .map((category, index) => {
                const count = dishesByCategory(category.id).length;
                return `<button class="cat-tab" type="button" role="tab" id="cat-tab-${category.id}"
                  aria-selected="${index === 0 ? 'true' : 'false'}"
                  aria-controls="cat-panel" tabindex="${index === 0 ? '0' : '-1'}"
                  data-cat-tab="${category.id}">
                  <span class="cat-tab__num">${String(index + 1).padStart(2, '0')}</span>
                  <span class="cat-tab__name">${escapeHtml(category.name)}</span>
                  <span class="cat-tab__count">${count}</span>
                </button>`;
              })
              .join('')}
          </div>

          <div class="menu-showcase__panel" role="tabpanel" id="cat-panel"
            aria-labelledby="cat-tab-${firstCategory.id}" tabindex="0" data-cat-panel>
            <div class="menu-showcase__media" data-cat-media>
              ${img(firstCategory.image, {
                alt: `Illustrative photograph of ${firstCategory.name}`,
                sizes: '(max-width: 920px) 92vw, (max-width: 1080px) 55vw, 44vw',
              })}
              <span class="menu-showcase__badge">Illustrative photograph</span>
            </div>
            <div class="menu-showcase__info">
              <div class="menu-showcase__kicker">
                <span>The menu · <span data-cat-count>${dishesByCategory(firstCategory.id).length}</span> dishes</span>
                <strong data-cat-index>01 / ${String(categories.length).padStart(2, '0')}</strong>
              </div>
              <h3 class="menu-showcase__title" data-cat-name>${escapeHtml(firstCategory.name)}</h3>
              <p class="menu-showcase__blurb" data-cat-blurb>${escapeHtml(firstCategory.blurb)}</p>
              <ul class="menu-showcase__dishes" data-cat-dishes>
                ${categoryDishes(firstCategory.id)
                  .map(
                    (dish) => `<li><a href="${dishHref(dish)}"><span>${escapeHtml(dish.name)}</span><span class="menu-showcase__price">${formatPrice(dish.price)}</span>${icon('arrowRight')}</a></li>`
                  )
                  .join('')}
              </ul>
              <p class="menu-showcase__link">
                <a class="link-arrow" href="${categoryHref(firstCategory)}" data-cat-link>See all ${escapeHtml(firstCategory.name)} ${icon('arrowRight')}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section signature" id="signature" data-signature>
      <div class="container">
        <div class="section-head section-head--light reveal">
          <div>
            <p class="eyebrow eyebrow--light">Our signature</p>
            <h2>The plate we're<br /><em>proud of.</em></h2>
          </div>
          <div class="section-head__aside">
            <p>Three dishes the kitchen sends out with extra care. Browse them here, then open the full page for options, notes and WhatsApp ordering.</p>
          </div>
        </div>

        <div class="signature__grid">
          <div class="signature__stage reveal">
            <figure class="signature__frame" data-sig-frame>
              ${img(firstDish.image, {
                alt: `Illustrative photograph of ${firstDish.name}`,
                sizes: '(max-width: 920px) 92vw, 54vw',
              })}
              <div data-sig-labels>
                ${firstSlide.labels.map((label) => `<span class="sig-label sig-label--${label.position}">${escapeHtml(label.title)}</span>`).join('')}
              </div>
            </figure>
            <div class="signature__tags" data-sig-tags>
              ${firstSlide.labels.map((label) => `<span>${escapeHtml(label.title)}</span>`).join('')}
            </div>
          </div>

          <div class="signature__panel reveal">
            <p class="signature__counter"><span data-sig-index>01</span> / ${String(signatureSlides.length).padStart(2, '0')} · signature dish</p>
            <div class="signature__name" aria-live="polite">
              <h3 data-sig-name>${escapeHtml(firstDish.name)}</h3>
              <span class="signature__price"><span data-sig-price>${formatPrice(firstDish.price)}</span><small>sample</small></span>
            </div>
            <p data-sig-desc>${escapeHtml(firstDish.description)}</p>
            <div class="signature__cta">
              <a class="btn btn--mango" href="${dishHref(firstDish)}" data-sig-link>View this dish ${icon('arrowRight')}</a>
              <button class="btn btn--wa" type="button" data-order-signature="${firstDish.slug}" aria-label="Order ${escapeHtml(firstDish.name)} on WhatsApp">${icon('whatsapp')} Order now</button>
            </div>
            <div class="signature__controls">
              <button class="icon-btn" type="button" data-sig-prev aria-label="Previous signature dish">${icon('arrowLeft')}</button>
              <button class="icon-btn" type="button" data-sig-next aria-label="Next signature dish">${icon('arrowRight')}</button>
              <div class="dots" data-sig-dots></div>
            </div>
            <p class="signature__fine">Sample dish, options and price. Availability is confirmed by the cafe in the WhatsApp chat — nothing is ordered on this website.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section about" id="about-teaser">
      <div class="container about-grid">
        <div class="about-collage reveal">
          <figure class="about-collage__main">
            ${img(aboutPhotos[0].base, { alt: aboutPhotos[0].alt, sizes: '(max-width: 920px) 92vw, 46vw' })}
          </figure>
          <figure class="about-collage__small">
            ${img(aboutPhotos[1].base, { alt: aboutPhotos[1].alt, sizes: '(max-width: 920px) 44vw, 22vw' })}
          </figure>
          <figure class="about-collage__small about-collage__small--offset">
            ${img(aboutPhotos[2].base, { alt: aboutPhotos[2].alt, sizes: '(max-width: 920px) 44vw, 22vw' })}
            <span class="about-collage__badge">${escapeHtml(site.shortCity)}</span>
          </figure>
        </div>

        <div class="about-copy reveal">
          <p class="eyebrow">Our story</p>
          <h2>More than a cafe,<br /><em>a place to belong.</em></h2>
          <p>The Mango Tree Cafe is a warm little corner of ${site.city} — good food, soft lighting and company that makes an ordinary afternoon feel like an occasion.</p>
          <p>Come for a quick coffee, stay for a long conversation. There is room for every craving, every catch-up and every reason to linger a little longer.</p>
          <ul class="value-list">
            <li>${icon('leaf')} Freshly prepared food, made to order</li>
            <li>${icon('cup')} Cosy ambience, warm lighting and slow evenings</li>
            <li>${icon('check')} Great company — and room for one more chair</li>
          </ul>
          <div class="btn-row">
            <a class="btn btn--green" href="${ROUTES.about}">Our story ${icon('arrowRight')}</a>
            <a class="btn btn--ghost-dark" href="${ROUTES.contact}">Plan a visit ${icon('arrowRight')}</a>
          </div>
          <p class="fine-print">Interior and food photographs are illustrative, not photographs of the cafe.</p>
        </div>
      </div>
    </section>

    <section class="section gallery" id="gallery-teaser">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <p class="eyebrow">A feast for the eyes</p>
            <h2>Moments from<br /><em>around the table.</em></h2>
          </div>
          <div class="section-head__aside">
            <p>Illustrative food and ambience photography. Open any photograph full size, then browse with the arrow keys.</p>
            <p class="section-head__link"><a class="link-arrow" href="${ROUTES.gallery}">View the gallery ${icon('arrowRight')}</a></p>
          </div>
        </div>
        <div class="gallery-grid" data-gallery>
          ${homeGalleryPhotos.map((photo, index) => galleryTile(photo, index, 'home')).join('')}
        </div>
        <p class="gallery-note">${icon('info')}<span><strong>Please note:</strong> ${site.photographyNote}</span></p>
      </div>
    </section>

    <section class="ambience">
      <div class="container ambience__inner reveal">
        <blockquote>Come for the coffee.<br /><em>Stay for the conversation.</em></blockquote>
        <p class="ambience__meta">The Mango Tree Cafe · ${site.shortCity}</p>
        <a class="link-arrow" href="${ROUTES.about}">Read our story ${icon('arrowRight')}</a>
      </div>
    </section>

    <section class="section visit" id="visit-teaser">
      <div class="container">
        <div class="visit-panel reveal">
          <div class="visit-panel__copy">
            <p class="eyebrow eyebrow--light">See you soon</p>
            <h2>Your table<br /><em>is waiting.</em></h2>
            <p>Message us on WhatsApp for the latest menu, timings and table availability. We will help you find the right plate — and the right spot to sit.</p>
            <div class="visit-actions">
              <a class="btn btn--mango" href="${ROUTES.contact}">Visit &amp; contact ${icon('arrowRight')}</a>
              <button class="btn btn--wa" type="button" data-wa-enquiry>${icon('whatsapp')} Order on WhatsApp</button>
            </div>
            <p class="fine-print">${site.orderNote}</p>
          </div>
          <div class="visit-panel__side">
            <figure class="visit-photo">
              ${img(ambiencePhoto.base, { alt: ambiencePhoto.alt, sizes: '(max-width: 768px) 92vw, (max-width: 920px) 55vw, 24vw' })}
              <figcaption>Illustrative · table setting</figcaption>
            </figure>
            <div class="visit-card">
              <div class="visit-row">${icon('location')}<div><p class="visit-row__label">Find us</p><p class="visit-row__value">${site.city}<br /><span data-contact="address" data-fallback="Exact address to be confirmed"></span></p></div></div>
              <div class="visit-row">${icon('clock')}<div><p class="visit-row__label">Open hours</p><p class="visit-row__value"><span data-contact="hours" data-fallback="Timings to be confirmed"></span></p></div></div>
              <div class="visit-row">${icon('phone')}<div><p class="visit-row__label">Talk to us</p><p class="visit-row__value"><span data-contact="phone" data-fallback="Phone number to be confirmed"></span></p></div></div>
              <div class="visit-row">${icon('mail')}<div><p class="visit-row__label">Write to us</p><p class="visit-row__value"><span data-contact="email" data-fallback="Email to be confirmed"></span></p></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ------------------------------------------------------------- components */

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

/**
 * Interactive category explorer. It is rendered with the first category so it
 * reads and links correctly without JavaScript; the script only switches the
 * preview. Keyboard support follows the WAI-ARIA tabs pattern.
 */
function initCategoryExplorer(root, signal) {
  const explorer = root.querySelector('[data-cat-explorer]');
  if (!explorer) return;

  const tabs = Array.from(explorer.querySelectorAll('[data-cat-tab]'));
  const panel = explorer.querySelector('[data-cat-panel]');
  const media = explorer.querySelector('[data-cat-media]');
  const image = media?.querySelector('img');
  const countEl = explorer.querySelector('[data-cat-count]');
  const indexEl = explorer.querySelector('[data-cat-index]');
  const nameEl = explorer.querySelector('[data-cat-name]');
  const blurbEl = explorer.querySelector('[data-cat-blurb]');
  const dishesEl = explorer.querySelector('[data-cat-dishes]');
  const linkEl = explorer.querySelector('[data-cat-link]');
  if (!tabs.length || !panel || !image || !dishesEl || !linkEl) return;

  const preloaded = new Set();
  const preload = (category) => {
    if (preloaded.has(category.image)) return;
    preloaded.add(category.image);
    const preloadImage = new Image();
    preloadImage.src = largest(category.image, 768);
  };

  let current = 0;
  let swapTimer = 0;

  const paint = (index, { animate = true } = {}) => {
    const category = categories[index];
    if (!category) return;
    const info = imageInfo(category.image);
    const show = () => {
      if (info) {
        image.srcset = srcset(category.image);
        image.src = largest(category.image, 768);
        image.width = info.width;
        image.height = info.height;
        media.style.backgroundColor = info.colour;
      }
      image.alt = `Illustrative photograph of ${category.name}`;
      media.classList.remove('is-swapping');
    };

    window.clearTimeout(swapTimer);
    if (animate && !reduceMotion()) {
      media.classList.add('is-swapping');
      swapTimer = window.setTimeout(show, 160);
    } else {
      show();
    }

    const dishes = categoryDishes(category.id);
    const all = dishesByCategory(category.id);
    if (countEl) countEl.textContent = String(all.length);
    if (indexEl) indexEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(categories.length).padStart(2, '0')}`;
    if (nameEl) nameEl.textContent = category.name;
    if (blurbEl) blurbEl.textContent = category.blurb;
    dishesEl.innerHTML = dishes
      .map(
        (dish) => `<li><a href="${dishHref(dish)}"><span>${escapeHtml(dish.name)}</span><span class="menu-showcase__price">${formatPrice(dish.price)}</span>${icon('arrowRight')}</a></li>`
      )
      .join('');
    linkEl.href = categoryHref(category);
    linkEl.innerHTML = `See all ${escapeHtml(category.name)} ${icon('arrowRight')}`;
    panel.setAttribute('aria-labelledby', `cat-tab-${category.id}`);

    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && tabIndex !== current) {
        tab.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
      }
    });
    current = index;
  };

  const activate = (index, options) => {
    const safe = (index + tabs.length) % tabs.length;
    const category = categories[safe];
    if (category) preload(category);
    paint(safe, options);
    tabs[safe].focus({ preventScroll: true });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index), { signal });
    tab.addEventListener('pointerenter', () => {
      const category = categories[index];
      if (category) preload(category);
    }, { signal, passive: true });
    tab.addEventListener('focus', () => {
      const category = categories[index];
      if (category) preload(category);
    }, { signal });
    tab.addEventListener('keydown', (event) => {
      const keys = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      activate(keys[event.key]);
    }, { signal });
  });

  // The first tab is selected in the server-rendered markup; repaint only if
  // the image needs the manifest-driven srcset.
  paint(0, { animate: false });
}

/* -------------------------------------------------------------- signature */

function initSignature(root, signal) {
  const signature = root.querySelector('[data-signature]');
  if (!signature) return;

  const slides = signatureSlides.map((slide) => ({ ...slide, dish: dishBySlug(slide.dishId) })).filter((slide) => slide.dish);
  if (!slides.length) return;

  const frame = signature.querySelector('[data-sig-frame]');
  const image = frame?.querySelector('img');
  const nameEl = signature.querySelector('[data-sig-name]');
  const priceEl = signature.querySelector('[data-sig-price]');
  const descEl = signature.querySelector('[data-sig-desc]');
  const indexEl = signature.querySelector('[data-sig-index]');
  const labels = signature.querySelector('[data-sig-labels]');
  const tags = signature.querySelector('[data-sig-tags]');
  const link = signature.querySelector('[data-sig-link]');
  const order = signature.querySelector('[data-order-signature]');
  const dots = signature.querySelector('[data-sig-dots]');
  const prev = signature.querySelector('[data-sig-prev]');
  const next = signature.querySelector('[data-sig-next]');
  if (!frame || !image || !nameEl || !priceEl || !descEl || !dots || !prev || !next) return;

  let current = 0;
  let swapTimer = 0;

  dots.innerHTML = slides
    .map((slide, index) => `<button type="button" aria-label="Show ${escapeHtml(slide.dish.name)}" data-dot="${index}"></button>`)
    .join('');
  const dotButtons = Array.from(dots.children);

  const paint = (index) => {
    current = (index + slides.length) % slides.length;
    const slide = slides[current];
    const { dish } = slide;
    const info = imageInfo(dish.image);
    image.srcset = srcset(dish.image);
    image.src = largest(dish.image, 1200);
    image.sizes = '(max-width: 920px) 92vw, 54vw';
    image.alt = `Illustrative photograph of ${dish.name}`;
    if (info) {
      image.width = info.width;
      image.height = info.height;
    }
    nameEl.textContent = dish.name;
    priceEl.textContent = formatPrice(dish.price);
    descEl.textContent = dish.description;
    if (indexEl) indexEl.textContent = String(current + 1).padStart(2, '0');
    link.href = dishHref(dish);
    order.dataset.orderSignature = dish.slug;
    order.setAttribute('aria-label', `Order ${dish.name} on WhatsApp`);
    if (labels) labels.innerHTML = slide.labels.map((label) => `<span class="sig-label sig-label--${label.position}">${escapeHtml(label.title)}</span>`).join('');
    if (tags) tags.innerHTML = slide.labels.map((label) => `<span>${escapeHtml(label.title)}</span>`).join('');
    dotButtons.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
    frame.classList.remove('is-swapping');
  };

  const go = (index) => {
    if (reduceMotion()) {
      paint(index);
      return;
    }
    window.clearTimeout(swapTimer);
    frame.classList.add('is-swapping');
    swapTimer = window.setTimeout(() => paint(index), 160);
  };

  prev.disabled = slides.length < 2;
  next.disabled = slides.length < 2;
  prev.addEventListener('click', () => go(current - 1), { signal });
  next.addEventListener('click', () => go(current + 1), { signal });
  dots.addEventListener('click', (event) => {
    const button = event.target.closest('[data-dot]');
    if (button) go(Number(button.dataset.dot));
  }, { signal });

  // Swipe on touch devices only — mouse drags should not hijack the page.
  let startX = null;
  frame.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    startX = event.clientX;
  }, { signal });
  frame.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const delta = event.clientX - startX;
    startX = null;
    if (Math.abs(delta) > 42) go(current + (delta < 0 ? 1 : -1));
  }, { signal });

  paint(0);
}

export function mount(root, _route, signal) {
  initCategoryExplorer(root, signal);
  initSignature(root, signal);
}
