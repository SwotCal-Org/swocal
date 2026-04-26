import type { ReactNode } from 'react';

type Tone = 'mustard' | 'coral' | 'mint' | 'sky' | 'plum' | 'neutral';

const TONES: Record<Tone, string> = {
  mustard: 'bg-mustard text-ink',
  coral: 'bg-coral text-paper',
  mint: 'bg-mint text-paper',
  sky: 'bg-sky text-paper',
  plum: 'bg-plum text-paper',
  neutral: 'bg-cream-deep text-ink',
};

export function Chip({
  children,
  tone = 'mustard',
  active,
  onClick,
}: {
  children: ReactNode;
  tone?: Tone;
  active?: boolean;
  onClick?: () => void;
}) {
  const isInteractive = typeof onClick === 'function';
  const Tag = isInteractive ? 'button' : 'span';
  return (
    <Tag
      type={isInteractive ? 'button' : undefined}
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        'border-2 border-ink',
        active === false ? 'opacity-50' : '',
        TONES[tone],
        isInteractive ? 'cursor-pointer transition-transform active:translate-y-[1px]' : '',
      ].join(' ')}
    >
      {children}
    </Tag>
  );
}
