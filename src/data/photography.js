/**
 * Photography registry.
 *
 * ⚠️ ILLUSTRATIVE IMAGERY
 * None of these photographs were taken at The Mango Tree Cafe. They are
 * illustrative food and ambience photography used until the cafe provides its
 * own. Captions, alt text, the gallery, dish pages and footer all say so
 * explicitly — please keep that disclosure.
 */

export const heroPhoto = {
  base: 'hero-spread',
  alt: 'Illustrative photograph of a cafe table spread with a burger, fries, pizza and a chocolate shake',
};

export const aboutPhotos = [
  {
    base: 'cafe-interior',
    alt: 'Illustrative photograph of a warm cafe interior with green banquettes and pendant lighting',
  },
  {
    base: 'cafe-seating',
    alt: 'Illustrative photograph of comfortable cafe seating by a window',
  },
  {
    base: 'cafe-table-food',
    alt: 'Illustrative photograph of food served on a cafe table',
  },
];

/** Every photograph shown on the gallery page (and in its lightbox). */
export const galleryPhotos = [
  {
    base: 'cafe-interior',
    alt: 'Illustrative cafe interior with green velvet banquettes and warm pendant lights',
    caption: 'Illustrative · dining room',
    span: 'wide',
  },
  {
    base: 'pizza-margherita',
    alt: 'Illustrative margherita pizza with basil on a slate board',
    caption: 'Illustrative · pizza',
  },
  {
    base: 'cake-chocolate-truffle',
    alt: 'Illustrative slice of chocolate truffle cake with glossy ganache',
    caption: 'Illustrative · dessert',
    span: 'tall',
  },
  {
    base: 'cafe-table-food',
    alt: 'Illustrative food served on a cafe table with cutlery and drinks',
    caption: 'Illustrative · table setting',
  },
  {
    base: 'cafe-seating',
    alt: 'Illustrative green velvet banquette seating beside a sunlit window with plants',
    caption: 'Illustrative · seating',
  },
  {
    base: 'burger-loaded-signature',
    alt: 'Illustrative loaded double-patty burger with melting cheese on a dark plate',
    caption: 'Illustrative · burger',
  },
  {
    base: 'coffee-cold',
    alt: 'Illustrative cold coffee in a tall glass topped with chocolate',
    caption: 'Illustrative · cold coffee',
  },
  {
    base: 'shake-oreo',
    alt: 'Illustrative cookie milkshake in a tall glass topped with whipped cream',
    caption: 'Illustrative · thick shake',
  },
];

/** Short teaser grid on the homepage — links through to /gallery. */
export const homeGalleryPhotos = galleryPhotos.slice(0, 4);

/** Photos used by a lightbox group. */
export const lightboxGroup = (group) => (group === 'home' ? homeGalleryPhotos : galleryPhotos);

export const ambiencePhoto = {
  base: 'cafe-table-food',
  alt: 'Illustrative photograph of a relaxed cafe table setting',
};

export const heroChips = ['Wood-fired pizza', 'Slow-brewed coffee', 'Fresh desserts', 'Made for sharing'];
