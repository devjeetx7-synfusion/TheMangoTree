import { formatPrice, dietLabel } from '../data/menu.js';
import { site, normalisePhone } from '../data/site.js';

/** WhatsApp deep link for a number in digits-only format. */
export function waLink(number, message) {
  const digits = normalisePhone(number);
  if (!digits) return '';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const ORDER_INTRO = `Hello ${site.name}! I'd like to ask about an order:`;

/** Human-readable, copy-paste friendly order summary. */
export function buildOrderMessage(dish, { quantity = 1, selections = {}, note = '' } = {}) {
  const lines = [ORDER_INTRO, ''];
  lines.push(`${dish.name} × ${quantity}`);

  (dish.options || []).forEach((option) => {
    const picked = selections[option.id];
    if (!picked) return;
    const ids = Array.isArray(picked) ? picked : [picked];
    const labels = ids
      .map((id) => option.choices.find((choice) => choice.id === id)?.label)
      .filter(Boolean);
    if (labels.length) lines.push(`• ${option.label}: ${labels.join(', ')}`);
  });

  if (note.trim()) lines.push(`• Note: ${note.trim()}`);
  lines.push('', `Sample price shown on the website: ${formatPrice(dish.price)}`, '');
  lines.push('Please confirm availability, price and any extras. Thank you!');
  return lines.join('\n');
}

/** Total price including selected deltas (sample pricing). */
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

export function dietText(dish) {
  return dietLabel(dish.diet);
}
