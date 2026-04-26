'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { HoursEditor } from '@/components/ui/HoursEditor';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Input } from '@/components/ui/Input';
import { QuietHoursSelector } from '@/components/ui/QuietHoursSelector';
import { Select } from '@/components/ui/Select';
import { Stepper } from '@/components/ui/Stepper';
import { CATEGORIES, TRANSACTION_VOLUME_OPTIONS } from '@/lib/design-tokens';
import { completeOnboarding, type OnboardingInput } from '@/actions/merchant';
import type { Hours } from '@/types/db';

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
  const [logoUrl, setLogoUrl] = useState<string | null>(defaults?.logo_url ?? null);

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

  async function handleSubmit() {
    setError(null);
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setError('Latitude and longitude must be valid numbers.');
      return;
    }
    setSubmitting(true);
    try {
      await completeOnboarding({
        name: name.trim(),
        category,
        address: address.trim(),
        lat: latNum,
        lng: lngNum,
        phone: phone.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        logo_url: logoUrl,
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
            <ImageUpload
              label="Logo (optional)"
              bucket="merchant-images"
              subpath="logo"
              shape="circle"
              value={logoUrl}
              onChange={setLogoUrl}
              hint="JPEG, PNG, or WebP. Up to 5MB."
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
            <HoursEditor value={hours} onChange={setHours} />
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
              options={TRANSACTION_VOLUME_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <div>
              <label className="swo-label">Quiet hours (no offers generated)</label>
              <div className="mt-2">
                <QuietHoursSelector value={quietHours} onChange={setQuietHours} />
              </div>
              <p className="mt-2 text-xs text-ink-3">
                Tap to mute. Selected slots won't generate offers (e.g. peak service times).
              </p>
            </div>
          </div>
        )}

        <div className="mt-5">
          <FormError message={error} />
        </div>

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
