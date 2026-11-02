/**
 * The Mango Tree Cafe — site-wide settings.
 *
 * Everything here is intentionally editable. Fields left blank are treated as
 * "not provided yet" and the UI degrades gracefully instead of inventing data.
 *
 * WHATSAPP ORDERING
 * -----------------
 * Put the cafe's WhatsApp number in `whatsapp` as digits only, including the
 * country code (India: 91) and WITHOUT a leading +, spaces or dashes.
 * Example: whatsapp: '919876543210'
 * Until a number is added, order buttons show a friendly notice and copy the
 * order text to the clipboard so nothing is lost.
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

  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Chhapra%2C+Bihar%2C+India',

  /**
   * Disclosure shown in the gallery and footer. The photography on this site is
   * illustrative only and must not be presented as photos of the real cafe.
   */
  photographyNote:
    'Food and ambience photographs on this site are illustrative imagery, not photographs of The Mango Tree Cafe.',
  sampleNote:
    'Sample menu: items, descriptions, ingredients and prices are placeholders for design preview. Confirm everything with the cafe before publishing.',
};

export const isConfigured = (value) => typeof value === 'string' && value.trim().length > 0;

/** Normalise a phone number into wa.me format (digits only, optional +). */
export function normalisePhone(raw) {
  if (typeof raw !== 'string') return '';
  const digits = raw.replace(/[^\d]/g, '');
  return digits.length >= 8 ? digits : '';
}
