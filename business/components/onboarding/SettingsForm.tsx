'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormError } from '@/components/ui/FormError';
import { HoursEditor } from '@/components/ui/HoursEditor';
import { ImageGalleryUpload } from '@/components/ui/ImageGalleryUpload';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Input } from '@/components/ui/Input';
import { QuietHoursSelector } from '@/components/ui/QuietHoursSelector';
import { Select } from '@/components/ui/Select';
import { StringListInput } from '@/components/ui/StringListInput';
import { Textarea } from '@/components/ui/Textarea';
import { CATEGORIES, TRANSACTION_VOLUME_OPTIONS } from '@/lib/design-tokens';
import { updateMerchantProfile } from '@/actions/merchant';
import type { Merchant } from '@/types/db';

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
  const [logoUrl, setLogoUrl] = useState<string | null>(merchant.logo_url ?? null);
  const [hours, setHours] = useState(merchant.hours);
  const [maxDiscount, setMaxDiscount] = useState<number>(merchant.rules?.max_discount ?? 20);
  const [transactionVolume, setTransactionVolume] = useState<'low' | 'normal' | 'high'>(
    merchant.transaction_volume
  );
  const [quietHours, setQuietHours] = useState<string[]>(merchant.rules?.quiet_hours ?? []);
  const [about, setAbout] = useState<string>(merchant.about ?? '');
  const [products, setProducts] = useState<string[]>(merchant.products ?? []);
  const [gallery, setGallery] = useState<string[]>(merchant.gallery ?? []);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setError('Latitude and longitude must be valid numbers.');
      return;
    }
    setSaving(true);
    try {
      await updateMerchantProfile({
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
          <ImageUpload
            label="Logo"
            bucket="merchant-images"
            subpath="logo"
            shape="circle"
            value={logoUrl}
            onChange={setLogoUrl}
            className="md:col-span-2"
            hint="JPEG, PNG, or WebP. Up to 5MB."
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
        <div className="mt-4">
          <StringListInput
            value={products}
            onChange={setProducts}
            placeholder="e.g. Iced latte"
          />
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">Pictures</h3>
        <p className="mt-1 text-sm text-ink-2">
          Show customers your space and your products. Up to 12 photos.
        </p>
        <div className="mt-4">
          <ImageGalleryUpload
            value={gallery}
            onChange={setGallery}
            bucket="merchant-images"
            subpath="gallery"
            max={12}
            hint="JPEG, PNG, or WebP. Up to 5MB each."
          />
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-2xl">Hours</h3>
        <div className="mt-4">
          <HoursEditor value={hours} onChange={setHours} />
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
            options={TRANSACTION_VOLUME_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <div>
            <label className="swo-label">Quiet hours</label>
            <div className="mt-2">
              <QuietHoursSelector value={quietHours} onChange={setQuietHours} />
            </div>
          </div>
        </div>
      </Card>

      <FormError message={error} />

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm font-semibold text-mint-deep">Saved ✓</span>}
        <Button type="submit" loading={saving} size="lg">
          Save changes
        </Button>
      </div>
    </form>
  );
}
