import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  primaryTypeDisplayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  distanceMeters?: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) return json({ error: "missing_google_maps_api_key" }, 500);

  try {
    const body = await req.json().catch(() => ({}));
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const radius = Math.min(Math.max(Number(body.radius ?? 2500), 100), 50000);
    const limit = Math.min(Math.max(Number(body.limit ?? 20), 1), 20);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return json({ error: "invalid_lat_lng" }, 400);
    }

    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.location,places.types",
      },
      body: JSON.stringify({
        maxResultCount: limit,
        rankPreference: "DISTANCE",
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius,
          },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return json({ error: "google_places_error", status: res.status, detail: text.slice(0, 500) }, 502);
    }

    const data = await res.json();
    const results = (data.places ?? []) as GooglePlace[];

    const stores = results
      .map((p) => ({
        id: p.id,
        name: p.displayName?.text,
        category:
          p.primaryTypeDisplayName?.text ??
          (p.types?.[0] ? p.types[0].replaceAll("_", " ") : "Local business"),
        distance_m: Number.isFinite(p.distanceMeters) ? Number(p.distanceMeters) : null,
        lat: p.location?.latitude ?? null,
        lng: p.location?.longitude ?? null,
        address: p.formattedAddress || "Nearby",
      }))
      .filter((s) => !!s.id && !!s.name);

    return json({ stores });
  } catch (err) {
    return json({ error: "server_error", message: String((err as Error).message ?? err) }, 500);
  }
});
