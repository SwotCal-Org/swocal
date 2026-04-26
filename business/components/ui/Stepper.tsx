export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-3">
            <div
              className={[
                'flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink text-xs font-bold',
                done ? 'bg-mint text-paper' : active ? 'bg-mustard text-ink' : 'bg-paper text-ink-3',
              ].join(' ')}
            >
              {done ? '✓' : i + 1}
            </div>
            <span
              className={[
                'text-sm',
                active ? 'font-semibold text-ink' : done ? 'text-ink-2' : 'text-ink-3',
              ].join(' ')}
            >
              {label}
            </span>
            {i < steps.length - 1 && <span className="h-px w-6 bg-border-soft" />}
          </div>
        );
      })}
    </div>
  );
}
