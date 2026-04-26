'use client';

import { useRef, useState } from 'react';
import { uploadImage, deleteImage, type UploadBucket } from '@/lib/upload';

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket: UploadBucket;
  subpath: string;            // e.g. 'logo' or 'banner'
  label?: string;
  hint?: string;
  className?: string;
  shape?: 'square' | 'circle';
};

export function ImageUpload({
  value, onChange, bucket, subpath, label, hint, className, shape = 'square',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePick(file: File) {
    setError(null);
    setBusy(true);
    try {
      const previous = value;
      const url = await uploadImage(bucket, file, subpath);
      onChange(url);
      // Best-effort cleanup of the prior file. Non-fatal if it fails.
      if (previous) deleteImage(bucket, previous).catch(() => {});
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleRemove() {
    if (!value) return;
    const previous = value;
    onChange(null);
    deleteImage(bucket, previous).catch(() => {});
  }

  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-r3';

  return (
    <div className={className}>
      {label && <label className="swo-label">{label}</label>}
      <div className="mt-1.5 flex items-center gap-3">
        <div
          className={`relative h-20 w-20 overflow-hidden border-2 border-ink bg-cream-deep ${radius}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl text-ink-3">
              +
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-r2 border-2 border-ink bg-mustard px-3 py-1.5 text-sm font-bold text-ink shadow-sticker-soft disabled:opacity-60"
          >
            {busy ? 'Uploading…' : value ? 'Replace' : 'Upload image'}
          </button>
          {value && !busy && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-left text-xs font-semibold text-ink-3 underline-offset-2 hover:text-danger hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePick(file);
        }}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-ink-3">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
