import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: auth } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ valid: false, reason: "unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const token = (body.token as string | undefined)?.trim();
    if (!token) {
      return new Response(JSON.stringify({ valid: false, reason: "missing_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: offer, error: offerErr } = await supabase
      .from("generated_offers")
      .select(
        "id, user_id, status, expires_at, headline, subline, discount_percent, merchant:merchants ( id, name, category, address, image_url )"
      )
      .eq("token", token)
      .maybeSingle();

    if (offerErr) throw offerErr;
    if (!offer) {
      return new Response(JSON.stringify({ valid: false, reason: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (offer.user_id !== userId) {
      return new Response(JSON.stringify({ valid: false, reason: "wrong_user" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(offer.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ valid: false, reason: "expired" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (offer.status === "redeemed") {
      return new Response(JSON.stringify({ valid: true, already_redeemed: true, offer }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (offer.status !== "active") {
      return new Response(JSON.stringify({ valid: false, reason: offer.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updErr } = await supabase
      .from("generated_offers")
      .update({ status: "redeemed" })
      .eq("id", offer.id);
    if (updErr) throw updErr;

    const { error: redErr } = await supabase
      .from("redemptions")
      .insert({ offer_id: offer.id, user_id: userId });
    if (redErr) throw redErr;

    return new Response(JSON.stringify({ valid: true, already_redeemed: false, offer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("redeem error:", err);
    return new Response(JSON.stringify({ valid: false, reason: "server_error", message: String((err as Error).message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
