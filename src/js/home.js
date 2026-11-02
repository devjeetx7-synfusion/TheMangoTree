import { categories, dishes, featuredIds, signatureSlides, dishById, dishesByCategory, formatPrice } from '../data/menu.js';
import { galleryPhotos } from '../data/photography.js';
import { site } from '../data/site.js';
import { img, srcset, largest } from './image.js';
import { icon } from './icons.js';
import { categoryCard, dishCard, dishHref } from './components.js';
import { initChrome, initLightbox } from './ui.js';

/* ------------------------------------------------------------- categories */
const categoryGrid = document.querySelector('[data-categories]');
if (categoryGrid) {
  categoryGrid.innerHTML = categories
    .map((category) => categoryCard(category, dishesByCategory(category.id).length))
    .join('');
}

/* ---------------------------------------------------------------- featured */
const featuredGrid = document.querySelector('[data-featured]');
if (featuredGrid) {
  featuredGrid.innerHTML = featuredIds
    .map((id) => dishById(id))
    .filter(Boolean)
    .map((dish, index) => dishCard(dish, { index }))
    .join('');
}

/* --------------------------------------------------------------- signature */
const signature = document.querySelector('[data-signature]');
if (signature) {
  const slides = signatureSlides.map((slide) => ({ ...slide, dish: dishById(slide.dishId) })).filter((s) => s.dish);
  const frame = signature.querySelector('[data-sig-frame]');
  const image = frame.querySelector('img');
  const nameEl = signature.querySelector('[data-sig-name]');
  const priceEl = signature.querySelector('[data-sig-price]');
  const descEl = signature.querySelector('[data-sig-desc]');
  const labels = signature.querySelector('[data-sig-labels]');
  const tags = signature.querySelector('[data-sig-tags]');
  const link = signature.querySelector('[data-sig-link]');
  const dots = signature.querySelector('[data-sig-dots]');
  const prev = signature.querySelector('[data-sig-prev]');
  const next = signature.querySelector('[data-sig-next]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;

  dots.innerHTML = slides
    .map((slide, index) => `<button type="button" aria-label="Show ${slide.dish.name}" data-dot="${index}"></button>`)
    .join('');
  const dotButtons = Array.from(dots.children);

  const render = (index) => {
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
    link.href = dishHref(dish.id);
    labels.innerHTML = slide.labels
      .map((label) => `<span class="sig-label sig-label--${label.position}">${label.title}</span>`)
      .join('');
    tags.innerHTML = slide.labels.map((label) => `<span>${label.title}</span>`).join('');
    dotButtons.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
    prev.disabled = slides.length < 2;
    next.disabled = slides.length < 2;
  };

  const go = (index) => {
    if (reduceMotion.matches) {
      render(index);
      return;
    }
    frame.classList.add('is-swapping');
    window.setTimeout(() => {
      render(index);
      frame.classList.remove('is-swapping');
    }, 160);
  };

  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  dots.addEventListener('click', (event) => {
    const button = event.target.closest('[data-dot]');
    if (button) go(Number(button.dataset.dot));
  });

  // Swipe support for touch screens.
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

  render(0);
}

/* ----------------------------------------------------------------- gallery */
const galleryGrid = document.querySelector('[data-gallery]');
if (galleryGrid) {
  galleryGrid.innerHTML = galleryPhotos
    .map((photo, index) => {
      const span = photo.span === 'wide' ? 'span-wide' : photo.span === 'tall' ? 'span-tall' : '';
      return `<figure class="${span} reveal" tabindex="0" role="button" aria-label="Expand photograph: ${photo.alt}" style="transition-delay:${Math.min(index, 6) * 40}ms">
        ${img(photo.base, { alt: `Illustrative photograph — ${photo.alt}`, sizes: '(max-width: 720px) 46vw, (max-width: 920px) 32vw, 300px' })}
        <figcaption>${photo.caption}</figcaption>
      </figure>`;
    })
    .join('');
}

/* ------------------------------------------------------------- contact rows */
document.querySelectorAll('[data-contact]').forEach((node) => {
  const key = node.dataset.contact;
  const value = site[key];
  if (value) {
    node.textContent = value;
    node.classList.remove('pending');
  } else {
    node.textContent = node.dataset.fallback || 'To be confirmed';
    node.classList.add('pending');
  }
});

initChrome();
initLightbox();
