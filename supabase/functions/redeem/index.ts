import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { jsonResponse as json, preflight } from "../_shared/cors.ts";

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
      return json({ valid: false, reason: "unauthenticated" }, 401);
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const token = (body.token as string | undefined)?.trim();
    if (!token) {
      return json({ valid: false, reason: "missing_token" }, 400);
    }

    const { data: offer, error: offerErr } = await supabase
      .from("generated_offers")
      .select(
        "id, user_id, status, expires_at, headline, subline, discount_percent, merchant:merchants ( id, name, category, address, image_url )"
      )
      .eq("token", token)
      .maybeSingle();

    if (offerErr) throw offerErr;
    if (!offer) return json({ valid: false, reason: "not_found" }, 404);
    if (offer.user_id !== userId) return json({ valid: false, reason: "wrong_user" }, 403);
    if (new Date(offer.expires_at).getTime() < Date.now()) {
      return json({ valid: false, reason: "expired" });
    }
    if (offer.status === "redeemed") {
      return json({ valid: true, already_redeemed: true, offer });
    }
    if (offer.status !== "active") {
      return json({ valid: false, reason: offer.status });
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

    return json({ valid: true, already_redeemed: false, offer });
  } catch (err) {
    console.error("redeem error:", err);
    return json(
      { valid: false, reason: "server_error", message: String((err as Error).message ?? err) },
      500,
    );
  }
});
