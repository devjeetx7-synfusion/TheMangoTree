/** Contact page (/contact) — only configured details become links. */
import { site } from '../../data/site.js';
import { ROUTES } from '../links.js';
import { icon } from '../icons.js';
import { breadcrumb } from '../components.js';

export const meta = () => ({
  title: 'Contact · The Mango Tree Cafe',
  description: `Contact details, opening hours and WhatsApp messaging for The Mango Tree Cafe in ${site.city}. Unverified details are clearly marked as to be confirmed.`,
});

export function render() {
  return `
    <section class="page-hero">
      <div class="container">
        ${breadcrumb([{ label: 'Home', href: ROUTES.home }, { label: 'Visit Us' }])}
        <h1>Say hello.<br /><em>Your table is waiting.</em></h1>
        <p>Message us on WhatsApp for the menu, timings and table availability. ${site.orderNote}</p>
        <p class="page-hero__note">${icon('location')} ${site.city}</p>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container contact-grid">
        <div class="contact-panel">
          <p class="eyebrow">Visit &amp; contact</p>
          <h2>Find us in<br /><em>${site.city}.</em></h2>
          <div class="contact-rows">
            <div class="visit-row">${icon('location')}<div><p class="visit-row__label">Address</p><p class="visit-row__value"><span data-contact="address" data-fallback="Exact address to be confirmed"></span></p></div></div>
            <div class="visit-row">${icon('clock')}<div><p class="visit-row__label">Opening hours</p><p class="visit-row__value"><span data-contact="hours" data-fallback="Opening hours to be confirmed"></span></p></div></div>
            <div class="visit-row">${icon('phone')}<div><p class="visit-row__label">Phone</p><p class="visit-row__value"><span data-contact="phone" data-fallback="Phone number to be confirmed"></span></p></div></div>
            <div class="visit-row">${icon('mail')}<div><p class="visit-row__label">Email</p><p class="visit-row__value"><span data-contact="email" data-fallback="Email to be confirmed"></span></p></div></div>
            <div class="visit-row">${icon('whatsapp')}<div><p class="visit-row__label">WhatsApp</p><p class="visit-row__value"><span data-contact="whatsapp" data-fallback="WhatsApp number to be confirmed"></span></p></div></div>
          </div>
          <div class="contact-links" data-directions></div>
          <div class="contact-links" data-socials></div>
          <p class="fine-print">No contact details are invented. Links appear here only after the cafe supplies a real phone number, street address, opening hours or social profile.</p>
        </div>

        <div class="visit-panel contact-cta">
          <div class="visit-panel__copy">
            <p class="eyebrow eyebrow--light">Message us</p>
            <h2>Let’s talk<br /><em>on WhatsApp.</em></h2>
            <p>Ask about the menu, availability, timings or a table. Add dishes to your order bag and send the whole order in one message if you like.</p>
            <div class="visit-actions">
              <button class="btn btn--wa" type="button" data-wa-contact>${icon('whatsapp')} Message on WhatsApp</button>
              <a class="btn btn--outline-light" href="${ROUTES.menu}">View the menu ${icon('arrowRight')}</a>
            </div>
            <p class="fine-print">${site.orderNote}</p>
          </div>
          <div class="visit-card">
            <div class="visit-row">${icon('info')}<div><p class="visit-row__label">Sample menu</p><p class="visit-row__value">${site.sampleNote}</p></div></div>
            <div class="visit-row">${icon('info')}<div><p class="visit-row__label">Illustrative photography</p><p class="visit-row__value">${site.photographyNote}</p></div></div>
            <div class="btn-row">
              <a class="link-arrow" href="${ROUTES.gallery}">View the gallery ${icon('arrowRight')}</a>
              <a class="link-arrow" href="${ROUTES.about}">Our story ${icon('arrowRight')}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
