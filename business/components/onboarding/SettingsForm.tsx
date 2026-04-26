'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Textarea } from '@/components/ui/Textarea';
import { CATEGORIES, DAYS } from '@/lib/design-tokens';
import { updateMerchantProfile } from '@/actions/merchant';
import type { Merchant, DayKey } from '@/types/db';

export function SettingsForm({ merchant }: { merchant: Merchant }) {
  const router = useRouter();
  const [name, setName] = useState(merchant.name);
  const [category, setCategory] = useState(merchant.category);
  const [address, setAddress] = useState(merchant.address ?? '');
  const [lat, setLat] = useState<string>(merchant.lat?.toString() ?? '');
  const [lng, setLng] = useState<string>(merchant.lng?.toString() ?? '');
  const [phone, setPhone] = useState(merchant.phone ?? '');
  const [email, setEmail] = useState(merchant.email ?? '');
  const [website, setWebsite] = useState(merchant.website ?? '');
  const [logoUrl, setLogoUrl] = useState(merchant.logo_url ?? '');
  const [hours, setHours] = useState(merchant.hours);
  const [maxDiscount, setMaxDiscount] = useState<number>(merchant.rules?.max_discount ?? 20);
  const [transactionVolume, setTransactionVolume] = useState<'low' | 'normal' | 'high'>(
    merchant.transaction_volume
  );
  const [quietHours, setQuietHours] = useState<string[]>(merchant.rules?.quiet_hours ?? []);
  const [about, setAbout] = useState<string>(merchant.about ?? '');
  const [products, setProducts] = useState<string[]>(merchant.products ?? []);
  const [productDraft, setProductDraft] = useState('');
  const [gallery, setGallery] = useState<string[]>(merchant.gallery ?? []);
  const [galleryDraft, setGalleryDraft] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  function addProduct() {
    const v = productDraft.trim();
    if (!v) return;
    if (products.includes(v)) {
      setProductDraft('');
      return;
    }
    setProducts((prev) => [...prev, v]);
    setProductDraft('');
  }

  function removeProduct(value: string) {
    setProducts((prev) => prev.filter((p) => p !== value));
  }

  function addGalleryImage() {
    const v = galleryDraft.trim();
    if (!v) return;
    try {
      new URL(v);
    } catch {
      setError('Gallery image must be a valid URL.');
      return;
    }
    if (gallery.includes(v)) {
      setGalleryDraft('');
      return;
    }
    setGallery((prev) => [...prev, v]);
    setGalleryDraft('');
    setError(null);
  }

  function removeGalleryImage(url: string) {
    setGallery((prev) => prev.filter((g) => g !== url));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateMerchantProfile({
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
        about: about.trim() || null,
        products,
        gallery,
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
        <h3 className="font-display text-2xl">Business profile</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input label="Business name" value={name} onChange={(e) => setName(e.target.value)} />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          />
          <Input
            label="Logo URL"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="md:col-span-2"
          />
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="md:col-span-2"
          />
          <Input label="Latitude" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} />
          <Input label="Longitude" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} />
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">Contact</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">About</h3>
        <p className="mt-1 text-sm text-ink-2">
          Introduce your shop and yourself. This is what customers will read in the app.
        </p>
        <div className="mt-4">
          <Textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell customers what your place is about, who you are, what makes it special…"
            rows={5}
            maxLength={2000}
          />
          <p className="mt-1 text-xs text-ink-3">{about.length}/2000</p>
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">Products</h3>
        <p className="mt-1 text-sm text-ink-2">
          Add the products or services you offer. The AI uses this to write better coupon offers.
        </p>
        <div className="mt-4 flex gap-2">
          <Input
            value={productDraft}
            onChange={(e) => setProductDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addProduct();
              }
            }}
            placeholder="e.g. Iced latte"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addProduct}>
            Add
          </Button>
        </div>
        {products.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {products.map((p) => (
              <Chip key={p} tone="neutral" onClick={() => removeProduct(p)}>
                {p} <span aria-hidden className="ml-1 text-ink-3">×</span>
              </Chip>
            ))}
          </div>
        )}
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">Pictures</h3>
        <p className="mt-1 text-sm text-ink-2">
          Add image URLs to show customers your space and your products.
        </p>
        <div className="mt-4 flex gap-2">
          <Input
            type="url"
            value={galleryDraft}
            onChange={(e) => setGalleryDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addGalleryImage();
              }
            }}
            placeholder="https://…"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addGalleryImage}>
            Add
          </Button>
        </div>
        {gallery.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-r3 border-2 border-ink bg-cream-deep"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  className="absolute right-1.5 top-1.5 rounded-full border-2 border-ink bg-paper px-2 py-0.5 text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">Hours</h3>
        <div className="mt-4 grid gap-3">
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
                  {closed ? 'Open' : 'Close'}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">AI offer policy</h3>
        <p className="mt-1 text-sm text-ink-2">
          These caps drive the customer-side AI offer generator. They don't affect your static coupons.
        </p>
        <div className="mt-4 flex flex-col gap-5">
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
          </div>
          <Select
            label="Transaction volume"
            value={transactionVolume}
            onChange={(e) => setTransactionVolume(e.target.value as 'low' | 'normal' | 'high')}
            options={[
              { value: 'low', label: 'Low — push harder discounts' },
              { value: 'normal', label: 'Normal — balanced' },
              { value: 'high', label: 'High — modest discounts' },
            ]}
          />
          <div>
            <label className="swo-label">Quiet hours</label>
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
          </div>
        </div>
      </Card>

      {error && (
        <div className="rounded-r3 border-2 border-danger bg-coral-soft px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm font-semibold text-mint-deep">Saved ✓</span>}
        <Button type="submit" loading={saving} size="lg">
          Save changes
        </Button>
      </div>
    </form>
  );
}
