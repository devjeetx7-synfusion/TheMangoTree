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
        <p>Illustrative food and ambience photography for this design preview. Open any photograph to see it full size, then browse with the previous and next controls or your keyboard.</p>
        <p class="page-hero__note">${icon('info')} ${site.photographyNote}</p>
      </div>
    </section>

    <section class="section section--tight gallery">
      <div class="container">
        <h2 class="visually-hidden">Photographs</h2>
        <div class="gallery-grid" data-gallery data-lightbox-group="gallery">
          ${galleryPhotos.map((photo, index) => galleryTile(photo, index, 'gallery')).join('')}
        </div>

        <p class="gallery-note">${icon('info')}<span><strong>Lightbox:</strong> open a photograph, then use the previous / next buttons, the left and right arrow keys, or Escape to close. “Open full size” loads the original WebP file in a new tab.</span></p>
        <p class="gallery-note">${icon('info')}<span><strong>Please note:</strong> ${site.photographyNote} Real cafe photography will replace these images when it becomes available.</span></p>

        <div class="gallery-actions">
          <a class="btn btn--green" href="${ROUTES.menu}">View the menu ${icon('arrowRight')}</a>
          <a class="link-arrow" href="${ROUTES.about}">Our story ${icon('arrowRight')}</a>
          <a class="link-arrow" href="${ROUTES.contact}">Plan a visit ${icon('arrowRight')}</a>
        </div>
      </div>
    </section>
  `;
}
