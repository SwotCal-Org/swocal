import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'coral' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-mustard text-ink border-2 border-ink shadow-[3px_4px_0_#2A1F1A] hover:translate-y-[-1px] hover:shadow-[3px_5px_0_#2A1F1A]',
  coral:
    'bg-coral text-paper border-2 border-ink shadow-[3px_4px_0_#2A1F1A] hover:translate-y-[-1px]',
  ghost:
    'bg-transparent text-ink-2 hover:text-ink hover:bg-cream-deep border border-transparent',
  outline:
    'bg-paper text-ink border-2 border-ink hover:bg-cream-deep',
  danger:
    'bg-danger text-paper border-2 border-ink shadow-[3px_4px_0_#2A1F1A]',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading, disabled, className = '', children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-r3 font-body font-semibold',
        'transition-all duration-150 active:translate-y-[1px] active:shadow-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
});

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
