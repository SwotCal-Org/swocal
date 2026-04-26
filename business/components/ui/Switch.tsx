'use client';

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-6 w-11 rounded-full border-2 border-ink transition-colors',
          checked ? 'bg-mustard' : 'bg-cream-deep',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-[1px] h-4 w-4 rounded-full bg-ink transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-[2px]',
          ].join(' ')}
        />
      </button>
      {label && <span className="text-sm text-ink-2">{label}</span>}
    </label>
  );
}
