import { formatPrice, dietLabel, categoryById } from '../data/menu.js';
import { site } from '../data/site.js';
import { img } from './image.js';
import { icon } from './icons.js';

/** Same-origin, URL-encoded dish link. */
export const dishHref = (id) => `./dish.html?id=${encodeURIComponent(id)}`;

export function dietBadge(dish) {
  return `<span class="diet diet--${dish.diet === 'veg' ? 'veg' : 'nonveg'}" title="${dietLabel(dish.diet)}">
    <span class="visually-hidden">${dietLabel(dish.diet)}</span>
  </span>`;
}

export function dishCard(dish, { index = 0, reveal = true } = {}) {
  const category = categoryById(dish.category);
  const sizes = '(max-width: 720px) 80vw, (max-width: 1080px) 45vw, 290px';
  const message = `Hello ${site.name}! I'd like to ask about ${dish.name}.`;
  return `<article class="dish-card${reveal ? ' reveal' : ''}" style="transition-delay:${Math.min(index, 5) * 45}ms">
    <a class="dish-card__media" href="${dishHref(dish.id)}" tabindex="-1" aria-hidden="true">
      ${img(dish.image, { alt: `Illustrative photograph of ${dish.name}`, sizes })}
      ${dish.tags?.length ? `<span class="dish-card__flag">${dish.tags[0]}</span>` : ''}
    </a>
    <div class="dish-card__body">
      <div class="dish-card__title-row">
        <h3><a href="${dishHref(dish.id)}">${dish.name}</a></h3>
        <span class="price">${formatPrice(dish.price)}<small>sample</small></span>
      </div>
      <p class="dish-card__desc">${dish.description}</p>
      <p class="dish-card__meta">${dietBadge(dish)}<span aria-hidden="true">·</span><span>${category?.name ?? ''}</span></p>
      <div class="dish-card__actions">
        <a class="btn btn--green" href="${dishHref(dish.id)}">View details</a>
        <a class="btn btn--wa" data-wa data-wa-message="${message.replace(/"/g, '&quot;')}" href="#" aria-label="Order ${dish.name} on WhatsApp">
          ${icon('whatsapp')}<span>Order</span>
        </a>
      </div>
    </div>
  </article>`;
}

export function categoryCard(category, count) {
  return `<a class="category-card reveal" href="./menu.html?category=${category.id}">
    <div class="category-card__media">
      ${img(category.image, { alt: `Illustrative photograph of ${category.name}`, sizes: '(max-width: 720px) 46vw, (max-width: 1080px) 24vw, 290px' })}
    </div>
    <div class="category-card__body">
      <div>
        <h3>${category.name}</h3>
        <small>${count} ${count === 1 ? 'dish' : 'dishes'}</small>
      </div>
      <span class="category-card__arrow" aria-hidden="true">${icon('chevronRight')}</span>
    </div>
  </a>`;
}
