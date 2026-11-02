/** Inline icon set — stroke icons inherit currentColor; WhatsApp uses its glyph. */
const stroke = (paths, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${paths}</svg>`;

export const icons = {
  arrowRight: stroke('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
  arrowLeft: stroke('<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>'),
  arrowUpRight: stroke('<path d="M7 17 17 7"/><path d="M8 7h9v9"/>'),
  chevronRight: stroke('<path d="m9 6 6 6-6 6"/>'),
  chevronLeft: stroke('<path d="m15 6-6 6 6 6"/>'),
  chevronDown: stroke('<path d="m6 9 6 6 6-6"/>'),
  cart: stroke('<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/>'),
  plus: stroke('<path d="M12 5v14"/><path d="M5 12h14"/>'),
  minus: stroke('<path d="M5 12h14"/>'),
  trash: stroke('<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>'),
  external: stroke('<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
  menu: stroke('<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>'),
  close: stroke('<path d="m6 6 12 12"/><path d="m18 6-12 12"/>'),
  search: stroke('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>'),
  location: stroke('<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>'),
  clock: stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  phone: stroke('<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"/>'),
  mail: stroke('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/>'),
  leaf: stroke('<path d="M20 4C10 4 4.5 8.4 4.5 15A4.5 4.5 0 0 0 9 19.5C15.5 19.5 20 14 20 4Z"/><path d="M4 20c1.5-5 5-8 10-10"/>'),
  sparkle: stroke('<path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9 12 3.5Z"/>'),
  check: stroke('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.6L16 9.7"/>'),
  cup: stroke('<path d="M6 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8Z"/><path d="M17 9h1.7a2.8 2.8 0 0 1 0 5.5H17"/><path d="M4.5 21h13"/>'),
  info: stroke('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.8h.01"/>'),
  expand: stroke('<path d="M9 4H4v5"/><path d="M15 4h5v5"/><path d="M15 20h5v-5"/><path d="M9 20H4v-5"/>'),
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95L12 2.6Z"/></svg>',
  instagram: stroke('<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><path d="M17 6.8h.01"/>', 'stroke-width="1.6"'),
  facebook: stroke('<path d="M14.5 8.5h2.5V5h-2.5A4 4 0 0 0 10.5 9v2H8v3.5h2.5V21H14v-6.5h2.7l.5-3.5H14V9.4c0-.6.2-.9.5-.9Z"/>', 'stroke-width="1.5"'),
  whatsapp:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Z"/><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>',
};

export const icon = (name) => icons[name] ?? '';

/** Brand mark: a mango tree in a circle of leaves. */
export function treeMark(className = 'brand__mark') {
  return `<svg class="${className}" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="22.5" stroke="currentColor" stroke-opacity=".45" stroke-width="1.2"/>
    <path d="M24 40V23" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M24 31.5c-4.4 0-7-3.1-7-7.4 4.6 0 7 2.9 7 7.4Z" fill="currentColor" opacity=".8"/>
    <path d="M24 34.5c4.3 0 6.8-3.1 6.8-7.4-4.5 0-6.8 2.9-6.8 7.4Z" fill="currentColor" opacity=".6"/>
    <circle cx="17.4" cy="16.8" r="6.1" fill="currentColor"/>
    <circle cx="30.6" cy="16.8" r="6.1" fill="currentColor"/>
    <circle cx="24" cy="13.6" r="6.6" fill="currentColor"/>
  </svg>`;
}
