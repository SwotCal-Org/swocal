import type { ContextResponse } from '@/types/api';
import type { CouponUiSpec } from '@/services/coupon-ui';

type OfferLike = {
  headline?: string | null;
  discount_percent?: number | null;
  merchant?: { name?: string; category?: string } | null;
};

export function formatTemp(ctx: ContextResponse): string {
  return `${Math.round(ctx.weather.temp)}°C`;
}

function humanizeCondition(raw: string): string {
  const c = raw.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return 'wet skies';
  if (c.includes('storm')) return 'stormy';
  if (c.includes('cloud') || c.includes('overcast') || c.includes('mist') || c.includes('fog'))
    return 'soft clouds';
  if (c.includes('snow')) return 'snow in the air';
  if (c.includes('clear') || c.includes('sunny') || c === 'sun') return 'clear skies';
  return raw || 'lovely air';
}

/** Single line: city + temperature + human condition. */
export function cityWeatherLine(ctx: ContextResponse): string {
  return `${ctx.location.city} · ${formatTemp(ctx)} · ${humanizeCondition(ctx.weather.condition)}`;
}

/** Under hero city title: human weather mood only (city/temp are in the pills row). */
export function heroWeatherMoodLine(ctx: ContextResponse): string {
  return humanizeCondition(ctx.weather.condition);
}

export function timeOfDayPhrase(ctx: ContextResponse): string {
  switch (ctx.time_of_day) {
    case 'morning':
      return 'this morning';
    case 'lunch':
      return 'this afternoon';
    case 'afternoon':
      return 'this afternoon';
    case 'evening':
    default:
      return 'tonight';
  }
}

export function dayTypeChip(ctx: ContextResponse): string {
  return ctx.day_type === 'weekend' ? 'Weekend' : 'Weekday';
}

/**
 * Main hero subline: ties user, place, and moment without repeating the same generic line.
 */
export function personalHeroMessage(userName: string, offer: OfferLike, ctx: ContextResponse): string {
  const name = userName === 'friend' ? 'You' : userName;
  const who = offer.merchant?.name?.trim() || 'this spot';
  const cat = offer.merchant?.category?.trim() || 'local';
  const city = ctx.location.city;
  const hum = humanizeCondition(ctx.weather.condition);
  return `${name} — ${who} in ${city} is your ${cat.toLowerCase()} match ${timeOfDayPhrase(ctx)}, with ${hum} and ${formatTemp(ctx)}.`;
}

/** Tighter second line: offer-specific. */
export function personalOfferLine(offer: OfferLike, ctx: ContextResponse, ui: Pick<CouponUiSpec, 'headline_override'>): string {
  const pct = offer.discount_percent ?? 0;
  const title = (ui.headline_override || offer.headline || 'This offer').trim();
  return `${pct}% off · ${title} · for ${ctx.location.city} right now.`;
}

/** Merge AI note with city; otherwise use locally generated line. */
export function mergeContextNoteForDisplay(
  ctx: ContextResponse,
  ui: Pick<CouponUiSpec, 'context_note'>,
  localLine: string
): string {
  const ai = (ui.context_note || '').trim();
  if (ai) {
    if (ai.toLowerCase().includes(ctx.location.city.toLowerCase())) return ai;
    return `${ctx.location.city} — ${ai}`;
  }
  return localLine;
}

/** Motivation with city and weather. */
export function personalMotivation(ctx: ContextResponse): string {
  const c = ctx.weather.condition.toLowerCase();
  const city = ctx.location.city;
  if (c.includes('rain') || c.includes('drizzle')) {
    return `A little ${city} rain never stopped a good deal.`;
  }
  if (c.includes('clear') || c.includes('sun')) {
    return `${formatTemp(ctx)} in ${city} — perfect weather to use this.`;
  }
  if (ctx.time_of_day === 'evening') {
    return `Wind down in ${city} with something worth stepping out for.`;
  }
  if (ctx.time_of_day === 'morning') {
    return `Start the day in ${city} on the right note.`;
  }
  return `Local moment in ${city} — you picked this, now use it.`;
}
