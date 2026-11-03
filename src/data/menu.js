/**
 * The Mango Tree Cafe — menu data (SAMPLE CONTENT).
 *
 * ⚠️  Every item, description, ingredient list and price below is placeholder
 *     content written for the design preview. Nothing here has been supplied or
 *     confirmed by the cafe. Edit freely — the whole site reads from this file.
 *
 * `image` points to a base filename in /public/images (responsive PNG variants
 * are generated from /assets-src by `npm run images`). Every dish must have its
 * own photograph — `npm run verify` fails if a photo is missing or reused.
 *
 * To grow the menu: add a dish here AND a matching photo in assets-src, then run
 * `npm run images`. Categories adapt automatically.
 */

export const currency = '₹';
export const formatPrice = (value) => `${currency}${Number(value).toLocaleString('en-IN')}`;

export const categories = [
  { id: 'pizza', name: 'Pizza', blurb: 'Wood-fired bases, stretchy cheese', image: 'pizza-margherita' },
  { id: 'burgers', name: 'Burgers', blurb: 'Stacked buns, big bites', image: 'burger-loaded-signature' },
  { id: 'pasta-noodles', name: 'Pasta & Noodles', blurb: 'Comfort, twirled', image: 'pasta-alfredo' },
  { id: 'momos', name: 'Momos', blurb: 'Steamed, spiced, dipped', image: 'momos-steamed' },
  { id: 'sandwiches', name: 'Sandwiches', blurb: 'Toasted and generous', image: 'sandwich-club' },
  { id: 'snacks', name: 'Snacks & Fries', blurb: 'Crispy little joys', image: 'fries-salted' },
  { id: 'desserts', name: 'Desserts & Cakes', blurb: 'A sweet finish', image: 'cake-chocolate-truffle' },
  { id: 'coffee', name: 'Coffee & Shakes', blurb: 'Brewed, iced, blended', image: 'coffee-cappuccino' },
];

const options = {
  pizza: [
    {
      id: 'size',
      label: 'Choose a size',
      type: 'radio',
      required: true,
      choices: [
        { id: 'regular', label: 'Regular · 8 inch', delta: 0 },
        { id: 'large', label: 'Large · 12 inch', delta: 120 },
      ],
    },
    {
      id: 'extras',
      label: 'Add extras',
      type: 'checkbox',
      choices: [
        { id: 'extra-cheese', label: 'Extra cheese', delta: 40 },
        { id: 'jalapeno', label: 'Jalapeños', delta: 25 },
      ],
    },
  ],
  burgers: [
    {
      id: 'extras',
      label: 'Make it yours',
      type: 'checkbox',
      choices: [
        { id: 'cheese-slice', label: 'Extra cheese slice', delta: 30 },
        { id: 'meal', label: 'Make it a meal · fries + drink', delta: 99 },
        { id: 'jalapeno', label: 'Jalapeños', delta: 20 },
      ],
    },
  ],
  'pasta-noodles': [
    {
      id: 'spice',
      label: 'Spice level',
      type: 'radio',
      required: true,
      choices: [
        { id: 'mild', label: 'Mild', delta: 0 },
        { id: 'medium', label: 'Medium', delta: 0 },
        { id: 'spicy', label: 'Extra spicy', delta: 0 },
      ],
    },
    {
      id: 'extras',
      label: 'Add extras',
      type: 'checkbox',
      choices: [
        { id: 'extra-cheese', label: 'Extra cheese', delta: 30 },
        { id: 'garlic-bread', label: 'Garlic bread on the side', delta: 60 },
      ],
    },
  ],
  momos: [
    {
      id: 'spice',
      label: 'Chutney heat',
      type: 'radio',
      required: true,
      choices: [
        { id: 'mild', label: 'Mild', delta: 0 },
        { id: 'classic', label: 'House chutney', delta: 0 },
        { id: 'fiery', label: 'Fiery', delta: 0 },
      ],
    },
    {
      id: 'extras',
      label: 'Add extras',
      type: 'checkbox',
      choices: [
        { id: 'extra-chutney', label: 'Extra chutney', delta: 20 },
        { id: 'cheese-momos', label: 'Cheese-filled', delta: 40 },
      ],
    },
  ],
  sandwiches: [
    {
      id: 'extras',
      label: 'Add extras',
      type: 'checkbox',
      choices: [
        { id: 'extra-cheese', label: 'Extra cheese', delta: 30 },
        { id: 'fries', label: 'Fries on the side', delta: 50 },
      ],
    },
  ],
  snacks: [
    {
      id: 'extras',
      label: 'Add a dip',
      type: 'checkbox',
      choices: [
        { id: 'cheese-dip', label: 'Cheese dip', delta: 25 },
        { id: 'peri-peri', label: 'Peri peri sprinkle', delta: 15 },
      ],
    },
  ],
  desserts: [
    {
      id: 'extras',
      label: 'Make it extra',
      type: 'checkbox',
      choices: [
        { id: 'ice-cream', label: 'Vanilla ice cream scoop', delta: 40 },
        { id: 'chocolate-sauce', label: 'Chocolate sauce', delta: 20 },
      ],
    },
  ],
  coffee: [
    {
      id: 'serve',
      label: 'How would you like it?',
      type: 'radio',
      required: true,
      choices: [
        { id: 'hot', label: 'Hot', delta: 0 },
        { id: 'iced', label: 'Iced', delta: 20 },
      ],
    },
    {
      id: 'extras',
      label: 'Add extras',
      type: 'checkbox',
      choices: [
        { id: 'extra-shot', label: 'Extra coffee shot', delta: 30 },
        { id: 'whipped-cream', label: 'Whipped cream', delta: 20 },
      ],
    },
  ],
};

/** @type {Array<Object>} */
export const dishes = [
  // ---------------------------------------------------------------- Pizza
  {
    id: 'margherita-pizza',
    name: 'Margherita Pizza',
    category: 'pizza',
    price: 249,
    diet: 'veg',
    tags: ['Classic'],
    description: 'Blistered crust, slow-cooked tomato, molten mozzarella and fresh basil.',
    story:
      'A simple pizza done properly — a blistered, chewy crust under a bright tomato base, generous mozzarella and basil picked at the last minute.',
    ingredients: ['Pizza dough (sample)', 'Tomato sauce (sample)', 'Mozzarella (sample)', 'Fresh basil (sample)'],
    allergens: 'Sample list: gluten, milk.',
    serves: 'Serves 1–2',
    image: 'pizza-margherita',
  },
  {
    id: 'farmhouse-pizza',
    name: 'Farmhouse Pizza',
    category: 'pizza',
    price: 329,
    diet: 'veg',
    tags: ['Loaded'],
    description: 'Peppers, sweetcorn, olives and mushrooms piled over stretchy cheese.',
    story:
      'Everything from the vegetable patch — crunchy peppers, sweetcorn, olives and mushrooms — layered over a generous bed of cheese.',
    ingredients: ['Pizza dough (sample)', 'Capsicum (sample)', 'Sweetcorn (sample)', 'Olives (sample)', 'Mushroom (sample)'],
    allergens: 'Sample list: gluten, milk.',
    serves: 'Serves 1–2',
    image: 'pizza-farmhouse',
  },
  {
    id: 'paneer-tikka-pizza',
    name: 'Paneer Tikka Pizza',
    category: 'pizza',
    price: 349,
    diet: 'veg',
    tags: ['Signature'],
    description: 'Charred paneer, red onion and mint chutney on a smoky cheese base.',
    story:
      'Our Indian spin on a classic: tandoori-spiced paneer, sweet red onion, capsicum and a swirl of mint chutney over melted mozzarella.',
    ingredients: ['Pizza dough (sample)', 'Paneer (sample)', 'Mint chutney (sample)', 'Red onion (sample)', 'Mozzarella (sample)'],
    allergens: 'Sample list: gluten, milk.',
    serves: 'Serves 1–2',
    image: 'pizza-paneer-tikka',
  },

  // -------------------------------------------------------------- Burgers
  {
    id: 'mango-special-loaded-burger',
    name: 'The Mango Special Loaded Burger',
    category: 'burgers',
    price: 249,
    diet: 'non-veg',
    tags: ['Signature', 'Bestseller'],
    description: 'Double patty, melting cheese, crisp salad and our house sauce.',
    story:
      'The one we are proud of: a toasted brioche bun stacked with two juicy patties, cheese melting over the edges, fresh salad and a swipe of our signature sauce.',
    ingredients: ['Brioche bun (sample)', 'Patty (sample)', 'Cheddar (sample)', 'Lettuce, tomato, onion (sample)', 'House sauce (sample)'],
    allergens: 'Sample list: gluten, milk, egg.',
    serves: 'Serves 1',
    image: 'burger-loaded-signature',
  },
  {
    id: 'crispy-chicken-burger',
    name: 'Crispy Chicken Burger',
    category: 'burgers',
    price: 229,
    diet: 'non-veg',
    tags: ['Bestseller'],
    description: 'Crunch-coated chicken, slaw and mayo in a soft potato bun.',
    story:
      'A crackly golden chicken fillet, cool coleslaw and creamy mayo tucked into a soft potato bun — messy in the best way.',
    ingredients: ['Potato bun (sample)', 'Crispy chicken fillet (sample)', 'Coleslaw (sample)', 'Mayonnaise (sample)'],
    allergens: 'Sample list: gluten, egg.',
    serves: 'Serves 1',
    image: 'burger-chicken',
  },
  {
    id: 'veg-tikki-burger',
    name: 'Veg Tikki Burger',
    category: 'burgers',
    price: 169,
    diet: 'veg',
    tags: ['Classic'],
    description: 'Golden masala tikki, mint chutney, onion and tomato.',
    story:
      'A spiced potato tikki fried to a golden crunch, layered with mint chutney, onion, tomato and crisp lettuce.',
    ingredients: ['Sesame bun (sample)', 'Potato tikki (sample)', 'Mint chutney (sample)', 'Onion, tomato, lettuce (sample)'],
    allergens: 'Sample list: gluten.',
    serves: 'Serves 1',
    image: 'burger-veg-tikki',
  },

  // ------------------------------------------------------- Pasta & Noodles
  {
    id: 'creamy-alfredo-pasta',
    name: 'Creamy Alfredo Pasta',
    category: 'pasta-noodles',
    price: 269,
    diet: 'veg',
    tags: ['Bestseller'],
    description: 'Penne in a silky parmesan cream with mushrooms and pepper.',
    story:
      'Penne tossed in a slow-built parmesan cream, finished with sautéed mushrooms, cracked pepper and a little parsley.',
    ingredients: ['Penne (sample)', 'Cream (sample)', 'Parmesan (sample)', 'Mushroom (sample)'],
    allergens: 'Sample list: gluten, milk.',
    serves: 'Serves 1',
    image: 'pasta-alfredo',
  },
  {
    id: 'veg-hakka-noodles',
    name: 'Veg Hakka Noodles',
    category: 'pasta-noodles',
    price: 199,
    diet: 'veg',
    tags: ['Wok-tossed'],
    description: 'Wok-tossed noodles with crunchy vegetables and toasted sesame.',
    story:
      'Noodles thrown into a hot wok with julienned vegetables, a splash of soy and sesame — smoky, savoury and satisfying.',
    ingredients: ['Noodles (sample)', 'Cabbage, carrot, capsicum (sample)', 'Soy sauce (sample)', 'Sesame (sample)'],
    allergens: 'Sample list: gluten, soy, sesame.',
    serves: 'Serves 1',
    image: 'noodles-hakka',
  },

  // ---------------------------------------------------------------- Momos
  {
    id: 'steamed-veg-momos',
    name: 'Steamed Veg Momos',
    category: 'momos',
    price: 149,
    diet: 'veg',
    tags: ['Bestseller'],
    description: 'Delicate parcels of vegetables, straight from the steamer.',
    story:
      'Hand-pleated dumplings packed with finely chopped vegetables, steamed until the wrappers turn glossy and served with a fiery house chutney.',
    ingredients: ['Wheat wrapper (sample)', 'Mixed vegetables (sample)', 'Ginger, garlic (sample)', 'Red chutney (sample)'],
    allergens: 'Sample list: gluten.',
    serves: '6 pieces',
    image: 'momos-steamed',
  },

  // ----------------------------------------------------------- Sandwiches
  {
    id: 'grilled-club-sandwich',
    name: 'Grilled Club Sandwich',
    category: 'sandwiches',
    price: 199,
    diet: 'non-veg',
    tags: ['Classic'],
    description: 'Triple-decker toast with a generous, colourful filling.',
    story:
      'Three layers of toasted bread packed with a hearty filling, crisp lettuce and tomato, cut into triangles and pinned together.',
    ingredients: ['Bread (sample)', 'Chicken or cheese filling (sample)', 'Lettuce, tomato (sample)', 'Mayonnaise (sample)'],
    allergens: 'Sample list: gluten, egg.',
    serves: 'Serves 1',
    image: 'sandwich-club',
  },

  // --------------------------------------------------------------- Snacks
  {
    id: 'classic-salted-fries',
    name: 'Classic Salted Fries',
    category: 'snacks',
    price: 129,
    diet: 'veg',
    tags: ['Classic'],
    description: 'Golden fries, flaky salt, and something to dip them in.',
    story:
      'Thick-cut potatoes fried until crisp, showered with flaky salt and served hot with a house dip.',
    ingredients: ['Potatoes (sample)', 'Salt (sample)', 'Dipping sauce (sample)'],
    allergens: 'Sample list: may contain egg in dip.',
    serves: 'Serves 1–2',
    image: 'fries-salted',
  },

  // -------------------------------------------------------------- Desserts
  {
    id: 'chocolate-truffle-cake',
    name: 'Chocolate Truffle Cake',
    category: 'desserts',
    price: 189,
    diet: 'veg',
    tags: ['Bestseller'],
    description: 'A dense chocolate slice under a glossy truffle ganache.',
    story:
      'Rich chocolate sponge layered with silky ganache and finished with a thin, glossy coat of truffle icing.',
    ingredients: ['Chocolate sponge (sample)', 'Ganache (sample)', 'Cocoa (sample)'],
    allergens: 'Sample list: gluten, milk, egg.',
    serves: 'One slice',
    image: 'cake-chocolate-truffle',
  },

  // ------------------------------------------------------- Coffee & Shakes
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    category: 'coffee',
    price: 139,
    diet: 'veg',
    tags: ['Brewed'],
    description: 'A double shot under a soft, thick cap of steamed milk.',
    story:
      'Freshly pulled espresso, steamed milk and a thick cap of foam — the cup we make most often, and the one we get judged on.',
    ingredients: ['Espresso (sample)', 'Steamed milk (sample)', 'Cocoa dust (sample)'],
    allergens: 'Sample list: milk.',
    serves: 'One cup',
    image: 'coffee-cappuccino',
  },
  {
    id: 'classic-cold-coffee',
    name: 'Classic Cold Coffee',
    category: 'coffee',
    price: 169,
    diet: 'veg',
    tags: ['Bestseller'],
    description: 'Thick, frothy cold coffee with a chocolate swirl.',
    story:
      'Chilled coffee blended thick and frothy, sweetened just enough and finished with a swirl of chocolate.',
    ingredients: ['Coffee (sample)', 'Milk (sample)', 'Sugar (sample)', 'Chocolate syrup (sample)'],
    allergens: 'Sample list: milk.',
    serves: 'One glass',
    image: 'coffee-cold',
  },
  {
    id: 'oreo-milkshake',
    name: 'Oreo Milkshake',
    category: 'coffee',
    price: 189,
    diet: 'veg',
    tags: ['Thick'],
    description: 'Cookie-crumb shake topped with whipped cream.',
    story:
      'Blended cookie crumb and cold milk, poured thick and topped with whipped cream and a final scatter of crumbs.',
    ingredients: ['Milk (sample)', 'Cookie crumb (sample)', 'Vanilla ice cream (sample)', 'Whipped cream (sample)'],
    allergens: 'Sample list: milk, gluten.',
    serves: 'One glass',
    image: 'shake-oreo',
  },
].map((dish) => ({
  ...dish,
  /** `slug` is the canonical URL identifier for /menu/[slug]. */
  slug: dish.id,
  options: options[dish.category] ?? [],
}));

/** Canonical lookup for a /menu/[slug] URL. */
export const dishBySlug = (slug) => dishes.find((dish) => dish.slug === slug);
/** Legacy lookup kept for old ?id= bookmarks. */
export const dishById = (id) => dishBySlug(id);
export const dishesByCategory = (categoryId) => dishes.filter((dish) => dish.category === categoryId);
export const categoryById = (categoryId) => categories.find((category) => category.id === categoryId);
export const dietLabel = (diet) => (diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian');

/** One string used by the menu search, so results are consistent everywhere. */
export const searchText = (dish) =>
  [dish.name, dish.description, dish.story, categoryById(dish.category)?.name, ...(dish.tags ?? []), ...(dish.ingredients ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

/** Curated homepage lists. */
export const featuredIds = [
  'mango-special-loaded-burger',
  'margherita-pizza',
  'steamed-veg-momos',
  'classic-cold-coffee',
];

export const signatureSlides = [
  {
    dishId: 'mango-special-loaded-burger',
    labels: [
      { title: 'Soft brioche bun', position: 'tl' },
      { title: 'Melting cheese', position: 'tr' },
      { title: 'Double patty', position: 'bl' },
      { title: 'Fresh greens', position: 'br' },
    ],
  },
  {
    dishId: 'paneer-tikka-pizza',
    labels: [
      { title: 'Blistered crust', position: 'tl' },
      { title: 'Charred paneer', position: 'tr' },
      { title: 'Mint chutney', position: 'bl' },
      { title: 'Stretchy mozzarella', position: 'br' },
    ],
  },
  {
    dishId: 'oreo-milkshake',
    labels: [
      { title: 'Cookie crumb', position: 'tl' },
      { title: 'Whipped cream', position: 'tr' },
      { title: 'Cold milk', position: 'bl' },
      { title: 'Extra thick', position: 'br' },
    ],
  },
];
