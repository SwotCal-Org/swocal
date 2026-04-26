import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import Anthropic from "npm:@anthropic-ai/sdk@0.32.1";
import { jsonResponse, preflight } from "../_shared/cors.ts";

const STUTTGART = { lat: 48.7784, lng: 9.1800 };

type IntentVector = { mood?: string; budget?: string };
type ContextSignals = { weather: { condition: string; temp: number; icon: string }; time_of_day: string; day_type: string };
type Merchant = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  transaction_volume: string;
  rules: { max_discount?: number; quiet_hours?: string[] } | null;
};

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function scoreMerchant(m: Merchant, ctx: ContextSignals, intent: IntentVector): number {
  let score = 0;
  const cold = ctx.weather.temp < 15;
  const hot = ctx.weather.temp > 25;
  const cat = m.category.toLowerCase();

  if (cold && (cat === "cafe" || cat === "bakery" || cat === "restaurant")) score += 0.3;
  else if (hot && (cat === "dessert" || cat === "bar")) score += 0.3;
  else score += 0.15;

  const mood = (intent.mood ?? "").toLowerCase();
  if (mood.includes("warm") && (cat === "cafe" || cat === "restaurant" || cat === "bakery")) score += 0.4;
  else if (mood.includes("sweet") && cat === "dessert") score += 0.4;
  else if (mood.includes("social") && cat === "bar") score += 0.4;
  else score += 0.2;

  if (m.transaction_volume === "low") score += 0.2;
  else if (m.transaction_volume === "normal") score += 0.1;

  score += Math.random() * 0.1;
  return score;
}

const OFFER_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string", description: "Emotionally resonant, ≤8 words. No emoji unless it adds something." },
    subline: { type: "string", description: "Factual: '<X>% off · <Y>m away · Next 2 hours' format." },
    discount_percent: { type: "integer", description: "Integer 5..30 inclusive, never above merchant's max_discount." },
  },
  required: ["headline", "subline", "discount_percent"],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `You write hyper-local, emotionally resonant retail offers for Swocal — a "Tinder for local commerce" where users swipe on merchant cards.

Style rules:
- Headline: ≤8 words, sensory and specific to the moment (weather, time, category). No corporate hype, no "Limited time only!".
- Subline: factual one-liner formatted "<X>% off · <Y>m away · Next 2 hours". The X must equal discount_percent. The Y is given as distance_m.
- Discount: integer between 5 and the merchant's max_discount cap. Pick a value that's generous enough to attract a swipe-right but matches transaction_volume (low → higher discount).
- Never invent product names the merchant didn't mention. Use the category as the product anchor.
- Output strictly conforms to the JSON schema. No prose, no preamble.`;

function userPromptFor(m: Merchant, ctx: ContextSignals, intent: IntentVector, distanceM: number): string {
  const maxDiscount = m.rules?.max_discount ?? 20;
  return [
    `Merchant: ${m.name}`,
    `Category: ${m.category}`,
    `Distance: ${distanceM}m`,
    `Transaction volume: ${m.transaction_volume}`,
    `Max discount: ${maxDiscount}%`,
    `Quiet hours: ${(m.rules?.quiet_hours ?? []).join(", ") || "none"}`,
    "",
    `Context: ${ctx.weather.condition}, ${ctx.weather.temp}°C, ${ctx.time_of_day} on a ${ctx.day_type}`,
    `User intent: mood=${intent.mood ?? "unknown"} budget=${intent.budget ?? "mid"}`,
  ].join("\n");
}

function templateOffer(m: Merchant, ctx: ContextSignals, distanceM: number): { headline: string; subline: string; discount_percent: number } {
  const maxDiscount = m.rules?.max_discount ?? 15;
  const discount = Math.min(15, maxDiscount);
  const cat = m.category.toLowerCase();
  const cold = ctx.weather.temp < 15;
  const headline =
    cold && cat === "cafe" ? "Cold outside? Coffee's on." :
    cold && cat === "bakery" ? "Fresh from the oven, just for you." :
    cat === "dessert" ? "A small sweet thing, nearby." :
    cat === "bar" ? "Slow evening? Take the table." :
    cat === "restaurant" ? "Lunch table waiting." :
    "Something local, made for now.";
  return {
    headline,
    subline: `${discount}% off · ${distanceM}m away · Next 2 hours`,
    discount_percent: discount,
  };
}

async function generateWithClaude(
  client: Anthropic,
  m: Merchant,
  ctx: ContextSignals,
  intent: IntentVector,
  distanceM: number,
): Promise<{ headline: string; subline: string; discount_percent: number }> {
  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPromptFor(m, ctx, intent, distanceM) }],
    output_config: { format: { type: "json_schema", schema: OFFER_SCHEMA } },
  } as never);

  const text = response.content.find((b: { type: string }) => b.type === "text") as { type: "text"; text: string } | undefined;
  if (!text) throw new Error("no text block in response");
  const parsed = JSON.parse(text.text);
  const cap = m.rules?.max_discount ?? 30;
  parsed.discount_percent = Math.min(parseInt(parsed.discount_percent, 10), cap);
  return parsed;
}

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: auth } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return jsonResponse({ error: "unauthenticated" }, 401);
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const intent: IntentVector = body.intent_vector ?? {};
    const ctx: ContextSignals = body.context ?? {
      weather: { condition: "overcast", temp: 11, icon: "☁️" },
      time_of_day: "lunch",
      day_type: "weekday",
    };

    const { data: merchants, error: mErr } = await supabase
      .from("merchants")
      .select("id,name,category,address,lat,lng,image_url,transaction_volume,rules")
      .returns<Merchant[]>();
    if (mErr) throw mErr;
    if (!merchants || merchants.length === 0) {
      return jsonResponse({ offers: [] });
    }

    const ranked = merchants
      .map((m) => ({ m, score: scoreMerchant(m, ctx, intent) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    const claude = apiKey ? new Anthropic({ apiKey }) : null;

    const generations = await Promise.all(
      ranked.map(async ({ m }) => {
        const distanceM =
          m.lat != null && m.lng != null ? haversineMeters(STUTTGART.lat, STUTTGART.lng, m.lat, m.lng) : 200;
        const generated = claude
          ? await generateWithClaude(claude, m, ctx, intent, distanceM).catch((err) => {
              console.error("claude call failed:", err);
              return templateOffer(m, ctx, distanceM);
            })
          : templateOffer(m, ctx, distanceM);
        return { m, distanceM, generated };
      }),
    );

    const { data: rows, error: insErr } = await supabase
      .from("generated_offers")
      .insert(
        generations.map(({ m, generated }) => ({
          merchant_id: m.id,
          user_id: userId,
          headline: generated.headline,
          subline: generated.subline,
          discount_percent: generated.discount_percent,
          context_signals: ctx,
        })),
      )
      .select("id, token, expires_at");
    if (insErr) throw insErr;
    if (!rows || rows.length !== generations.length) {
      throw new Error("insert returned wrong row count");
    }

    const offers = generations.map(({ m, distanceM, generated }, i) => ({
      id: rows[i].id,
      token: rows[i].token,
      expires_at: rows[i].expires_at,
      headline: generated.headline,
      subline: generated.subline,
      discount_percent: generated.discount_percent,
      merchant: {
        id: m.id,
        name: m.name,
        category: m.category,
        image_url: m.image_url,
        distance_m: distanceM,
      },
      source: claude ? "claude" : "template",
    }));

    return jsonResponse({ offers });
  } catch (err) {
    console.error("generate-offers error:", err);
    return jsonResponse({ error: String((err as Error).message ?? err) }, 500);
  }
});
