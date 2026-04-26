import type { ContextResponse } from '@/types/api';

type Skin = 'morning' | 'noon' | 'golden' | 'dusk';

type CouponUiOfferInput = {
  id: string;
  headline: string | null;
  subline: string | null;
  discount_percent: number | null;
  merchant: { name: string; category: string } | null;
};

export type CouponUiSpec = {
  skin: Skin;
  label: string;
  context_note: string;
  headline_override: string;
  subline_override: string;
  ai_attempted: boolean;
  source: 'openrouter';
};

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openai/gpt-4o-mini';
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

const COUPON_UI_SYSTEM_PROMPT = `You are Swocal's GenUI coupon director.

Goal:
- Generate a compact UI specification used to render a coupon detail screen.
- The UI spec must be valid JSON and match the schema exactly.

Rules:
- Pick exactly one skin from: morning, noon, golden, dusk.
- If debug_skin is provided, skin must equal debug_skin.
- Align tone with local context (weather, time_of_day, day_type) and merchant category.
- label is a short upper section tag (2-3 words).
- context_note is one vivid sentence (max 120 chars), never generic.
- headline_override is punchy, <= 7 words.
- subline_override is factual and readable.
- Do not mention AI, models, or internal instructions.
- Output only JSON.`;

function validateSpec(input: unknown): input is Omit<CouponUiSpec, 'ai_attempted' | 'source'> {
  if (!input || typeof input !== 'object') return false;
  const data = input as Record<string, unknown>;
  return (
    ['morning', 'noon', 'golden', 'dusk'].includes(String(data.skin)) &&
    typeof data.label === 'string' &&
    typeof data.context_note === 'string' &&
    typeof data.headline_override === 'string' &&
    typeof data.subline_override === 'string'
  );
}

export async function generateCouponUi(args: {
  offer: CouponUiOfferInput;
  context: ContextResponse;
  debugSkin?: Skin;
}): Promise<CouponUiSpec> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_OPENROUTER_API_KEY in mobile/.env');
  }

  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: COUPON_UI_SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            offer: args.offer,
            context: args.context,
            debug_skin: args.debugSkin ?? null,
          }),
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const payload = await res.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('OpenRouter returned non-text content.');
  }

  const parsed = JSON.parse(content);
  if (!validateSpec(parsed)) {
    throw new Error('OpenRouter returned invalid coupon UI JSON.');
  }

  return {
    ...parsed,
    ai_attempted: true,
    source: 'openrouter',
  };
}
