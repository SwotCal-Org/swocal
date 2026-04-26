import Ionicons from '@expo/vector-icons/Ionicons';
import type { ContextResponse } from '@/types/api';

export function weatherIcon(ctx: ContextResponse): keyof typeof Ionicons.glyphMap {
  const c = ctx.weather.condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle') || c.includes('storm')) return 'rainy-outline';
  if (c.includes('cloud') || c.includes('mist') || c.includes('fog')) return 'cloud-outline';
  if (ctx.time_of_day === 'evening') return 'moon-outline';
  return 'sunny-outline';
}
