import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { jsonResponse, preflight } from "../_shared/cors.ts";

const STUTTGART = { lat: 48.7784, lng: 9.1800 };

function timeOfDay(hour: number): "morning" | "lunch" | "afternoon" | "evening" {
  if (hour < 11) return "morning";
  if (hour < 14) return "lunch";
  if (hour < 18) return "afternoon";
  return "evening";
}

function iconFor(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("clear") || c.includes("sun")) return "☀️";
  if (c.includes("cloud")) return "☁️";
  if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("thunder")) return "⛈️";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "🌫️";
  return "🌤️";
}

async function fetchWeather(): Promise<{ condition: string; temp: number; icon: string; source: string }> {
  const key = Deno.env.get("OPENWEATHER_API_KEY");
  if (!key) {
    return { condition: "overcast", temp: 11, icon: "☁️", source: "mock" };
  }
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${STUTTGART.lat}&lon=${STUTTGART.lng}&units=metric&appid=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenWeather ${res.status}`);
    const data = await res.json();
    const condition: string = data.weather?.[0]?.main ?? "overcast";
    const temp = Math.round(data.main?.temp ?? 11);
    return { condition, temp, icon: iconFor(condition), source: "openweather" };
  } catch (err) {
    console.error("weather fetch failed:", err);
    return { condition: "overcast", temp: 11, icon: "☁️", source: "mock-fallback" };
  }
}

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  const now = new Date();
  const day = now.getDay();
  const weather = await fetchWeather();
  return jsonResponse({
    weather,
    time_of_day: timeOfDay(now.getHours()),
    day_type: day === 0 || day === 6 ? "weekend" : "weekday",
    timestamp: now.toISOString(),
    location: { city: "Stuttgart", lat: STUTTGART.lat, lng: STUTTGART.lng },
  });
});
