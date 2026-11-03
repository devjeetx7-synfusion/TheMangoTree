/** Dish detail (/menu/[slug]) — details, options, quantity and WhatsApp order. */
import { dishBySlug, dishesByCategory, dishes, categoryById, formatPrice, dietLabel } from '../../data/menu.js';
import { site } from '../../data/site.js';
import { img } from '../image.js';
import { ROUTES, menuHref } from '../links.js';
import { icon } from '../icons.js';
import { dietBadge, dishCard, breadcrumb } from '../components.js';
import { escapeHtml, clampInt } from '../utils.js';
import { orderItem, orderNow, buildOrderMessage, combineOrderLines } from '../whatsapp.js';
import { unitPrice } from '../whatsapp.js';
import { cart } from '../cart.js';
import { toast } from '../notify.js';

const MAX_QTY = 20;
const RELATED_SIZES = '(max-width: 720px) 120px, (max-width: 1080px) 46vw, 360px';

export const meta = (route) => {
  const dish = dishBySlug(route.params.slug);
  if (!dish) return { title: 'Page not found · The Mango Tree Cafe', description: 'This page could not be found.' };
  return {
    title: `${dish.name} · ${categoryById(dish.category)?.name ?? 'Menu'} · The Mango Tree Cafe`,
    description: `${dish.name} — ${dish.description} Sample menu item at The Mango Tree Cafe, ${site.city}. Prices and ingredients are placeholders.`,
    image: `${dish.image}-1200.webp`,
  };
};

function optionMarkup(dish) {
  return (dish.options ?? [])
    .map(
      (option) => `<fieldset class="option-group">
        <legend class="option-group__head">
          <h3>${escapeHtml(option.label)}</h3>
          <span>${option.type === 'radio' ? (option.required ? 'Required' : 'Optional') : 'Optional'}</span>
        </legend>
        <div class="option-list">
          ${option.choices
            .map(
              (choice) => `<label class="option">
                <input type="${option.type}" name="${option.id}" value="${escapeHtml(choice.id)}" />
                <span>${escapeHtml(choice.label)}${choice.delta ? ` <em>+${formatPrice(choice.delta)}</em>` : ''}</span>
              </label>`
            )
            .join('')}
        </div>
      </fieldset>`
    )
    .join('');
}

export function render(route) {
  const dish = dishBySlug(route.params.slug);
  if (!dish) return ''; // router renders the 404 view instead
  const category = categoryById(dish.category);
  const sameCategory = dishesByCategory(dish.category).filter((item) => item.slug !== dish.slug);
  const others = dishes.filter((item) => item.category !== dish.category);
  const related = [...sameCategory, ...others].slice(0, 3);

  return `
    <section class="page-hero page-hero--dish">
      <div class="container">
        <a class="back-link back-link--light" href="${ROUTES.menu}">${icon('arrowLeft')} Back to the full menu</a>
        ${breadcrumb([
          { label: 'Home', href: ROUTES.home },
          { label: 'Menu', href: ROUTES.menu },
          { label: category?.name ?? 'Menu', href: menuHref({ category: dish.category }) },
          { label: dish.name },
        ])}
        <div class="dish-head">
          <div class="dish-head__copy">
            <p class="eyebrow eyebrow--light">${escapeHtml(category?.name ?? 'Menu')} · sample dish</p>
            <h1>${escapeHtml(dish.name)}</h1>
          </div>
          <p class="dish-head__meta">
            ${dietBadge(dish)}
            <span>${escapeHtml(dish.serves ?? '')}</span>
            <span>${formatPrice(dish.price)} <em>sample</em></span>
          </p>
        </div>
      </div>
    </section>

    <section class="dish-page">
      <div class="container">
        <div class="dish-layout" data-dish-layout>
          <div class="dish-gallery">
            <figure class="dish-photo">
              ${img(dish.image, {
                alt: `Illustrative photograph of ${dish.name}`,
                sizes: '(max-width: 920px) 92vw, 52vw',
                eager: true,
              })}
              <button class="dish-photo__hit" type="button" data-lightbox-dish="${escapeHtml(dish.slug)}" aria-label="Open full-size illustrative photograph of ${escapeHtml(dish.name)}"></button>
              <span class="dish-photo__badge">Illustrative · tap to enlarge</span>
              <figcaption class="dish-photo__caption">Not a photograph of the cafe’s dish</figcaption>
            </figure>

            <div class="dish-info">
              <h2>About this dish</h2>
              <p>${escapeHtml(dish.story)}</p>
              <div class="spec-grid">
                <div class="spec"><h3>Ingredients · sample</h3><p>${escapeHtml((dish.ingredients ?? []).join(', ') || 'Not specified')}</p></div>
                <div class="spec"><h3>Allergen note · sample</h3><p>${escapeHtml(dish.allergens ?? 'Not specified')}</p></div>
                <div class="spec"><h3>Serves</h3><p>${escapeHtml(dish.serves ?? 'Not specified')}</p></div>
                <div class="spec"><h3>Dietary</h3><p>${dietLabel(dish.diet)}</p></div>
              </div>
              <p class="gallery-note">${icon('info')}<span>Ingredients, allergens and portion notes are sample text for this preview — please confirm with the cafe before ordering.</span></p>
              <a class="link-arrow" href="${menuHref({ category: dish.category })}">More ${escapeHtml(category?.name ?? 'menu')} dishes ${icon('arrowRight')}</a>
            </div>
          </div>

          <aside class="order-card" aria-label="Order ${escapeHtml(dish.name)}">
            <div class="order-card__top">
              <div>
                <p class="eyebrow">Your order</p>
                <h2 class="order-card__title">${escapeHtml(dish.name)}</h2>
              </div>
              <p class="order-card__price">${formatPrice(dish.price)}<small>sample price</small></p>
            </div>

            <p class="order-card__desc">${escapeHtml(dish.description)}</p>
            <p class="dish-card__meta">${(dish.tags ?? []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}<span>${escapeHtml(category?.name ?? '')}</span></p>

            <div data-options>${optionMarkup(dish)}</div>

            <div class="qty-row">
              <span class="qty-label" id="qty-label">Quantity</span>
              <div class="qty" role="group" aria-labelledby="qty-label">
                <button type="button" data-qty-minus aria-label="Decrease quantity">${icon('minus')}</button>
                <input type="number" inputmode="numeric" min="1" max="${MAX_QTY}" step="1" value="1" data-qty aria-label="Quantity" />
                <button type="button" data-qty-plus aria-label="Increase quantity">${icon('plus')}</button>
              </div>
            </div>

            <div class="total-row"><span>Sample subtotal</span><strong data-total>${formatPrice(dish.price)}</strong></div>

            <div class="note-field">
              <label for="order-note">Special requests (optional)</label>
              <textarea id="order-note" data-note placeholder="Less spicy, no onion, extra dip…" rows="3" maxlength="300"></textarea>
            </div>

            <div class="order-card__actions">
              <button class="btn btn--wa btn--block" type="button" data-order-current>${icon('whatsapp')} Order on WhatsApp</button>
              <button class="btn btn--ghost-dark btn--block" type="button" data-add-current>${icon('plus')} Add to order bag</button>
              <a class="btn btn--green btn--block" href="${ROUTES.menu}">Continue browsing</a>
            </div>
            <p class="order-feedback" data-feedback role="status" aria-live="polite"></p>
            <p class="order-card__fine">${site.orderNote} Prices shown are sample values, not a bill.</p>
          </aside>
        </div>

        <section class="related">
          <div class="section-head">
            <div>
              <p class="eyebrow">Keep exploring</p>
              <h2>More to <em>try.</em></h2>
            </div>
            <div class="section-head__aside">
              <p class="section-head__link"><a class="link-arrow" href="${ROUTES.menu}">All dishes ${icon('arrowRight')}</a></p>
            </div>
          </div>
          <div class="dish-grid dish-grid--list" data-related>${related.map((item, index) => dishCard(item, { index, reveal: false, sizes: RELATED_SIZES })).join('')}</div>
        </section>
      </div>
    </section>
  `;
}

export function mount(root, route, signal) {
  const dish = dishBySlug(route.params.slug);
  if (!dish) return;
  const optionsWrap = root.querySelector('[data-options]');
  const qtyInput = root.querySelector('[data-qty]');
  const minus = root.querySelector('[data-qty-minus]');
  const plus = root.querySelector('[data-qty-plus]');
  const totalEl = root.querySelector('[data-total]');
  const note = root.querySelector('[data-note]');
  const orderButton = root.querySelector('[data-order-current]');
  const addButton = root.querySelector('[data-add-current]');
  const feedback = root.querySelector('[data-feedback]');
  if (!optionsWrap || !qtyInput || !totalEl) return;

  // Preselect the first radio choice in each required group.
  (dish.options ?? []).forEach((option) => {
    if (option.type === 'radio') optionsWrap.querySelector(`input[name="${option.id}"]`)?.setAttribute('checked', '');
  });

  const selections = () => {
    const result = {};
    (dish.options ?? []).forEach((option) => {
      const checked = Array.from(optionsWrap.querySelectorAll(`input[name="${option.id}"]`))
        .filter((input) => input.checked)
        .map((input) => input.value);
      if (checked.length) result[option.id] = option.type === 'checkbox' ? checked : checked[0];
    });
    return result;
  };
  const quantity = () => clampInt(qtyInput.value, 1, MAX_QTY, 1);
  const currentLine = () => orderItem(dish, { quantity: quantity(), selections: selections(), note: note?.value ?? '' });

  const refresh = () => {
    const qty = quantity();
    if (minus) minus.disabled = qty <= 1;
    if (plus) plus.disabled = qty >= MAX_QTY;
    totalEl.textContent = formatPrice(unitPrice(dish, selections()) * qty);
    if (feedback) feedback.textContent = '';
  };
  const step = (delta) => {
    qtyInput.value = String(clampInt(quantity() + delta, 1, MAX_QTY, 1));
    refresh();
  };

  minus?.addEventListener('click', () => step(-1), { signal });
  plus?.addEventListener('click', () => step(1), { signal });
  qtyInput.addEventListener('change', () => {
    qtyInput.value = String(quantity());
    refresh();
  }, { signal });
  optionsWrap.addEventListener('change', refresh, { signal });
  note?.addEventListener('input', refresh, { signal });

  orderButton?.addEventListener('click', () => {
    // Merge the selected dish with existing bag lines without double-charging
    // an identical line; every bag item is still included in the message.
    const lines = combineOrderLines([currentLine()], cart.orderLines());
    const result = orderNow(lines);
    if (feedback) {
      feedback.textContent = result.opened
        ? 'WhatsApp opened with your order details. The cafe confirms availability, the final price and the order in the chat.'
        : 'WhatsApp number not configured yet — your order text was copied. Add the cafe number in src/data/site.js to enable ordering.';
    }
    // Keep the exact message available for tests and debugging.
    orderButton.dataset.orderMessage = buildOrderMessage(lines);
  }, { signal });

  addButton?.addEventListener('click', () => {
    const line = currentLine();
    cart.add(dish, { quantity: line.quantity, selections: line.selections, note: line.note });
    toast(`${dish.name} added to your order bag.`);
    if (feedback) feedback.textContent = 'Added to your order bag. The cafe confirms the order in WhatsApp — nothing is confirmed here.';
  }, { signal });

  refresh();
}
