/** Custom 404 for unknown routes and invalid /menu/[slug] URLs. */
import { ROUTES } from '../links.js';
import { icon } from '../icons.js';
import { breadcrumb } from '../components.js';
import { escapeHtml } from '../utils.js';

export const meta = () => ({
  title: '404 · Page not found · The Mango Tree Cafe',
  description: 'The page or dish you were looking for could not be found. Browse the menu or return home.',
  robots: 'noindex',
});

export function render(route) {
  const dishSlug = route.params?.slug;
  const isDish = Boolean(dishSlug);
  return `
    <section class="page-hero page-hero--404">
      <div class="container">
        ${breadcrumb([{ label: 'Home', href: ROUTES.home }, ...(isDish ? [{ label: 'Menu', href: ROUTES.menu }] : []), { label: '404' }])}
        <p class="not-found__code" aria-hidden="true">404</p>
        <h1>${isDish ? 'We couldn’t find<br /><em>that dish.</em>' : 'This page<br /><em>isn’t on the menu.</em>'}</h1>
        <p>${
          isDish
            ? `The dish “${escapeHtml(dishSlug)}” is not part of the sample menu, or the link is out of date.`
            : 'The link may be out of date, or the page may have moved. Everything below is a real, working page.'
        }</p>
        <div class="not-found__actions">
          <a class="btn btn--green" href="${ROUTES.home}">Go to homepage ${icon('arrowRight')}</a>
          <a class="btn btn--ghost" href="${ROUTES.menu}">View Menu ${icon('arrowRight')}</a>
          <a class="btn btn--ghost" href="${ROUTES.gallery}">View Gallery ${icon('arrowRight')}</a>
          <a class="btn btn--ghost" href="${ROUTES.contact}">Contact ${icon('arrowRight')}</a>
        </div>
      </div>
    </section>
  `;
}
