/**
 * Centralised WhatsApp ordering.
 *
 * Every "Order now" / "Order on WhatsApp" button on the site goes through
 * `orderNow()` → `buildOrderMessage()` → `openWhatsApp()`. The phone number is
 * read only from `site.whatsapp` (src/data/site.js). When it is not configured,
 * the message is copied to the clipboard and a clear notice is shown — the site
 * never claims an order has been placed or confirmed.
 */
import { formatPrice, dietLabel } from '../data/menu.js';
import { site, normalisePhone } from '../data/site.js';
import { clampInt, cartLineKey } from './utils.js';
import { toast, copyText } from './notify.js';

export const ORDER_INTRO = `Hello ${site.name}! I'd like to ask about an order:`;
export const ENQUIRY_MESSAGE = `Hello ${site.name}! I'd like to ask about the menu, timings and table availability.`;
export const SAMPLE_PRICE_LINE = 'Prices are sample values shown on the website, not a bill.';
export const CONFIRM_LINE =
  'Please confirm availability, customisation, the final price and the order in this WhatsApp chat. Nothing is confirmed until the cafe replies.';

/** WhatsApp deep link for a number in digits-only format, with encoded text. */
export function waLink(number, message) {
  const digits = normalisePhone(number);
  if (!digits) return '';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Total for one unit including selected option deltas (sample pricing). */
export function unitPrice(dish, selections = {}) {
  let total = dish.price;
  (dish.options || []).forEach((option) => {
    const picked = selections[option.id];
    if (!picked) return;
    const ids = Array.isArray(picked) ? picked : [picked];
    ids.forEach((id) => {
      const choice = option.choices.find((item) => item.id === id);
      if (choice) total += choice.delta || 0;
    });
  });
  return total;
}

/** Human-readable selected option labels for an order line. */
export function optionLines(dish, selections = {}) {
  return (dish.options || [])
    .map((option) => {
      const picked = selections[option.id];
      if (!picked) return '';
      const ids = Array.isArray(picked) ? picked : [picked];
      const labels = ids
        .map((id) => option.choices.find((choice) => choice.id === id)?.label)
        .filter(Boolean);
      return labels.length ? `${option.label}: ${labels.join(', ')}` : '';
    })
    .filter(Boolean);
}

/** A normalised order line. */
export function orderItem(dish, { quantity = 1, selections = {}, note = '' } = {}) {
  return {
    dish,
    quantity: clampInt(quantity, 1, 20, 1),
    selections: selections && typeof selections === 'object' ? selections : {},
    note: String(note || '').trim(),
  };
}

export const lineTotal = (item) => unitPrice(item.dish, item.selections) * item.quantity;
export const orderSubtotal = (items) => items.reduce((sum, item) => sum + lineTotal(item), 0);

/**
 * Merge the dish currently being ordered with the persisted order bag. When the
 * same dish, options and note are already in the bag, add the quantities rather
 * than listing (and charging) the same line twice.
 */
export function combineOrderLines(selectedLines = [], cartLines = []) {
  const lines = cartLines
    .filter((line) => line && line.dish && line.dish.slug)
    .map((line) => ({ ...line, selections: { ...(line.selections || {}) } }));
  const keyOf = (line) => cartLineKey({
    slug: line.dish.slug,
    selections: line.selections,
    note: line.note || line.selections?.__note || '',
  });

  for (const selected of selectedLines.filter((line) => line && line.dish && line.dish.slug)) {
    const clean = { ...selected, selections: { ...(selected.selections || {}) } };
    const key = keyOf(clean);
    const existing = lines.find((line) => keyOf(line) === key);
    if (existing) {
      existing.quantity = clampInt(Number(existing.quantity) + Number(clean.quantity || 1), 1, 20, 20);
    } else {
      lines.unshift(clean);
    }
  }
  return lines;
}

/**
 * Build a copy-paste friendly order message.
 *
 * Accepts either an array of order lines (cart / multi-item ordering) or a
 * single dish with `{ quantity, selections, note }` options for convenience.
 */
export function buildOrderMessage(itemsOrDish, options = {}) {
  const isMulti = Array.isArray(itemsOrDish);
  const items = isMulti
    ? itemsOrDish.filter((item) => item?.dish)
    : [orderItem(itemsOrDish, options)];
  const lines = [ORDER_INTRO, ''];

  items.forEach((item, index) => {
    const { dish, quantity, selections, note } = item;
    lines.push(`${index + 1}. ${dish.name} × ${quantity}`);
    optionLines(dish, selections).forEach((line) => lines.push(`   • ${line}`));
    if (note) lines.push(`   • Note: ${note}`);
    lines.push(
      `   ${formatPrice(unitPrice(dish, selections))} each × ${quantity} = ${formatPrice(lineTotal(item))} (sample)`
    );
  });

  // A note on a single-dish call is already printed on its line. Only an
  // explicitly supplied note for a multi-item order is added globally.
  if (isMulti && options.note?.trim()) lines.push('', `Order note: ${options.note.trim()}`);

  lines.push('', `Website sample subtotal (${items.length} ${items.length === 1 ? 'line' : 'lines'}): ${formatPrice(orderSubtotal(items))}`);
  lines.push(SAMPLE_PRICE_LINE, '', CONFIRM_LINE);
  return lines.join('\n');
}

/** General enquiry (header / footer / contact) when no dish is selected. */
export function buildEnquiryMessage(question = ENQUIRY_MESSAGE) {
  return [question, '', CONFIRM_LINE].join('\n');
}

let lastOrder = null;
export const getLastOrder = () => lastOrder;

/**
 * Open WhatsApp (or gracefully fall back when no number is configured).
 * A real anchor is used instead of window.open so Android app links and
 * desktop browsers with popup blockers both work.
 */
export function openWhatsApp(message) {
  const url = waLink(site.whatsapp, message);
  lastOrder = { message, url, configured: Boolean(url) };

  if (!url) {
    copyText(message).then((copied) => {
      toast(
        copied
          ? 'WhatsApp number not set up yet — your order text was copied so you can send it once the cafe adds a number. The cafe confirms the order in the chat.'
          : 'WhatsApp ordering is not configured yet. Add the cafe number in src/data/site.js to enable it.'
      );
    });
    return { opened: false, url: '', message };
  }

  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-hidden', 'true');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  toast('WhatsApp opened with your order details. The cafe confirms availability, price and the order in the chat.');
  return { opened: true, url, message };
}

/** Single entry point used by every ordering button. */
export function orderNow(itemsOrDish, options = {}) {
  return openWhatsApp(buildOrderMessage(itemsOrDish, options));
}

export function dietText(dish) {
  return dietLabel(dish.diet);
}
