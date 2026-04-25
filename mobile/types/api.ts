export type Weather = {
  condition: string;
  temp: number;
  icon: string;
  source: string;
};

export type ContextResponse = {
  weather: Weather;
  time_of_day: 'morning' | 'lunch' | 'afternoon' | 'evening';
  day_type: 'weekday' | 'weekend';
  timestamp: string;
  location: { city: string; lat: number; lng: number };
};

export type Mood = 'warm_comfort' | 'sweet_treat' | 'social' | 'quick_bite';
export type Budget = 'low' | 'mid' | 'high';
export type SwipeDirection = 'left' | 'right';
export type OfferStatus = 'active' | 'redeemed' | 'expired';

export type IntentVector = {
  mood?: Mood;
  budget?: Budget;
};

export type GeneratedOffer = {
  id: string;
  token: string;
  expires_at: string;
  headline: string;
  subline: string;
  discount_percent: number;
  merchant: {
    id: string;
    name: string;
    category: string;
    image_url: string | null;
    distance_m: number;
  };
  source: 'claude' | 'template';
};

export type GenerateOffersResponse = {
  offers: GeneratedOffer[];
};

export type RedeemFailReason =
  | 'unauthenticated'
  | 'missing_token'
  | 'not_found'
  | 'wrong_user'
  | 'expired'
  | 'server_error';

export type RedeemResponse =
  | {
      valid: true;
      already_redeemed: boolean;
      offer: {
        id: string;
        headline: string;
        subline: string;
        discount_percent: number;
        merchant: { id: string; name: string; category: string; address: string | null; image_url: string | null };
      };
    }
  | {
      valid: false;
      reason: RedeemFailReason;
      message?: string;
    };
