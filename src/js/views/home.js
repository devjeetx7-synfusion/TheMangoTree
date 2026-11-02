/** Home page (/) — static markup comes from the shared data modules. */
import { categories, dishesByCategory, featuredIds, signatureSlides, dishBySlug, formatPrice } from '../../data/menu.js';
import { heroPhoto, aboutPhotos, homeGalleryPhotos, heroChips } from '../../data/photography.js';
import { site } from '../../data/site.js';
import { img, srcset, largest } from '../image.js';
import { ROUTES, dishHref } from '../links.js';
import { icon } from '../icons.js';
import { categoryCard, dishCard, galleryTile } from '../components.js';

export const title = `The Mango Tree Cafe — Good Food. Great Moments. | ${site.shortCity}`;
export const description =
  'The Mango Tree Cafe in Chhapra, Bihar — explore the illustrated sample menu, gallery, our story and contact details. Order enquiries are confirmed by the cafe on WhatsApp.';

const firstSlide = signatureSlides[0];
const firstDish = dishBySlug(firstSlide.dishId);

export function render() {
  return `
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero__copy">
          <p class="eyebrow eyebrow--light">${site.tagline}</p>
          <h1>Good Food.<br /><em>Great Moments.</em></h1>
          <p class="hero__lead">Discover delicious flavours, refreshing drinks and memorable moments at The Mango Tree Cafe.</p>
          <div class="hero__actions">
            <a class="btn" href="${ROUTES.menu}">Explore Menu ${icon('arrowRight')}</a>
            <button class="btn btn--ghost" type="button" data-wa-enquiry>${icon('whatsapp')} Order on WhatsApp</button>
          </div>
          <p class="hero__meta">${icon('location')} ${site.city}</p>
        </div>

        <div class="hero__media">
          <figure class="hero-frame">
            ${img(heroPhoto.base, {
              alt: heroPhoto.alt,
              sizes: '(max-width: 920px) 92vw, 46vw',
              eager: true,
            })}
            <figcaption class="hero-frame__label">Illustrative photography</figcaption>
          </figure>
          <div class="hero-stamp" aria-hidden="true">${icon('leaf')} Made for<br />good times</div>
          <div class="hero-card" aria-hidden="true">
            ${img('cafe-interior', { alt: '', sizes: '170px' })}
          </div>
        </div>
      </div>

      <ul class="container hero-chips">
        ${heroChips.map((chip) => `<li>${icon('leaf')} ${chip}</li>`).join('')}
      </ul>
    </section>

    <section class="section" id="menu-highlights">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <p class="eyebrow">Explore our menu</p>
            <h2>A little something<br /><em>for every craving.</em></h2>
          </div>
          <div>
            <p>A wide range of delicious food &amp; beverages — from wood-fired pizza to thick, cold shakes.</p>
            <p class="section-head__link"><a class="link-arrow" href="${ROUTES.menu}">View full menu ${icon('arrowRight')}</a></p>
          </div>
        </div>
        <div class="category-grid" data-categories>
          ${categories.map((category) => categoryCard(category, dishesByCategory(category.id).length)).join('')}
        </div>
      </div>
    </section>

    <section class="section section--tint">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <p class="eyebrow">Crowd favourites</p>
            <h2>Plates worth<br /><em>coming back for.</em></h2>
          </div>
          <div>
            <p>Illustrative dishes from our sample menu. Prices are placeholders and can be edited in one file.</p>
            <p class="section-head__link"><a class="link-arrow" href="${ROUTES.menu}">View Menu ${icon('arrowRight')}</a></p>
          </div>
        </div>
        <div class="dish-carousel" data-featured>
          ${featuredIds.map(dishBySlug).filter(Boolean).map((dish, index) => dishCard(dish, { index })).join('')}
        </div>
      </div>
    </section>

    <section class="section signature" id="signature" data-signature>
      <div class="container signature-grid">
        <div class="signature__copy reveal">
          <p class="eyebrow eyebrow--light">Our signature</p>
          <h2>The one we're<br /><em>proud of.</em></h2>
          <p data-sig-desc>${firstDish.description}</p>
          <div class="signature__name">
            <h3 data-sig-name>${firstDish.name}</h3>
            <span class="signature__price" data-sig-price>${formatPrice(firstDish.price)}</span>
          </div>
          <div class="signature__controls">
            <button class="icon-btn" type="button" data-sig-prev aria-label="Previous signature dish">${icon('arrowLeft')}</button>
            <button class="icon-btn" type="button" data-sig-next aria-label="Next signature dish">${icon('arrowRight')}</button>
            <div class="dots" data-sig-dots></div>
          </div>
          <p class="signature__cta">
            <a class="btn" href="${dishHref(firstDish)}" data-sig-link>View this dish ${icon('arrowRight')}</a>
            <button class="btn btn--wa" type="button" data-order-signature="${firstDish.slug}" aria-label="Order ${firstDish.name} on WhatsApp">${icon('whatsapp')} Order now</button>
          </p>
          <p class="fine-print">Sample dish and price — confirm availability with the cafe. ${site.orderNote}</p>
        </div>

        <div class="signature__stage reveal">
          <div class="signature__frame" data-sig-frame>
            ${img(firstDish.image, { alt: `Illustrative photograph of ${firstDish.name}`, sizes: '(max-width: 920px) 92vw, 48vw' })}
            <div data-sig-labels>
              ${firstSlide.labels.map((label) => `<span class="sig-label sig-label--${label.position}">${label.title}</span>`).join('')}
            </div>
          </div>
          <div class="signature__tags" data-sig-tags>
            ${firstSlide.labels.map((label) => `<span>${label.title}</span>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="section about" id="about-teaser">
      <div class="container about-grid">
        <div class="about-collage reveal">
          <figure class="about-collage__main">
            ${img(aboutPhotos[0].base, { alt: aboutPhotos[0].alt, sizes: '(max-width: 920px) 92vw, 42vw' })}
          </figure>
          <figure class="about-collage__small">
            ${img(aboutPhotos[1].base, { alt: aboutPhotos[1].alt, sizes: '(max-width: 720px) 44vw, 20vw' })}
          </figure>
          <figure class="about-collage__small about-collage__small--offset">
            ${img(aboutPhotos[2].base, { alt: aboutPhotos[2].alt, sizes: '(max-width: 720px) 44vw, 20vw' })}
            <span class="about-collage__badge">${site.shortCity}</span>
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
          <p class="btn-row">
            <a class="btn btn--green" href="${ROUTES.about}">Our Story ${icon('arrowRight')}</a>
            <a class="btn btn--ghost-dark" href="${ROUTES.menu}">View Menu ${icon('arrowRight')}</a>
          </p>
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
          <div>
            <p>Illustrative food and ambience photography. Tap any photo to open it full size.</p>
            <p class="section-head__link"><a class="link-arrow" href="${ROUTES.gallery}">View Gallery ${icon('arrowRight')}</a></p>
          </div>
        </div>
        <div class="gallery-grid" data-gallery>
          ${homeGalleryPhotos.map((photo, index) => galleryTile(photo, index, 'home')).join('')}
        </div>
        <p class="gallery-note">${icon('info')}<span><strong>Please note:</strong> ${site.photographyNote} ${site.sampleNote}</span></p>
      </div>
    </section>

    <section class="section quotes">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <p class="eyebrow eyebrow--light">Good times, shared</p>
            <h2>What our guests<br /><em>would say.</em></h2>
          </div>
          <div><p style="color:rgba(255,248,235,.62)">Sample reviews written for this design. Real guest feedback can replace them.</p></div>
        </div>
        <div class="quote-grid">
          ${[
            ['AK', 'Amit K.', 'Good food, warm light and a table that somehow makes you stay for one more coffee.'],
            ['PS', 'Priya S.', 'The kind of place you bring friends to — loud, happy and full of snacks.'],
            ['RV', 'Rohan V.', 'Quick lunch that turned into a two-hour conversation. Exactly what a cafe should be.'],
          ]
            .map(
              ([initials, name, quote]) => `<article class="quote-card reveal">
                <div class="stars" aria-label="5 out of 5 stars (sample review)">${icon('star')}${icon('star')}${icon('star')}${icon('star')}${icon('star')}</div>
                <blockquote>“${quote}”</blockquote>
                <div class="quote-card__person"><span class="avatar" aria-hidden="true">${initials}</span><div><strong>${name}</strong><small>Sample review</small></div></div>
              </article>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section visit" id="visit-teaser">
      <div class="container">
        <div class="visit-panel reveal">
          <div>
            <p class="eyebrow eyebrow--light">See you soon</p>
            <h2>Your table<br /><em>is waiting.</em></h2>
            <p>Come for the food, stay for the moments. Message us on WhatsApp for the latest menu, timings and table availability.</p>
            <div class="visit-actions">
              <a class="btn btn--green" href="${ROUTES.contact}">Contact ${icon('arrowRight')}</a>
              <button class="btn btn--wa" type="button" data-wa-enquiry>${icon('whatsapp')} Order on WhatsApp</button>
            </div>
            <p class="fine-print">${site.orderNote}</p>
          </div>
          <div class="visit-card">
            <div class="visit-row">${icon('location')}<div><p class="visit-row__label">Find us</p><p class="visit-row__value">${site.city}<br /><span data-contact="address" data-fallback="Exact address to be confirmed"></span></p></div></div>
            <div class="visit-row">${icon('clock')}<div><p class="visit-row__label">Open hours</p><p class="visit-row__value"><span data-contact="hours" data-fallback="Timings to be confirmed"></span></p></div></div>
            <div class="visit-row">${icon('phone')}<div><p class="visit-row__label">Talk to us</p><p class="visit-row__value"><span data-contact="phone" data-fallback="Phone number to be confirmed"></span></p></div></div>
            <div class="visit-row">${icon('mail')}<div><p class="visit-row__label">Write to us</p><p class="visit-row__value"><span data-contact="email" data-fallback="Email to be confirmed"></span></p></div></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/** Signature carousel: buttons, dots, swipe and dish-linked order button. */
export function mount(root) {
  const signature = root.querySelector('[data-signature]');
  if (!signature) return;
  const slides = signatureSlides.map((slide) => ({ ...slide, dish: dishBySlug(slide.dishId) })).filter((slide) => slide.dish);
  if (!slides.length) return;

  const frame = signature.querySelector('[data-sig-frame]');
  const image = frame.querySelector('img');
  const nameEl = signature.querySelector('[data-sig-name]');
  const priceEl = signature.querySelector('[data-sig-price]');
  const descEl = signature.querySelector('[data-sig-desc]');
  const labels = signature.querySelector('[data-sig-labels]');
  const tags = signature.querySelector('[data-sig-tags]');
  const link = signature.querySelector('[data-sig-link]');
  const order = signature.querySelector('[data-order-signature]');
  const dots = signature.querySelector('[data-sig-dots]');
  const prev = signature.querySelector('[data-sig-prev]');
  const next = signature.querySelector('[data-sig-next]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;

  dots.innerHTML = slides
    .map((slide, index) => `<button type="button" aria-label="Show ${slide.dish.name}" data-dot="${index}"></button>`)
    .join('');
  const dotButtons = Array.from(dots.children);

  const paint = (index) => {
    current = (index + slides.length) % slides.length;
    const slide = slides[current];
    const { dish } = slide;
    image.src = largest(dish.image, 1200);
    image.srcset = srcset(dish.image);
    image.sizes = '(max-width: 920px) 92vw, 46vw';
    image.alt = `Illustrative photograph of ${dish.name}`;
    nameEl.textContent = dish.name;
    priceEl.textContent = formatPrice(dish.price);
    descEl.textContent = dish.description;
    link.href = dishHref(dish);
    order.dataset.orderSignature = dish.slug;
    order.setAttribute('aria-label', `Order ${dish.name} on WhatsApp`);
    labels.innerHTML = slide.labels.map((label) => `<span class="sig-label sig-label--${label.position}">${label.title}</span>`).join('');
    tags.innerHTML = slide.labels.map((label) => `<span>${label.title}</span>`).join('');
    dotButtons.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
  };

  const go = (index) => {
    if (reduceMotion.matches) return paint(index);
    frame.classList.add('is-swapping');
    window.setTimeout(() => {
      paint(index);
      frame.classList.remove('is-swapping');
    }, 160);
  };

  prev.disabled = slides.length < 2;
  next.disabled = slides.length < 2;
  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  dots.addEventListener('click', (event) => {
    const button = event.target.closest('[data-dot]');
    if (button) go(Number(button.dataset.dot));
  });

  let startX = null;
  frame.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    startX = event.clientX;
  });
  frame.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const delta = event.clientX - startX;
    startX = null;
    if (Math.abs(delta) > 42) go(current + (delta < 0 ? 1 : -1));
  });

  paint(0);
}
