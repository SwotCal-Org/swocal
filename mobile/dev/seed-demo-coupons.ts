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
    headline: 'Marché Bastille coffee break',
    subline: 'Valid at the market coffee stall. Show QR at checkout.',
    discount_percent: 15,
    status: 'active',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: in6h(),
    merchant: {
      id: 'm-seed-bastille',
      name: 'Bastille Market Coffee',
      category: 'Market Cafe',
      image_url: null,
    },
  },
  {
    id: 'swocal-seed-2',
    token: 'SWO-SEED-02',
    headline: 'Rue Cler market basket deal',
    subline: 'Applies on fresh produce and bakery items. One redemption per visit.',
    discount_percent: 50,
    status: 'active',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expires_at: in48h(),
    merchant: {
      id: 'm-seed-rue-cler',
      name: 'Rue Cler Market Stand',
      category: 'Farmers Market',
      image_url: null,
    },
  },
  {
    id: 'swocal-seed-redeemed',
    token: 'SWO-SEED-USED',
    headline: 'Marché d’Aligre tasting plate',
    subline: 'This one has already been redeemed — merci for visiting!',
    discount_percent: 20,
    status: 'redeemed',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    merchant: {
      id: 'm-seed-aligre',
      name: 'Marché d’Aligre Gourmet',
      category: 'Market Food',
      image_url: null,
    },
  },
];

export const SEED_DEMO_IDS = new Set(SEED_DEMO_OFFERS.map((o) => o.id));

export function getSeedDemoOfferById(id: string): SeedDemoOfferRow | null {
  return SEED_DEMO_OFFERS.find((o) => o.id === id) ?? null;
}
