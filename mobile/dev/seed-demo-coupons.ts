/**
 * Static preview coupons for users who have completed Swipe onboarding:
 * two active + one already redeemed. Stable ids — not from the database.
 */

const in48h = () => new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
const in6h = () => new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

/** Matches `listMyOffers` / `getOffer` selected fields. */
export type SeedDemoOfferRow = {
  id: string;
  token: string;
  headline: string;
  subline: string;
  discount_percent: number;
  status: 'active' | 'redeemed' | 'expired';
  expires_at: string;
  created_at: string;
  merchant: { id: string; name: string; category: string; image_url: null };
};

export const SEED_DEMO_OFFERS: SeedDemoOfferRow[] = [
  {
    id: 'swocal-seed-1',
    token: 'SWO-SEED-01',
    headline: 'Oat flat white, first one on us',
    subline: 'Valid at the counter. Show QR when you order.',
    discount_percent: 15,
    status: 'active',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: in6h(),
    merchant: {
      id: 'm-seed-cafe',
      name: 'Café Rösterei',
      category: 'Cafe',
      image_url: null,
    },
  },
  {
    id: 'swocal-seed-2',
    token: 'SWO-SEED-02',
    headline: 'Two croissants, butter still warm',
    subline: 'Bakery counter only. One redemption per visit.',
    discount_percent: 50,
    status: 'active',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expires_at: in48h(),
    merchant: {
      id: 'm-seed-bakery',
      name: 'Bäckerei Sonnengold',
      category: 'Bakery',
      image_url: null,
    },
  },
  {
    id: 'swocal-seed-redeemed',
    token: 'SWO-SEED-USED',
    headline: 'Pastry + espresso combo',
    subline: 'This one’s been redeemed—thanks for visiting!',
    discount_percent: 20,
    status: 'redeemed',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    merchant: {
      id: 'm-seed-used',
      name: 'Konditorei am Markt',
      category: 'Dessert',
      image_url: null,
    },
  },
];

export const SEED_DEMO_IDS = new Set(SEED_DEMO_OFFERS.map((o) => o.id));

export function getSeedDemoOfferById(id: string): SeedDemoOfferRow | null {
  return SEED_DEMO_OFFERS.find((o) => o.id === id) ?? null;
}
