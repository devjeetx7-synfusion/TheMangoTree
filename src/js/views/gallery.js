/** Photo gallery (/gallery) — every tile opens the full-size lightbox. */
import { galleryPhotos } from '../../data/photography.js';
import { site } from '../../data/site.js';
import { ROUTES } from '../links.js';
import { icon } from '../icons.js';
import { galleryTile, breadcrumb } from '../components.js';

export const meta = () => ({
  title: 'Gallery · The Mango Tree Cafe',
  description: 'Illustrative food and ambience photography. These are not photographs of The Mango Tree Cafe.',
});

export function render() {
  return `
    <section class="page-hero">
      <div class="container">
        ${breadcrumb([{ label: 'Home', href: ROUTES.home }, { label: 'Gallery' }])}
        <h1>A feast<br /><em>for the eyes.</em></h1>
        <p>Illustrative food and ambience photography for this design preview. Tap any photograph to open it full size, then use the arrows or your keyboard to browse.</p>
        <p class="page-hero__note">${icon('info')} ${site.photographyNote}</p>
      </div>
    </section>

    <section class="section section--tight gallery">
      <div class="container">
        <div class="gallery-grid" data-gallery data-lightbox-group="gallery">
          ${galleryPhotos.map((photo, index) => galleryTile(photo, index, 'gallery')).join('')}
        </div>
        <p class="gallery-note">${icon('info')}<span><strong>Lightbox:</strong> click a photo, then use previous / next, the ← → arrow keys, or Escape to close. “Open full size” opens the original WebP file.</span></p>
        <p class="gallery-note">${icon('info')}<span><strong>Please note:</strong> ${site.photographyNote} They are not stock photos presented as the cafe’s own; real cafe photography will replace them when available.</span></p>
        <p class="btn-row">
          <a class="btn btn--green" href="${ROUTES.menu}">View Menu ${icon('arrowRight')}</a>
          <a class="btn btn--ghost-dark" href="${ROUTES.about}">Our Story ${icon('arrowRight')}</a>
          <a class="btn btn--ghost-dark" href="${ROUTES.contact}">Contact ${icon('arrowRight')}</a>
        </p>
      </div>
    </section>
  `;
}
