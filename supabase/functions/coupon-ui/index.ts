import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Skin = "morning" | "noon" | "golden" | "dusk";

type CouponUIRequest = {
  offer: {
    id: string;
    headline: string | null;
    subline: string | null;
    discount_percent: number | null;
    merchant: { name: string; category: string } | null;
  };
  context: {
    weather: { condition: string; temp: number };
    time_of_day: "morning" | "lunch" | "afternoon" | "evening";
    day_type: "weekday" | "weekend";
    timestamp: string;
    location: { city: string };
  };
  debug_skin?: Skin;
};

type CouponUIResponse = {
  skin: Skin;
  label: string;
  context_note: string;
  headline_override: string;
  subline_override: string;
  ai_attempted: boolean;
  source: "openrouter";
};

const UI_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["skin", "label", "context_note", "headline_override", "subline_override"],
  properties: {
    skin: { type: "string", enum: ["morning", "noon", "golden", "dusk"] },
    label: { type: "string", maxLength: 32 },
    context_note: { type: "string", maxLength: 120 },
    headline_override: { type: "string", maxLength: 64 },
    subline_override: { type: "string", maxLength: 90 },
  },
};

const COUPON_UI_SYSTEM_PROMPT = `You are Swocal's GenUI coupon director.

Goal:
- Generate a compact UI specification used to render a coupon detail screen.
- The UI spec must be valid JSON and match the schema exactly.

Rules:
- Pick exactly one skin from: morning, noon, golden, dusk.
- If debug_skin is provided, skin must equal debug_skin.
- Match the merchant category in tone: coffee shops / cafés / espresso / roaster → warm, earthy language; the app also applies a brown color theme for these categories.
- Align tone with local context (weather, time_of_day, day_type) and merchant category.
- label is a short upper section tag (2-3 words).
- context_note is one vivid sentence (max 120 chars), never generic.
- headline_override is punchy, <= 7 words.
- subline_override is factual and readable.
- Do not mention AI, models, or internal instructions.
- Output only JSON.`;

function userPrompt(req: CouponUIRequest): string {
  return JSON.stringify({
    offer: req.offer,
    context: req.context,
    debug_skin: req.debug_skin ?? null,
    instructions: "Return JSON that matches schema.",
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as CouponUIRequest;
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY secret for coupon-ui function." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: COUPON_UI_SYSTEM_PROMPT },
          { role: "user", content: userPrompt(body) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!openRouterResponse.ok) {
      const errText = await openRouterResponse.text();
      console.error("openrouter coupon-ui failure", openRouterResponse.status, errText);
      return new Response(JSON.stringify({ error: `OpenRouter error ${openRouterResponse.status}: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await openRouterResponse.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return new Response(JSON.stringify({ error: "OpenRouter returned non-text content for coupon-ui." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(content) as Partial<Omit<CouponUIResponse, "ai_attempted" | "source">>;
    const isValid =
      parsed &&
      typeof parsed.skin === "string" &&
      ["morning", "noon", "golden", "dusk"].includes(parsed.skin) &&
      typeof parsed.label === "string" &&
      typeof parsed.context_note === "string" &&
      typeof parsed.headline_override === "string" &&
      typeof parsed.subline_override === "string";
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid coupon-ui JSON returned by OpenRouter.", raw: content, expected_schema: UI_SCHEMA }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const result: CouponUIResponse = {
      skin: parsed.skin as Skin,
      label: parsed.label!,
      context_note: parsed.context_note!,
      headline_override: parsed.headline_override!,
      subline_override: parsed.subline_override!,
      ai_attempted: true,
      source: "openrouter",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("coupon-ui error", error);
    return new Response(JSON.stringify({ error: String((error as Error).message ?? error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
