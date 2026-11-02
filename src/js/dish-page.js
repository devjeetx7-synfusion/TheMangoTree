import {
  dishById,
  categoryById,
  dishesByCategory,
  dishes,
  formatPrice,
  dietLabel,
} from '../data/menu.js';
import { site, isConfigured } from '../data/site.js';
import { srcset, largest } from './image.js';
import { dishCard, dietBadge } from './components.js';
import { initChrome, toast, copyText, wireWhatsApp } from './ui.js';
import { buildOrderMessage, unitPrice, waLink } from './whatsapp.js';

const id = new URLSearchParams(window.location.search).get('id');
const dish = dishById(id ?? '');
const layout = document.querySelector('[data-dish-layout]');
const missing = document.querySelector('[data-dish-missing]');

const MAX_QTY = 20;

function setMeta() {
  if (!dish) {
    document.title = 'Dish not found · The Mango Tree Cafe';
    return;
  }
  const category = categoryById(dish.category);
  document.title = `${dish.name} · ${category?.name} · The Mango Tree Cafe`;
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    `${dish.name} — ${dish.description} Sample menu item at The Mango Tree Cafe, ${site.city}. Prices and ingredients are placeholders.`
  );
  const breadcrumb = document.querySelector('[data-breadcrumb-category]');
  if (breadcrumb) {
    breadcrumb.textContent = category?.name ?? 'Menu';
    breadcrumb.href = `./menu.html?category=${dish.category}`;
  }
  const image = document.querySelector('meta[property="og:image"]');
  if (image) image.setAttribute('content', new URL(`./images/${dish.image}-1200.webp`, window.location.href).href);
}

if (!dish) {
  layout?.setAttribute('hidden', '');
  if (missing) missing.hidden = false;
  setMeta();
  initChrome();
} else {
  if (missing) missing.hidden = true;
  setMeta();

  const category = categoryById(dish.category);

  /* --------------------------------------------------------------- details */
  document.querySelector('[data-dish-name]').textContent = dish.name;
  document.querySelector('[data-dish-category]').textContent = category?.name ?? '';
  document.querySelector('[data-dish-price]').innerHTML = `${formatPrice(dish.price)}<small>sample price</small>`;
  document.querySelector('[data-dish-desc]').textContent = dish.description;
  document.querySelector('[data-dish-story]').textContent = dish.story;
  document.querySelector('[data-dish-diet]').textContent = dietLabel(dish.diet);
  document.querySelector('[data-dish-serves]').textContent = dish.serves ?? 'Not specified';
  document.querySelector('[data-dish-ingredients]').textContent = (dish.ingredients ?? []).join(', ') || 'Not specified';
  document.querySelector('[data-dish-allergens]').textContent = dish.allergens ?? 'Not specified';
  document.querySelector('[data-dish-tags]').innerHTML = [dietBadge(dish), ...(dish.tags ?? []).map((tag) => `<span>${tag}</span>`)].join('');
  const photo = document.querySelector('[data-dish-img]');
  if (photo) {
    photo.src = largest(dish.image, 1200);
    photo.srcset = srcset(dish.image);
    photo.sizes = '(max-width: 920px) 92vw, 52vw';
    photo.width = 1200;
    photo.height = 900;
    photo.alt = `Illustrative photograph of ${dish.name}`;
  }
  const crumb = document.querySelector('[data-dish-crumb]');
  if (crumb) crumb.textContent = dish.name;

  /* --------------------------------------------------------------- options */
  const optionsWrap = document.querySelector('[data-options]');
  optionsWrap.innerHTML = (dish.options ?? [])
    .map(
      (option) => `<fieldset class="option-group">
        <legend class="option-group__head">
          <h3>${option.label}</h3>
          <span>${option.type === 'radio' ? (option.required ? 'Required' : 'Optional') : 'Optional'}</span>
        </legend>
        <div class="option-list">
          ${option.choices
            .map(
              (choice) => `<label class="option">
                <input type="${option.type}" name="${option.id}" value="${choice.id}" ${option.type === 'radio' ? '' : ''} />
                <span>${choice.label}${choice.delta ? ` <em>+${formatPrice(choice.delta)}</em>` : ''}</span>
              </label>`
            )
            .join('')}
        </div>
      </fieldset>`
    )
    .join('');

  // Preselect the first radio choice in each required group.
  (dish.options ?? []).forEach((option) => {
    if (option.type !== 'radio') return;
    const first = optionsWrap.querySelector(`input[name="${option.id}"]`);
    if (first) first.checked = true;
  });

  /* -------------------------------------------------------------- ordering */
  const qtyInput = document.querySelector('[data-qty]');
  const minus = document.querySelector('[data-qty-minus]');
  const plus = document.querySelector('[data-qty-plus]');
  const totalEl = document.querySelector('[data-total]');
  const note = document.querySelector('[data-note]');
  const orderButton = document.querySelector('[data-order]');
  const feedback = document.querySelector('[data-feedback]');

  const selections = () => {
    const result = {};
    (dish.options ?? []).forEach((option) => {
      const inputs = Array.from(optionsWrap.querySelectorAll(`input[name="${option.id}"]`));
      const checked = inputs.filter((input) => input.checked).map((input) => input.value);
      if (checked.length) result[option.id] = option.type === 'checkbox' ? checked : checked[0];
    });
    return result;
  };

  const quantity = () => {
    const value = Number(qtyInput.value);
    return Number.isInteger(value) && value >= 1 && value <= MAX_QTY ? value : 1;
  };

  const refresh = () => {
    const qty = quantity();
    minus.disabled = qty <= 1;
    plus.disabled = qty >= MAX_QTY;
    totalEl.textContent = formatPrice(unitPrice(dish, selections()) * qty);
    orderButton.dataset.message = buildOrderMessage(dish, { quantity: qty, selections: selections(), note: note.value });
    feedback.textContent = '';
  };

  const step = (delta) => {
    const next = Math.min(MAX_QTY, Math.max(1, quantity() + delta));
    qtyInput.value = String(next);
    refresh();
  };

  minus.addEventListener('click', () => step(-1));
  plus.addEventListener('click', () => step(1));
  qtyInput.addEventListener('change', () => {
    qtyInput.value = String(quantity());
    refresh();
  });
  optionsWrap.addEventListener('change', refresh);
  note.addEventListener('input', refresh);

  orderButton.addEventListener('click', async () => {
    const message = orderButton.dataset.message || buildOrderMessage(dish, { quantity: quantity() });
    if (isConfigured(site.whatsapp)) {
      const url = waLink(site.whatsapp, message);
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) window.location.href = url;
      feedback.textContent = 'WhatsApp opened with your order details. The cafe will confirm availability and price.';
      return;
    }
    const copied = await copyText(message);
    feedback.textContent = copied
      ? 'Order copied to your clipboard. WhatsApp ordering is not connected yet — add the cafe’s number in src/data/site.js and this button opens a ready-to-send chat.'
      : 'WhatsApp ordering is not connected yet. Add the cafe’s number in src/data/site.js to enable it.';
    toast(copied ? 'Order details copied to clipboard.' : 'WhatsApp number not configured yet.');
  });

  refresh();

  /* ---------------------------------------------------------------- related */
  const relatedWrap = document.querySelector('[data-related]');
  if (relatedWrap) {
    const sameCategory = dishesByCategory(dish.category).filter((item) => item.id !== dish.id);
    const others = dishes.filter((item) => item.category !== dish.category && item.id !== dish.id);
    const picks = [...sameCategory, ...others].slice(0, 3);
    relatedWrap.innerHTML = picks.map((item, index) => dishCard(item, { index })).join('');
    document.querySelector('[data-related-section]')?.removeAttribute('hidden');
  }

  initChrome();
  wireWhatsApp();
}
