/** Small shared helpers for template rendering. */
export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const clampInt = (value, min, max, fallback = min) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

/** Stable key for a cart line (same dish + same choices + same note). */
export const cartLineKey = ({ slug, selections = {}, note = '' }) =>
  JSON.stringify([slug, selections, note.trim()]);
