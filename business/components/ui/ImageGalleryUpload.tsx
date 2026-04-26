'use client';

import { useRef, useState } from 'react';
import { uploadImage, deleteImage, type UploadBucket } from '@/lib/upload';

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket: UploadBucket;
  subpath: string;
  max?: number;
  hint?: string;
};

export function ImageGalleryUpload({
  value, onChange, bucket, subpath, max = 12, hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    setBusy(true);
    const slotsLeft = max - value.length;
    const accepted = Array.from(files).slice(0, slotsLeft);
    try {
      const uploaded: string[] = [];
      for (const file of accepted) {
        const url = await uploadImage(bucket, file, subpath);
        uploaded.push(url);
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleRemove(url: string) {
    onChange(value.filter((u) => u !== url));
    deleteImage(bucket, url).catch(() => {});
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((url) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-r3 border-2 border-ink bg-cream-deep"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute right-1.5 top-1.5 rounded-full border-2 border-ink bg-paper px-2 py-0.5 text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center rounded-r3 border-2 border-dashed border-ink-3 bg-cream-deep text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:opacity-60"
          >
            <span className="text-3xl leading-none">+</span>
            <span className="mt-1 text-xs font-semibold">
              {busy ? 'Uploading…' : 'Add photos'}
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
        }}
      />
      {hint && !error && <p className="mt-2 text-xs text-ink-3">{hint}</p>}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
