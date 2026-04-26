'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Textarea } from '@/components/ui/Textarea';
import { updateCouponRules } from '@/actions/merchant';
import type { CouponAiRules, TimeOfDay, WeatherCondition } from '@/types/db';

const WEATHER: { value: WeatherCondition; label: string }[] = [
  { value: 'clear', label: 'Clear ☀' },
  { value: 'clouds', label: 'Clouds ☁' },
  { value: 'rain', label: 'Rain ☂' },
  { value: 'snow', label: 'Snow ❄' },
  { value: 'thunderstorm', label: 'Storm ⚡' },
  { value: 'mist', label: 'Mist' },
  { value: 'drizzle', label: 'Drizzle' },
];

const TIMES: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

const PROMPT_PLACEHOLDER =
  'e.g. Give out coffee coupons when it\'s cold and raining, especially on quiet weekday mornings. ' +
  'Don\'t push deals during weekend brunch — we\'re packed.';

export function CouponRulesForm({ initial }: { initial: CouponAiRules }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initial.prompt ?? '');
  const [monthlyCap, setMonthlyCap] = useState<number>(initial.monthly_cap ?? 100);
  const [weatherRequired, setWeatherRequired] = useState<WeatherCondition[]>(
    initial.weather_required ?? []
  );
  const [weatherBlocklist, setWeatherBlocklist] = useState<WeatherCondition[]>(
    initial.weather_blocklist ?? []
  );
  const [tempMin, setTempMin] = useState<string>(
    initial.temp_min_c != null ? String(initial.temp_min_c) : ''
  );
  const [tempMax, setTempMax] = useState<string>(
    initial.temp_max_c != null ? String(initial.temp_max_c) : ''
  );
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay[]>(initial.time_of_day ?? []);
  const [onlyWhenQuiet, setOnlyWhenQuiet] = useState<boolean>(initial.only_when_quiet ?? false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle<T>(value: T, list: T[], setList: (next: T[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const tMin = tempMin === '' ? undefined : parseInt(tempMin, 10);
      const tMax = tempMax === '' ? undefined : parseInt(tempMax, 10);
      if (tMin != null && tMax != null && tMin > tMax) {
        throw new Error('Min temperature must be less than or equal to max.');
      }
      await updateCouponRules({
        prompt: prompt.trim() || undefined,
        monthly_cap: monthlyCap,
        weather_required: weatherRequired.length ? weatherRequired : undefined,
        weather_blocklist: weatherBlocklist.length ? weatherBlocklist : undefined,
        temp_min_c: Number.isFinite(tMin as number) ? (tMin as number) : undefined,
        temp_max_c: Number.isFinite(tMax as number) ? (tMax as number) : undefined,
        time_of_day: timeOfDay.length ? timeOfDay : undefined,
        only_when_quiet: onlyWhenQuiet || undefined,
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card padding="lg">
        <h3 className="font-display text-2xl">When should the AI give out coupons?</h3>
        <p className="mt-1 text-sm text-ink-2">
          Describe the conditions in your own words. The AI will use this to decide who gets a
          coupon, when, and for what.
        </p>
        <div className="mt-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={PROMPT_PLACEHOLDER}
            rows={6}
            maxLength={2000}
          />
          <p className="mt-1 text-xs text-ink-3">{prompt.length}/2000</p>
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">Monthly cap</h3>
        <p className="mt-1 text-sm text-ink-2">
          Hard limit on how many coupons the AI can issue for your shop in one month.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={1000}
            step={10}
            value={monthlyCap}
            onChange={(e) => setMonthlyCap(parseInt(e.target.value, 10))}
            className="flex-1 accent-[#E36A4D]"
          />
          <div className="w-24 shrink-0 rounded-r3 border-2 border-ink bg-mustard-soft px-3 py-1.5 text-center font-display text-xl">
            {monthlyCap}
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">Weather conditions</h3>
        <p className="mt-1 text-sm text-ink-2">
          Pick the weather that should trigger coupons, and any weather where the AI should hold
          back.
        </p>
        <div className="mt-4">
          <p className="swo-label">Only give out coupons when it's…</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {WEATHER.map((w) => (
              <Chip
                key={w.value}
                tone="sky"
                active={weatherRequired.includes(w.value)}
                onClick={() => toggle(w.value, weatherRequired, setWeatherRequired)}
              >
                {w.label}
              </Chip>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <p className="swo-label">Never give out coupons when it's…</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {WEATHER.map((w) => (
              <Chip
                key={w.value}
                tone="coral"
                active={weatherBlocklist.includes(w.value)}
                onClick={() => toggle(w.value, weatherBlocklist, setWeatherBlocklist)}
              >
                {w.label}
              </Chip>
            ))}
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">Temperature range (°C)</h3>
        <p className="mt-1 text-sm text-ink-2">
          Issue coupons only when the outdoor temperature is within this range. Leave blank for any.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            placeholder="min"
            value={tempMin}
            onChange={(e) => setTempMin(e.target.value)}
            className="swo-input w-24 px-3 py-2"
          />
          <span className="text-ink-3">to</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="max"
            value={tempMax}
            onChange={(e) => setTempMax(e.target.value)}
            className="swo-input w-24 px-3 py-2"
          />
          <span className="text-sm text-ink-3">°C</span>
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">Time of day</h3>
        <p className="mt-1 text-sm text-ink-2">
          Restrict coupons to specific parts of the day. Leave none selected for any time.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TIMES.map((t) => (
            <Chip
              key={t.value}
              tone="mustard"
              active={timeOfDay.includes(t.value)}
              onClick={() => toggle(t.value, timeOfDay, setTimeOfDay)}
            >
              {t.label}
            </Chip>
          ))}
        </div>
        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-ink-2">
          <input
            type="checkbox"
            checked={onlyWhenQuiet}
            onChange={(e) => setOnlyWhenQuiet(e.target.checked)}
            className="h-4 w-4 accent-[#E36A4D]"
          />
          Only when my shop is empty (uses your transaction-volume signal)
        </label>
      </Card>

      {error && (
        <div className="rounded-r3 border-2 border-danger bg-coral-soft px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm font-semibold text-mint-deep">Saved ✓</span>}
        <Button type="submit" loading={saving} size="lg">
          Save coupon rules
        </Button>
      </div>
    </form>
  );
}
