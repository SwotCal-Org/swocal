// Shared CORS + response helpers for every edge function.
// Edge functions are public HTTP endpoints; the browser/native client always
// preflights, and we return the same JSON envelope shape.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Returns a 200 OK for OPTIONS preflights. Call as the first thing in the
// handler: `const pf = preflight(req); if (pf) return pf;`
export function preflight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

// Standard JSON envelope. status defaults to 200.
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
