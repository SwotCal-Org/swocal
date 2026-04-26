'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Stepper } from '@/components/ui/Stepper';
import { Chip } from '@/components/ui/Chip';
import { CATEGORIES, DAYS } from '@/lib/design-tokens';
import { completeOnboarding, type OnboardingInput } from '@/actions/merchant';
import type { Hours, DayKey } from '@/types/db';

const STEPS = ['Identity', 'Location', 'Hours & contact', 'Policies'] as const;

const DEFAULT_HOURS: Hours = {
  mon: { open: '09:00', close: '18:00' },
  tue: { open: '09:00', close: '18:00' },
  wed: { open: '09:00', close: '18:00' },
  thu: { open: '09:00', close: '18:00' },
  fri: { open: '09:00', close: '18:00' },
  sat: { open: '10:00', close: '16:00' },
  sun: null,
};

export function OnboardingWizard({ defaults }: { defaults?: Partial<OnboardingInput> }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(defaults?.name ?? '');
  const [category, setCategory] = useState(defaults?.category ?? CATEGORIES[0].value);
  const [logoUrl, setLogoUrl] = useState(defaults?.logo_url ?? '');

  const [address, setAddress] = useState(defaults?.address ?? '');
  const [lat, setLat] = useState<string>(defaults?.lat?.toString() ?? '48.7784');
  const [lng, setLng] = useState<string>(defaults?.lng?.toString() ?? '9.1800');

  const [phone, setPhone] = useState(defaults?.phone ?? '');
  const [email, setEmail] = useState(defaults?.email ?? '');
  const [website, setWebsite] = useState(defaults?.website ?? '');
  const [hours, setHours] = useState<Hours>(defaults?.hours ?? DEFAULT_HOURS);

  const [maxDiscount, setMaxDiscount] = useState<number>(defaults?.max_discount ?? 20);
  const [transactionVolume, setTransactionVolume] = useState<'low' | 'normal' | 'high'>(
    defaults?.transaction_volume ?? 'normal'
  );
  const [quietHours, setQuietHours] = useState<string[]>(defaults?.quiet_hours ?? []);

  function updateDay(key: DayKey, patch: Partial<{ open: string; close: string }> | null) {
    setHours((prev) => ({
      ...prev,
      [key]: patch === null ? null : { open: '09:00', close: '18:00', ...prev[key], ...patch },
    }));
  }

  function toggleClosed(key: DayKey) {
    setHours((prev) => ({
      ...prev,
      [key]: prev[key] === null ? { open: '09:00', close: '18:00' } : null,
    }));
  }

  function toggleQuiet(slot: string) {
    setQuietHours((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await completeOnboarding({
        name: name.trim(),
        category,
        address: address.trim(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        phone: phone.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        logo_url: logoUrl.trim() || null,
        hours,
        max_discount: maxDiscount,
        quiet_hours: quietHours,
        transaction_volume: transactionVolume,
      });
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  const canNext =
    (step === 0 && name.trim().length >= 2) ||
    (step === 1 && address.trim().length >= 2 && lat && lng) ||
    (step === 2 && true) ||
    step === 3;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Stepper steps={[...STEPS]} current={step} />
      <div className="swo-card p-8">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <header>
              <h2 className="font-display text-3xl">Tell us about your shop</h2>
              <p className="mt-1 text-sm text-ink-2">The basics customers will see on your card.</p>
            </header>
            <Input
              label="Business name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Café Linde"
            />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            />
            <Input
              label="Logo URL (optional)"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://…"
              hint="Paste a link to your logo. File upload coming soon."
            />
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <header>
              <h2 className="font-display text-3xl">Where are you?</h2>
              <p className="mt-1 text-sm text-ink-2">
                Your address shows on the card. Coordinates power distance ranking.
              </p>
            </header>
            <Input
              label="Street address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Königstraße 12, 70173 Stuttgart"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                inputMode="decimal"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
              <Input
                label="Longitude"
                inputMode="decimal"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </div>
            <p className="text-xs text-ink-3">
              Tip: drop a pin in Google Maps, right-click → copy lat/lng.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <header>
              <h2 className="font-display text-3xl">Hours & contact</h2>
              <p className="mt-1 text-sm text-ink-2">When are you open? How do customers reach you?</p>
            </header>
            <div className="grid gap-3">
              {DAYS.map((d) => {
                const v = hours[d.key as DayKey];
                const closed = v === null;
                return (
                  <div
                    key={d.key}
                    className="flex items-center gap-3 rounded-r3 border border-border-soft bg-paper px-3 py-2"
                  >
                    <span className="w-12 text-sm font-semibold text-ink">{d.short}</span>
                    {closed ? (
                      <span className="flex-1 text-sm text-ink-3">Closed</span>
                    ) : (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="time"
                          value={v?.open ?? '09:00'}
                          onChange={(e) => updateDay(d.key as DayKey, { open: e.target.value })}
                          className="swo-input w-28 px-2 py-1 text-sm"
                        />
                        <span className="text-ink-3">–</span>
                        <input
                          type="time"
                          value={v?.close ?? '18:00'}
                          onChange={(e) => updateDay(d.key as DayKey, { close: e.target.value })}
                          className="swo-input w-28 px-2 py-1 text-sm"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleClosed(d.key as DayKey)}
                      className="text-xs font-semibold text-coral underline-offset-4 hover:underline"
                    >
                      {closed ? 'Open this day' : 'Close this day'}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Public email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Input
              label="Website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://…"
            />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <header>
              <h2 className="font-display text-3xl">Set your offer policy</h2>
              <p className="mt-1 text-sm text-ink-2">
                Caps the AI-generated offers. You can change these anytime.
              </p>
            </header>
            <div>
              <label className="swo-label">Max discount: {maxDiscount}%</label>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(parseInt(e.target.value, 10))}
                className="mt-2 w-full accent-[#E36A4D]"
              />
              <p className="mt-1 text-xs text-ink-3">
                We'll never auto-generate a discount higher than this.
              </p>
            </div>
            <Select
              label="Transaction volume"
              value={transactionVolume}
              onChange={(e) => setTransactionVolume(e.target.value as 'low' | 'normal' | 'high')}
              options={[
                { value: 'low', label: 'Low — push harder discounts to attract' },
                { value: 'normal', label: 'Normal — balanced' },
                { value: 'high', label: 'High — keep discounts modest' },
              ]}
            />
            <div>
              <label className="swo-label">Quiet hours (no offers generated)</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {['07:00-09:00', '11:30-13:30', '17:00-19:00', '21:00-23:00'].map((slot) => (
                  <Chip
                    key={slot}
                    tone="mustard"
                    active={quietHours.includes(slot)}
                    onClick={() => toggleQuiet(slot)}
                  >
                    {slot}
                  </Chip>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-3">
                Tap to mute. Selected slots won't generate offers (e.g. peak service times).
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-r3 border-2 border-danger bg-coral-soft px-3 py-2 text-sm text-ink">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Continue →
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting}>
              Open my shop
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
