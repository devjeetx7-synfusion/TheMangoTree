/** Published Privacy Policy and Terms pages (linked from the footer). */
import { site } from '../../data/site.js';
import { ROUTES } from '../links.js';
import { icon } from '../icons.js';
import { breadcrumb } from '../components.js';

const PAGES = {
  privacy: {
    label: 'Privacy Policy',
    intro: 'How this preview website handles information.',
    sections: [
      ['No server-side collection', 'This website is a static site. It has no accounts, no server-side forms, no analytics and no tracking scripts. Nothing you enter here is sent to a server by this website.'],
      ['Your order bag', 'Dishes you add to the order bag are stored only in your own browser (localStorage) so the list survives a page refresh. You can clear it at any time with the “Clear bag” button.'],
      ['WhatsApp messages', 'When you choose to order or enquire, a pre-filled message is opened in WhatsApp. That message and your phone number are handled by WhatsApp under its own privacy policy; the cafe receives only what you choose to send.'],
      ['Photography and menu', site.photographyNote + ' ' + site.sampleNote],
      ['Contact details', 'Phone, address, hours and social links are shown only when the cafe has supplied them. No placeholder is presented as real contact information.'],
    ],
  },
  terms: {
    label: 'Terms of Use',
    intro: 'Conditions for using this design preview.',
    sections: [
      ['Illustrative content', site.photographyNote + ' They are not presented as photographs of the venue.'],
      ['Sample menu', site.sampleNote + ' Do not rely on these items, ingredients, allergens, prices or availability as an offer from the cafe.'],
      ['No online ordering or payment', 'The website does not take payment, place orders or confirm orders. It only prepares a message for WhatsApp. ' + site.orderNote],
      ['No guarantee', 'Content on this preview may change or be removed. Confirm all details directly with the cafe before visiting or ordering.'],
      ['External services', 'WhatsApp and Google Maps are third-party services with their own terms. Links to them are only enabled when correctly configured.'],
    ],
  },
};

export const meta = (route) => ({
  title: `${PAGES[route.name]?.label ?? 'Information'} · The Mango Tree Cafe`,
  description: PAGES[route.name]?.intro ?? 'Information about The Mango Tree Cafe website.',
});

export function render(route) {
  const page = PAGES[route.name];
  if (!page) return '';
  return `
    <section class="page-hero">
      <div class="container">
        ${breadcrumb([{ label: 'Home', href: ROUTES.home }, { label: page.label }])}
        <h1>${page.label}</h1>
        <p>${page.intro}</p>
      </div>
    </section>
    <section class="section section--tight">
      <div class="container legal-page">
        ${page.sections.map(([heading, body]) => `<article class="legal-block"><h2>${heading}</h2><p>${body}</p></article>`).join('')}
        <p class="legal-updated">Last updated for this design preview. Replace with the cafe’s approved policy before launch.</p>
        <p class="btn-row">
          <a class="btn btn--green" href="${ROUTES.home}">Back to home ${icon('arrowRight')}</a>
          <a class="btn btn--ghost-dark" href="${ROUTES.menu}">View Menu ${icon('arrowRight')}</a>
        </p>
      </div>
    </section>
  `;
}
