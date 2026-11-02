import { site, isConfigured } from '../data/site.js';
import { waLink, ORDER_INTRO } from './whatsapp.js';
import { guardImages } from './image.js';
import { icons } from './icons.js';

/* ----------------------------------------------------------------- runtime */

let toastTimer;
export function toast(message, timeout = 5200) {
  let node = document.querySelector('.toast');
  if (!node) {
    node = document.createElement('div');
    node.className = 'toast';
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('is-visible'), timeout);
}

export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/* --------------------------------------------------------------- whatsapp */

export const DEFAULT_WA_MESSAGE = `${ORDER_INTRO} I'd like to ask about the menu.`;

/**
 * Wire every [data-wa] call-to-action.
 * With a configured number these are ordinary wa.me links.
 * Without one (the default in this demo) clicking copies the message instead of
 * pretending an order was placed.
 */
export function wireWhatsApp(root = document) {
  root.querySelectorAll('[data-wa]').forEach((el) => {
    if (el.dataset.waReady) return;
    el.dataset.waReady = 'true';
    const message = el.dataset.waMessage || DEFAULT_WA_MESSAGE;
    const href = waLink(site.whatsapp, message);

    if (href) {
      el.href = href;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      return;
    }

    el.removeAttribute('href');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    const fallback = async (event) => {
      if (event) event.preventDefault();
      const copied = await copyText(message);
      toast(
        copied
          ? 'WhatsApp number not set up yet — we copied your message so you can send it once the cafe adds a number.'
          : 'WhatsApp ordering is not configured yet. Please add the cafe number in src/data/site.js.'
      );
    };
    el.addEventListener('click', fallback);
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') fallback(event);
    });
  });
}

export function whatsappConfigured() {
  return isConfigured(site.whatsapp) && Boolean(waLink(site.whatsapp, 'test'));
}

/* ------------------------------------------------------------ page chrome */

export function initChrome() {
  guardImages();

  const header = document.querySelector('.site-header');
  const solid = header?.classList.contains('site-header--solid');
  const onScroll = () => {
    if (!header || solid) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-nav');
  const closeNav = () => {
    if (!drawer?.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    toggle?.setAttribute('aria-label', 'Open navigation');
  };
  toggle?.addEventListener('click', () => {
    const open = drawer.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('is-locked', open);
  });
  drawer?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 920) closeNav();
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  wireWhatsApp();

  // Reveal-on-scroll, respecting reduced-motion preferences.
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  items.forEach((item) => observer.observe(item));
}

/* ---------------------------------------------------------------- lightbox */

export function initLightbox() {
  const grid = document.querySelector('[data-gallery]');
  if (!grid) return;

  let box = null;
  let lastFocus = null;

  const close = () => {
    if (!box) return;
    box.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    lastFocus?.focus?.();
  };

  const build = () => {
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Expanded photograph');
    box.innerHTML = `<button class="lightbox__close" type="button" aria-label="Close photograph">${icons.close}</button><img alt="" />`;
    document.body.appendChild(box);
    box.addEventListener('click', (event) => {
      if (event.target === box || event.target.closest('.lightbox__close')) close();
    });
    return box;
  };

  const open = (src, alt, trigger) => {
    const node = box ?? build();
    lastFocus = trigger;
    node.querySelector('img').src = src;
    node.querySelector('img').alt = alt;
    node.classList.add('is-open');
    document.body.classList.add('is-locked');
    node.querySelector('.lightbox__close').focus();
  };

  const activate = (figure) => {
    const image = figure.querySelector('img');
    if (!image) return;
    open(image.currentSrc || image.src, image.alt, figure);
  };

  grid.addEventListener('click', (event) => {
    const figure = event.target.closest('figure');
    if (figure) activate(figure);
  });

  grid.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const figure = event.target.closest('figure');
    if (!figure) return;
    event.preventDefault();
    activate(figure);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

/* Re-export so page scripts only need one import for icons. */
export { icons } from './icons.js';
