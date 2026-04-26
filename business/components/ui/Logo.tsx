export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="inline-flex items-center justify-center rounded-full border-2 border-ink bg-mustard text-ink font-display font-black"
        style={{ width: size, height: size, fontSize: size * 0.45 }}
      >
        S
      </span>
      <span className="font-display text-lg font-bold leading-none">
        swocal <span className="text-coral">·</span> business
      </span>
    </div>
  );
}
