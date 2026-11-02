/** Reusable cards and tiles. Every interaction points at a real route/handler. */
import { formatPrice, dietLabel, categoryById } from '../data/menu.js';
import { dishHref, categoryHref } from './links.js';
import { img } from './image.js';
import { icon } from './icons.js';
import { escapeHtml } from './utils.js';

export function dietBadge(dish) {
  return `<span class="diet diet--${dish.diet === 'veg' ? 'veg' : 'nonveg'}" title="${dietLabel(dish.diet)}">
    <span class="visually-hidden">${dietLabel(dish.diet)}</span>
  </span>`;
}

export function dishCard(dish, { index = 0, reveal = true } = {}) {
  const category = categoryById(dish.category);
  const sizes = '(max-width: 720px) 80vw, (max-width: 1080px) 45vw, 290px';
  const href = dishHref(dish);
  return `<article class="dish-card${reveal ? ' reveal' : ''}" style="transition-delay:${Math.min(index, 5) * 45}ms">
    <a class="dish-card__media" href="${href}" tabindex="-1" aria-hidden="true">
      ${img(dish.image, { alt: `Illustrative photograph of ${dish.name}`, sizes })}
      ${dish.tags?.length ? `<span class="dish-card__flag">${escapeHtml(dish.tags[0])}</span>` : ''}
    </a>
    <div class="dish-card__body">
      <div class="dish-card__title-row">
        <h3><a href="${href}">${escapeHtml(dish.name)}</a></h3>
        <span class="price">${formatPrice(dish.price)}<small>sample</small></span>
      </div>
      <p class="dish-card__desc">${escapeHtml(dish.description)}</p>
      <p class="dish-card__meta">${dietBadge(dish)}<span aria-hidden="true">·</span><span>${escapeHtml(category?.name ?? '')}</span></p>
      <div class="dish-card__actions">
        <a class="btn btn--green" href="${href}">View details</a>
        <button class="btn btn--wa" type="button" data-order-card="${escapeHtml(dish.slug)}" aria-label="Order ${escapeHtml(dish.name)} on WhatsApp">
          ${icon('whatsapp')}<span>Order</span>
        </button>
      </div>
      <button class="cart-add" type="button" data-add-to-cart="${escapeHtml(dish.slug)}" aria-label="Add ${escapeHtml(dish.name)} to the order bag">
        ${icon('plus')} Add to order bag
      </button>
    </div>
  </article>`;
}

export function categoryCard(category, count) {
  return `<a class="category-card reveal" href="${categoryHref(category)}">
    <div class="category-card__media">
      ${img(category.image, { alt: `Illustrative photograph of ${category.name}`, sizes: '(max-width: 720px) 46vw, (max-width: 1080px) 24vw, 290px' })}
    </div>
    <div class="category-card__body">
      <div>
        <h3>${escapeHtml(category.name)}</h3>
        <small>${count} ${count === 1 ? 'dish' : 'dishes'}</small>
      </div>
      <span class="category-card__arrow" aria-hidden="true">${icon('chevronRight')}</span>
    </div>
  </a>`;
}

/** Clickable gallery tile; the global lightbox handles the interaction. */
export function galleryTile(photo, index, group = 'gallery') {
  const span = photo.span === 'wide' ? 'span-wide' : photo.span === 'tall' ? 'span-tall' : '';
  return `<figure class="${span} reveal" style="transition-delay:${Math.min(index, 6) * 40}ms">
    <button class="gallery-tile" type="button" data-lightbox-index="${index}" data-lightbox-group="${group}" aria-label="Open full-size photograph: ${escapeHtml(photo.alt)}">
      ${img(photo.base, { alt: photo.alt, sizes: '(max-width: 720px) 46vw, (max-width: 920px) 32vw, 300px' })}
    </button>
    <figcaption>${escapeHtml(photo.caption)}</figcaption>
  </figure>`;
}

/** Breadcrumb with real links; the last item is the current page. */
export function breadcrumb(items, { dark = false } = {}) {
  return `<nav class="breadcrumb${dark ? ' breadcrumb--dark' : ''}" aria-label="Breadcrumb">
    ${items
      .map((item, index) => {
        const last = index === items.length - 1;
        return `${index ? '<span aria-hidden="true">/</span>' : ''}${
          last
            ? `<span aria-current="page">${escapeHtml(item.label)}</span>`
            : `<a href="${item.href}">${escapeHtml(item.label)}</a>`
        }`;
      })
      .join('\n          ')}
  </nav>`;
}
