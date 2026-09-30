// Canonical Category Configuration & Slug Resolution
export const CANONICAL_CATEGORIES = [
  { id: 'all', name: 'All Gifts', slug: 'all', title: 'All Personalized Gifts', desc: 'Discover handcrafted pieces made around your favorite memories.' },
  { id: 'frames', name: 'Photo Frames', slug: 'frames', title: 'Photo Frames', desc: 'Classic wooden, wall & table frames crafted to preserve your treasured photos.' },
  { id: 'magazines', name: 'Magazines', slug: 'magazines', title: 'Personalized Magazines', desc: 'Custom stories, anniversary editions, and milestone magazines designed & printed.' },
  { id: 'memories', name: 'Polaroids', slug: 'memories', title: 'Polaroids & Photo Books', desc: 'Keepsake polaroid prints, retro snapshots, and mini photo albums to hold.' },
  { id: 'apparel', name: 'T-Shirts', slug: 'apparel', title: 'Custom T-Shirts & Apparel', desc: 'Hand-printed cotton tees, collared shirts, and custom apparel made to wear.' },
  { id: 'essentials', name: 'Phone Cases', slug: 'essentials', title: 'Phone Cases & Mugs', desc: 'Protective custom phone cases for all models and ceramic photo mugs.' },
  { id: 'hampers', name: 'Hampers', slug: 'hampers', title: 'Luxury Hampers & Combos', desc: 'Curated celebration gift hampers packed with handcrafted keepsakes.' },
  { id: 'flowers', name: 'Flowers', slug: 'flowers', title: 'Flowers & Bouquets', desc: 'Fresh and everlasting floral arrangements paired with personalized message cards.' },
  { id: 'vintage', name: 'Vintage', slug: 'vintage', title: 'Vintage Collection', desc: 'Nostalgic retro letters, wax seals, and warm vintage wooden frames.' },
  { id: 'addons', name: 'Calendars & Magnets', slug: 'addons', title: 'Calendars & Magnets', desc: 'Custom photo calendars and acrylic fridge magnets for your home.' },
  { id: 'smart-digital', name: 'Smart & Digital', slug: 'smart-digital', title: 'Smart & Digital Services', desc: 'NFC smart cards, Google review boards, and custom digital invitations.' },
];

// Slug alias dictionary to safely map user or URL inputs to canonical category ID
export const SLUG_TO_CATEGORY_ID = {
  'all': 'all',
  'frames': 'frames',
  'photo-frames': 'frames',
  'photo-frame': 'frames',
  'frame': 'frames',
  'magazines': 'magazines',
  'magazine': 'magazines',
  'memories': 'memories',
  'polaroids': 'memories',
  'polaroid': 'memories',
  'photo-books': 'memories',
  'books': 'memories',
  'apparel': 'apparel',
  't-shirts': 'apparel',
  'tshirts': 'apparel',
  'tshirt': 'apparel',
  'custom-t-shirts': 'apparel',
  'custom-tshirts': 'apparel',
  'clothing': 'apparel',
  'caps': 'apparel',
  'essentials': 'essentials',
  'phone-cases': 'essentials',
  'phone-case': 'essentials',
  'phonecases': 'essentials',
  'phonecase': 'essentials',
  'cases': 'essentials',
  'mugs': 'essentials',
  'cups': 'essentials',
  'hampers': 'hampers',
  'hamper': 'hampers',
  'gift-combos': 'hampers',
  'flowers': 'flowers',
  'flower': 'flowers',
  'bouquets': 'flowers',
  'vintage': 'vintage',
  'retro': 'vintage',
  'addons': 'addons',
  'calendars': 'addons',
  'magnets': 'addons',
  'smart-digital': 'smart-digital',
  'digital': 'smart-digital',
  'nfc': 'smart-digital',
};

/**
 * Resolves any slug or alias to the canonical category ID.
 * Returns null if the slug is not recognized (does NOT blindly fallback to frames).
 */
export const resolveCategorySlug = (slug) => {
  if (!slug || slug === '' || slug === 'all') return 'all';
  const clean = String(slug).toLowerCase().trim();
  return SLUG_TO_CATEGORY_ID[clean] || null;
};

/**
 * Gets the category definition object for a canonical ID.
 */
export const getCategoryMeta = (categoryId) => {
  return CANONICAL_CATEGORIES.find(c => c.id === categoryId) || null;
};
