/** About the cafe (/about). */
import { aboutPhotos } from '../../data/photography.js';
import { site } from '../../data/site.js';
import { img } from '../image.js';
import { ROUTES } from '../links.js';
import { icon } from '../icons.js';
import { breadcrumb } from '../components.js';

export const meta = () => ({
  title: 'Our Story · The Mango Tree Cafe',
  description: `The story behind The Mango Tree Cafe in ${site.city}. Photography and menu details on this preview site are illustrative sample content.`,
});

export function render() {
  return `
    <section class="page-hero">
      <div class="container">
        ${breadcrumb([{ label: 'Home', href: ROUTES.home }, { label: 'About' }])}
        <h1>More than a cafe,<br /><em>a place to belong.</em></h1>
        <p>A warm little corner of ${site.city} — good food, soft lighting and company that makes an ordinary afternoon feel like an occasion.</p>
      </div>
    </section>

    <section class="section about">
      <div class="container about-grid">
        <div class="about-collage reveal">
          <figure class="about-collage__main">${img(aboutPhotos[0].base, { alt: aboutPhotos[0].alt, sizes: '(max-width: 920px) 92vw, 42vw' })}</figure>
          <figure class="about-collage__small">${img(aboutPhotos[1].base, { alt: aboutPhotos[1].alt, sizes: '(max-width: 720px) 44vw, 20vw' })}</figure>
          <figure class="about-collage__small about-collage__small--offset">
            ${img(aboutPhotos[2].base, { alt: aboutPhotos[2].alt, sizes: '(max-width: 720px) 44vw, 20vw' })}
            <span class="about-collage__badge">${site.shortCity}</span>
          </figure>
        </div>
        <div class="about-copy reveal">
          <p class="eyebrow">Our story</p>
          <h2>Come hungry.<br /><em>Leave happy.</em></h2>
          <p>The Mango Tree Cafe is a place for long conversations, quick bites and everything in between. Come for a quick coffee, stay for a long conversation — there is room for every craving, every catch-up and every reason to linger a little longer.</p>
          <p>This website is a design preview: the menu is sample content and the photographs are illustrative. Real details will be added once the cafe confirms them.</p>
          <ul class="value-list">
            <li>${icon('leaf')} Freshly prepared food, made to order</li>
            <li>${icon('cup')} Cosy ambience, warm lighting and slow evenings</li>
            <li>${icon('check')} Great company — and room for one more chair</li>
          </ul>
          <p class="btn-row">
            <a class="btn btn--green" href="${ROUTES.menu}">Explore Menu ${icon('arrowRight')}</a>
            <a class="btn btn--ghost-dark" href="${ROUTES.gallery}">View Gallery ${icon('arrowRight')}</a>
            <a class="btn btn--ghost-dark" href="${ROUTES.contact}">Contact ${icon('arrowRight')}</a>
          </p>
          <p class="fine-print">Interior and food photographs are illustrative, not photographs of the cafe. ${site.sampleNote}</p>
        </div>
      </div>
    </section>
  `;
}
