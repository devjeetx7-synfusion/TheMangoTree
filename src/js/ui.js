/**
 * Shared UI: page chrome, mobile navigation, dropdown, contact slots, reveal
 * animations, the gallery lightbox, the order bag and all global WhatsApp
 * button handlers. Initialised once; route changes only call `afterRender`.
 */
import { site, phoneHref, directionsHref, socialLinks, isConfigured } from '../data/site.js';
import { dishBySlug, formatPrice } from '../data/menu.js';
import { lightboxGroup } from '../data/photography.js';
import { img, fullSize, imageInfo, guardImages } from './image.js';
import { ROUTES } from './links.js';
import { icon, icons } from './icons.js';
import { escapeHtml, cartLineKey } from './utils.js';
import { toast } from './notify.js';
import { cart } from './cart.js';
import {
  waLink,
  buildEnquiryMessage,
  buildOrderMessage,
  combineOrderLines,
  ENQUIRY_MESSAGE,
  orderItem,
  optionLines,
  unitPrice,
  orderNow,
  openWhatsApp,
} from './whatsapp.js';

/* ------------------------------------------------------------------ helpers */

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
const header = () => document.querySelector('.site-header');
const drawer = () => document.querySelector('.mobile-nav');
const dropdown = () => document.querySelector('[data-menu-dropdown]');
const dropdownToggle = () => document.querySelector('[data-menu-dropdown-toggle]');
const cartPanel = () => document.querySelector('[data-cart-panel]');
const lightbox = () => document.querySelector('.lightbox');

const syncBodyLock = () => {
  const locked = Boolean(
    drawer()?.classList.contains('is-open') ||
      cartPanel()?.classList.contains('is-open') ||
      lightbox()?.classList.contains('is-open')
  );
  document.body.classList.toggle('is-locked', locked);
};

/* -------------------------------------------------------- contact / config */

/** Config-driven contact details: real links only when values are configured. */
export function renderContactSlots(root = document) {
  root.querySelectorAll('[data-contact]').forEach((node) => {
    const key = node.dataset.contact;
    const value = typeof site[key] === 'string' ? site[key].trim() : '';
    const fallback = node.dataset.fallback || 'To be confirmed';
    let markup = escapeHtml(fallback);

    if (key === 'phone' && value && phoneHref(value)) {
      markup = `<a href="${phoneHref(value)}">${escapeHtml(value)}</a>`;
    } else if (key === 'email' && value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      markup = `<a href="mailto:${encodeURIComponent(value)}">${escapeHtml(value)}</a>`;
    } else if (key === 'whatsapp' && value && waLink(value, ENQUIRY_MESSAGE)) {
      markup = `<a href="${waLink(value, ENQUIRY_MESSAGE)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a>`;
    } else if (value) {
      markup = escapeHtml(value);
    }

    node.innerHTML = markup;
    node.classList.toggle('pending', !value);
  });

  root.querySelectorAll('[data-directions]').forEach((node) => {
    const href = directionsHref();
    node.innerHTML = href
      ? `<a class="btn btn--ghost-dark" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Get directions ${icon('external')}</a>`
      : '<p class="pending">Directions will appear once the cafe confirms its exact street address.</p>';
  });

  root.querySelectorAll('[data-socials]').forEach((node) => {
    const links = socialLinks();
    node.innerHTML = links.length
      ? links
          .map(
            (entry) => `<a class="social-link" href="${escapeHtml(entry.url.trim())}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(entry.label)} (opens in a new tab)">${icon(entry.id)} ${escapeHtml(entry.label)}</a>`
          )
          .join('')
      : '<p class="pending">Social profiles will be linked once the cafe supplies its real profile URLs.</p>';
  });
}

/* --------------------------------------------------------------- navigation */

function initHeader() {
  const head = header();
  if (!head || head.dataset.ready) return;
  head.dataset.ready = 'true';
  const solid = head.classList.contains('site-header--solid');
  const onScroll = () => {
    if (!solid) head.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function closeNav() {
  const nav = drawer();
  const toggle = document.querySelector('.nav-toggle');
  if (!nav?.classList.contains('is-open')) return;
  nav.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open navigation');
  syncBodyLock();
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = drawer();
  if (!toggle || !nav || toggle.dataset.ready) return;
  toggle.dataset.ready = 'true';

  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    closeDropdown();
    syncBodyLock();
    if (open) nav.querySelector('a')?.focus();
  });

  // Close after any navigation (including header/footer links inside the drawer).
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) closeNav();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 920) closeNav();
  });
}

function closeDropdown() {
  const panel = dropdown();
  const toggle = dropdownToggle();
  if (!panel?.classList.contains('is-open')) return;
  panel.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');
}

function initDropdown() {
  const panel = dropdown();
  const toggle = dropdownToggle();
  if (!panel || !toggle || toggle.dataset.ready) return;
  toggle.dataset.ready = 'true';
  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeDropdown();
  });
  document.addEventListener('click', (event) => {
    if (!panel.contains(event.target)) closeDropdown();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDropdown();
  });
}

/* --------------------------------------------------------------- lightbox */

let lightboxState = { photos: [], index: 0, trigger: null };

function buildLightbox() {
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-hidden', 'true');
  box.setAttribute('aria-label', 'Expanded photograph');
  box.innerHTML = `
    <button class="lightbox__close" type="button" data-lightbox-close aria-label="Close photograph">${icons.close}</button>
    <button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="Previous photograph">${icons.chevronLeft}</button>
    <figure class="lightbox__figure">
      <img alt="" width="1200" height="800" />
      <figcaption>
        <span class="lightbox__caption" data-lightbox-caption></span>
        <span class="lightbox__meta"><span data-lightbox-counter></span> · Illustrative photography, not a photo of the cafe ·
          <a data-lightbox-full target="_blank" rel="noopener noreferrer" href="${fullSize('hero-spread')}">Open full size ${icons.external}</a>
        </span>
      </figcaption>
    </figure>
    <button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="Next photograph">${icons.chevronRight}</button>
  `;
  document.body.appendChild(box);
  return box;
}

function paintLightbox() {
  const box = lightbox();
  if (!box) return;
  const { photos, index } = lightboxState;
  const photo = photos[index];
  if (!photo) return;
  const info = imageInfo(photo.base) ?? { width: 1200, height: 800 };
  const image = box.querySelector('img');
  image.src = fullSize(photo.base);
  image.alt = photo.alt;
  image.width = info.width;
  image.height = info.height;
  box.querySelector('[data-lightbox-caption]').textContent = photo.caption || photo.alt;
  box.querySelector('[data-lightbox-counter]').textContent = `${index + 1} of ${photos.length}`;
  const full = box.querySelector('[data-lightbox-full]');
  full.href = fullSize(photo.base);
  full.setAttribute('aria-label', `Open full-size photograph in a new tab: ${photo.alt}`);
  const multiple = photos.length > 1;
  box.querySelectorAll('[data-lightbox-prev], [data-lightbox-next]').forEach((button) => {
    button.hidden = !multiple;
  });
}

function openLightbox(photos, index, trigger) {
  if (!photos?.length) return;
  const box = lightbox() ?? buildLightbox();
  lightboxState = { photos, index: Math.min(Math.max(index, 0), photos.length - 1), trigger };
  paintLightbox();
  box.classList.add('is-open');
  box.setAttribute('aria-hidden', 'false');
  syncBodyLock();
  closeNav();
  closeDropdown();
  box.querySelector('[data-lightbox-close]')?.focus();
}

function stepLightbox(delta) {
  const { photos, index } = lightboxState;
  if (!photos.length) return;
  lightboxState.index = (index + delta + photos.length) % photos.length;
  paintLightbox();
}

function closeLightbox() {
  const box = lightbox();
  if (!box?.classList.contains('is-open')) return;
  box.classList.remove('is-open');
  box.setAttribute('aria-hidden', 'true');
  lightboxState.trigger?.focus?.();
  lightboxState = { photos: [], index: 0, trigger: null };
  syncBodyLock();
}

function initLightbox() {
  if (document.documentElement.dataset.lightboxReady) return;
  document.documentElement.dataset.lightboxReady = 'true';

  document.addEventListener('click', (event) => {
    const tile = event.target.closest('[data-lightbox-index]');
    if (tile) {
      const group = tile.dataset.lightboxGroup || 'gallery';
      openLightbox(lightboxGroup(group), Number(tile.dataset.lightboxIndex), tile);
      return;
    }
    const dishTile = event.target.closest('[data-lightbox-dish]');
    if (dishTile) {
      const dish = dishBySlug(dishTile.dataset.lightboxDish);
      if (dish) {
        const photo = {
          base: dish.image,
          alt: `Illustrative photograph of ${dish.name}`,
          caption: `${dish.name} · illustrative photograph`,
        };
        openLightbox([photo], 0, dishTile);
      }
      return;
    }
    if (event.target.closest('[data-lightbox-close]') || event.target === lightbox()) {
      closeLightbox();
      return;
    }
    if (event.target.closest('[data-lightbox-prev]')) return stepLightbox(-1);
    if (event.target.closest('[data-lightbox-next]')) return stepLightbox(1);
  });

  window.addEventListener('keydown', (event) => {
    const box = lightbox();
    if (!box?.classList.contains('is-open')) return;
    if (event.key === 'Escape') return closeLightbox();
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      return stepLightbox(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      return stepLightbox(1);
    }
    if (event.key === 'Tab') {
      // Keep keyboard focus inside the dialog.
      const focusable = Array.from(box.querySelectorAll('button:not([hidden]), a[href]'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

/* ------------------------------------------------------------- order bag UI */

function cartLineLabel(item, dish) {
  const chosen = optionLines(dish, item.selections);
  return chosen.length ? chosen.join(' · ') : `${dish.name}`;
}

function renderCart() {
  const panel = cartPanel();
  if (!panel) return;
  const items = cart.getItems();
  const list = panel.querySelector('[data-cart-list]');
  const subtotalEl = panel.querySelector('[data-cart-subtotal]');
  const orderButton = panel.querySelector('[data-cart-order]');
  const clearButton = panel.querySelector('[data-cart-clear]');

  document.querySelectorAll('[data-cart-count]').forEach((badge) => {
    badge.textContent = String(cart.count());
    badge.setAttribute('aria-label', `${cart.count()} items in the order bag`);
  });

  if (!items.length) {
    list.innerHTML = '<li class="cart-empty">Your order bag is empty. Add a dish from the menu to build a WhatsApp order.</li>';
  } else {
    list.innerHTML = items
      .map((item, index) => {
        const dish = dishBySlug(item.slug);
        if (!dish) return '';
        return `<li class="cart-row">
          <div class="cart-row__media">${img(dish.image, { alt: `Illustrative photograph of ${dish.name}`, sizes: '64px' })}</div>
          <div class="cart-row__body">
            <strong>${escapeHtml(dish.name)}</strong>
            <small>${escapeHtml(cartLineLabel(item, dish))}</small>
            ${item.note ? `<small>Note: ${escapeHtml(item.note)}</small>` : ''}
            <div class="cart-row__qty">
              <button type="button" data-cart-step="-1" data-cart-index="${index}" aria-label="Decrease ${escapeHtml(dish.name)} quantity">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-cart-step="1" data-cart-index="${index}" aria-label="Increase ${escapeHtml(dish.name)} quantity">+</button>
            </div>
          </div>
          <div class="cart-row__end">
            <strong>${formatPrice(unitPrice(dish, item.selections) * item.quantity)}</strong>
            <button type="button" data-cart-remove="${index}" aria-label="Remove ${escapeHtml(dish.name)} from the order bag">${icon('trash')} Remove</button>
          </div>
        </li>`;
      })
      .join('');
  }

  subtotalEl.textContent = formatPrice(cart.subtotal());
  orderButton.disabled = !items.length;
  clearButton.disabled = !items.length;
}

function closeCart() {
  const panel = cartPanel();
  if (!panel?.classList.contains('is-open')) return;
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  document.querySelector('[data-cart-toggle]')?.setAttribute('aria-expanded', 'false');
  syncBodyLock();
}

function initCart() {
  const panel = cartPanel();
  const toggle = document.querySelector('[data-cart-toggle]');
  if (!panel || !toggle || toggle.dataset.ready) return;
  toggle.dataset.ready = 'true';

  toggle.addEventListener('click', () => {
    const open = !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    closeNav();
    closeDropdown();
    syncBodyLock();
    if (open) panel.querySelector('[data-cart-close]')?.focus();
  });
  panel.addEventListener('click', (event) => {
    if (event.target.closest('[data-cart-close]') || event.target === panel) return closeCart();
    const step = event.target.closest('[data-cart-step]');
    if (step) {
      const index = Number(step.dataset.cartIndex);
      const item = cart.getItems()[index];
      if (item) cart.stepQuantity(cartLineKey(item), Number(step.dataset.cartStep));
      return;
    }
    const remove = event.target.closest('[data-cart-remove]');
    if (remove) {
      const index = Number(remove.dataset.cartRemove);
      const item = cart.getItems()[index];
      if (item) cart.remove(cartLineKey(item));
      return;
    }
    if (event.target.closest('[data-cart-clear]')) {
      cart.clear();
      toast('Order bag cleared.');
      return;
    }
    if (event.target.closest('[data-cart-order]')) {
      const lines = cart.orderLines();
      if (!lines.length) return toast('Add a dish to your order bag first.');
      orderNow(lines);
      panel.querySelector('[data-cart-feedback]').textContent =
        'WhatsApp opened with every item in your bag. The cafe confirms availability, price and the order in the chat.';
    }
  });
  cart.subscribe(renderCart);
  renderCart();
}

/* -------------------------------------------------- global order handlers */

function initOrderButtons() {
  if (document.documentElement.dataset.orderReady) return;
  document.documentElement.dataset.orderReady = 'true';

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.hasAttribute('data-wa-enquiry')) {
      const lines = cart.orderLines();
      if (lines.length) orderNow(lines);
      else openWhatsApp(buildEnquiryMessage());
      return;
    }
    if (button.hasAttribute('data-wa-contact')) {
      openWhatsApp(buildEnquiryMessage(`Hello ${site.name}! I'd like to ask about the menu, timings and table availability.`));
      return;
    }
    const slug = button.dataset.orderCard || button.dataset.orderSignature;
    if (slug) {
      const dish = dishBySlug(slug);
      if (!dish) return;
      const lines = combineOrderLines([orderItem(dish)], cart.orderLines());
      button.dataset.orderMessage = buildOrderMessage(lines);
      orderNow(lines);
      return;
    }
    if (button.dataset.addToCart) {
      const dish = dishBySlug(button.dataset.addToCart);
      if (!dish) return;
      cart.add(dish);
      toast(`${dish.name} added to your order bag.`);
    }
  });
}

/* ----------------------------------------------------------------- reveals */

let revealObserver = null;
function reveal(root) {
  const items = Array.from(root.querySelectorAll('.reveal'));
  if (!items.length) return;
  if (reduceMotion() || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  items.forEach((item) => revealObserver.observe(item));
}

/* -------------------------------------------------------------- public API */

/** Close every overlay — called by the router before each page render. */
export function closeOverlays() {
  closeNav();
  closeDropdown();
  closeCart();
  closeLightbox();
}

/** Called after each route render. */
export function afterRender(main) {
  renderContactSlots(document);
  reveal(main);
  renderCart();
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

/** Called once on application start. */
export function initChrome() {
  guardImages();
  initHeader();
  initMobileNav();
  initDropdown();
  initLightbox();
  initCart();
  initOrderButtons();
  renderContactSlots(document);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCart();
  });
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

/** Re-render config-driven UI (used when site settings change). */
export const refreshChrome = () => renderContactSlots(document);

export { toast, copyText } from './notify.js';
export { icons } from './icons.js';
export { isConfigured };
