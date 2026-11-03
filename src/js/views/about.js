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
        ${breadcrumb([{ label: 'Home', href: ROUTES.home }, { label: 'Our Story' }])}
        <h1>More than a cafe,<br /><em>a place to belong.</em></h1>
        <p>A warm little corner of ${site.city} — good food, soft lighting and company that makes an ordinary afternoon feel like an occasion.</p>
      </div>
    </section>

    <section class="section about">
      <div class="container about-grid">
        <div class="about-collage reveal">
          <figure class="about-collage__main">${img(aboutPhotos[0].base, { alt: aboutPhotos[0].alt, sizes: '(max-width: 920px) 92vw, 42vw' })}</figure>
          <figure class="about-collage__small">${img(aboutPhotos[1].base, { alt: aboutPhotos[1].alt, sizes: '(max-width: 920px) 44vw, 20vw' })}</figure>
          <figure class="about-collage__small about-collage__small--offset">
            ${img(aboutPhotos[2].base, { alt: aboutPhotos[2].alt, sizes: '(max-width: 920px) 44vw, 20vw' })}
            <span class="about-collage__badge">${site.shortCity}</span>
          </figure>
        </div>
        <div class="about-copy reveal">
          <p class="eyebrow">Our story</p>
          <h2>Come hungry.<br /><em>Leave happy.</em></h2>
          <p>The Mango Tree Cafe is a place for long conversations, quick bites and everything in between. Come for a quick coffee, stay for a long conversation — there is room for every craving, every catch-up and every reason to linger a little longer.</p>
          <p>We believe a good cafe is measured in small things: a table that feels like yours, a plate that arrives hot, and the feeling that nobody is rushing you out.</p>
          <ul class="value-list">
            <li>${icon('leaf')} Freshly prepared food, made to order</li>
            <li>${icon('cup')} Cosy ambience, warm lighting and slow evenings</li>
            <li>${icon('check')} Great company — and room for one more chair</li>
          </ul>
          <div class="btn-row">
            <a class="btn btn--green" href="${ROUTES.menu}">Explore the menu ${icon('arrowRight')}</a>
            <a class="btn btn--ghost-dark" href="${ROUTES.gallery}">View the gallery ${icon('arrowRight')}</a>
            <a class="btn btn--ghost-dark" href="${ROUTES.contact}">Plan a visit ${icon('arrowRight')}</a>
          </div>
          <p class="fine-print">This is a design preview: interior and food photographs are illustrative and the menu is sample content. ${site.sampleNote}</p>
        </div>
      </div>
    </section>

    <section class="section section--cream-2">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <p class="eyebrow">The everyday</p>
            <h2>What a visit<br /><em>looks like.</em></h2>
          </div>
          <div class="section-head__aside">
            <p>Simple intentions, no shortcuts. These are the things we care about most when we set a table.</p>
          </div>
        </div>
        <div class="principles reveal">
          <article class="principle">
            <span class="principle__icon">${icon('leaf')}</span>
            <h3>On the plate</h3>
            <p>Food made to order, plated to be shared and always worth the photo.</p>
          </article>
          <article class="principle">
            <span class="principle__icon">${icon('cup')}</span>
            <h3>In the cup</h3>
            <p>Coffee pulled fresh, cold shakes blended thick and desserts that finish the story.</p>
          </article>
          <article class="principle">
            <span class="principle__icon">${icon('check')}</span>
            <h3>At the table</h3>
            <p>Unhurried service and a seat for one more — whether it is a first date or a Tuesday lunch.</p>
          </article>
        </div>
        <p class="gallery-note">${icon('info')}<span>${site.photographyNote}</span></p>
      </div>
    </section>
  `;
}
