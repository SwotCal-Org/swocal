// Hand-written DB types. We don't run codegen here — schema changes are
// rare and explicit, and this keeps the new app self-contained.

export type MerchantStatus = 'pending' | 'active' | 'suspended';
export type TransactionVolume = 'low' | 'normal' | 'high';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type DayHours = { open: string; close: string } | null;
export type Hours = Partial<Record<DayKey, DayHours>>;

export type MerchantRules = {
  max_discount?: number;
  quiet_hours?: string[];
};

// Conditions the owner sets in the Coupons tab. The AI reads these and decides
// when / to whom to issue a coupon — the owner never authors coupons directly.
export type CouponAiRules = {
  prompt?: string;
  monthly_cap?: number;
  weather_required?: WeatherCondition[];
  weather_blocklist?: WeatherCondition[];
  temp_min_c?: number;
  temp_max_c?: number;
  time_of_day?: TimeOfDay[];
  only_when_quiet?: boolean;
};

export type Merchant = {
  id: string;
  owner_id: string | null;
  name: string;
  category: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: Hours;
  transaction_volume: TransactionVolume;
  rules: MerchantRules;
  coupon_ai_rules: CouponAiRules;
  about: string | null;
  products: string[];
  gallery: string[];
  status: MerchantStatus;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DiscountType = 'percent' | 'fixed' | 'bogo';
export type CouponStatus = 'draft' | 'active' | 'paused' | 'archived';

export type WeatherCondition = 'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm' | 'mist' | 'drizzle';
export type TimeOfDay = 'morning' | 'lunch' | 'afternoon' | 'evening';

export type CouponConditions = {
  // Spend & redemption
  min_purchase_cents?: number;
  max_uses_per_user?: number;
  total_redemption_cap?: number;

  // Time-based
  valid_days?: number[]; // 0=Sun..6=Sat
  valid_hours?: { start: string; end: string };

  // Eligibility
  requires_first_visit?: boolean;

  // Context-aware (honored by the AI offer generator; stored so customers see them)
  weather_blocklist?: WeatherCondition[];
  weather_required?: WeatherCondition[];
  temp_min_c?: number;
  temp_max_c?: number;
  time_of_day_blocklist?: TimeOfDay[];

  notes?: string;
};

export type CouponTemplate = {
  id: string;
  merchant_id: string;
  title: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  banner_image_url: string | null;
  conditions: CouponConditions;
  status: CouponStatus;
  active_from: string | null;
  active_until: string | null;
  created_at: string;
  updated_at: string;
};

export type CouponTemplateRedemption = {
  id: string;
  coupon_template_id: string;
  user_id: string | null;
  redeemed_at: string;
  amount_cents: number | null;
};
