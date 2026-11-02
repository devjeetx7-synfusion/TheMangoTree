/**
 * The Mango Tree Cafe — site-wide settings (single source of truth).
 *
 * Everything here is intentionally editable. Fields left blank are treated as
 * "not provided yet": the UI shows a clear "to be confirmed" state and omits
 * the corresponding link instead of inventing a phone number, address or
 * social profile.
 *
 * WHATSAPP ORDERING
 * -----------------
 * Put the cafe's real WhatsApp number in `whatsapp` as digits only, including
 * the country code (India: 91) and WITHOUT a leading +, spaces or dashes.
 * Example: whatsapp: '919876543210'
 * Until a number is added, order buttons never pretend an order was placed:
 * they copy the ready-to-send order text to the clipboard and explain that
 * WhatsApp ordering is not connected yet.
 *
 * The website is a preview: it does not charge, place or confirm orders. The
 * cafe confirms availability, customisation, the final price and the order in
 * the WhatsApp chat itself.
 */

export const site = {
  name: 'The Mango Tree Cafe',
  wordmark: 'The Mango Tree',
  wordmarkSub: 'Cafe',
  tagline: 'Cafe · Food · Friends · Good Vibes',
  shortCity: 'Chhapra, Bihar',
  city: 'Chhapra, Bihar, India',
  currency: '₹',

  // Leave blank until the cafe confirms these details.
  whatsapp: '',
  phone: '',
  email: '',
  address: '',
  hours: '',

  instagram: '',
  facebook: '',

  /** Only shown as a directions link when BOTH the address and URL are set. */
  mapsUrl: '',

  /**
   * Disclosures. The photography is illustrative only and must never be
   * presented as photographs of the real cafe. The menu is sample content.
   */
  photographyNote:
    'Food and ambience photographs on this site are illustrative imagery, not photographs of The Mango Tree Cafe.',
  sampleNote:
    'Sample menu: items, descriptions, ingredients and prices are placeholders for this design preview. Confirm everything with the cafe before publishing.',
  orderNote:
    'Nothing is charged or confirmed here. The cafe confirms availability, customisation, the final price and your order in the WhatsApp chat.',
};

export const isConfigured = (value) => typeof value === 'string' && value.trim().length > 0;

/** Normalise a phone number into wa.me format (digits only, optional +). */
export function normalisePhone(raw) {
  if (typeof raw !== 'string') return '';
  const digits = raw.replace(/[^\d]/g, '');
  return digits.length >= 8 ? digits : '';
}

/** tel: link for a configured phone number, or '' when unconfigured. */
export function phoneHref(raw) {
  const digits = normalisePhone(raw);
  return digits ? `tel:+${digits}` : '';
}

/** Directions link — only when a real address and a real maps URL are supplied. */
export function directionsHref() {
  return isConfigured(site.address) && isConfigured(site.mapsUrl) ? site.mapsUrl.trim() : '';
}

/** Only real, configured profile URLs are ever turned into links. */
export function socialLinks() {
  return [
    { id: 'instagram', label: 'Instagram', url: site.instagram },
    { id: 'facebook', label: 'Facebook', url: site.facebook },
  ].filter((entry) => isConfigured(entry.url) && /^https?:\/\//i.test(entry.url.trim()));
}
