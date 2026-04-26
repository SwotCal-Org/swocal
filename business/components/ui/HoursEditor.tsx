'use client';

import { DAYS } from '@/lib/design-tokens';
import type { DayKey, Hours } from '@/types/db';

const DEFAULT_OPEN = '09:00';
const DEFAULT_CLOSE = '18:00';

export function HoursEditor({ value, onChange }: { value: Hours; onChange: (next: Hours) => void }) {
  function setDay(key: DayKey, patch: Partial<{ open: string; close: string }> | null) {
    onChange({
      ...value,
      [key]: patch === null ? null : { open: DEFAULT_OPEN, close: DEFAULT_CLOSE, ...value[key], ...patch },
    });
  }

  function toggleClosed(key: DayKey) {
    onChange({
      ...value,
      [key]: value[key] === null ? { open: DEFAULT_OPEN, close: DEFAULT_CLOSE } : null,
    });
  }

  return (
    <div className="grid gap-3">
      {DAYS.map((d) => {
        const v = value[d.key as DayKey];
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
                  value={v?.open ?? DEFAULT_OPEN}
                  onChange={(e) => setDay(d.key as DayKey, { open: e.target.value })}
                  className="swo-input w-28 px-2 py-1 text-sm"
                />
                <span className="text-ink-3">–</span>
                <input
                  type="time"
                  value={v?.close ?? DEFAULT_CLOSE}
                  onChange={(e) => setDay(d.key as DayKey, { close: e.target.value })}
                  className="swo-input w-28 px-2 py-1 text-sm"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => toggleClosed(d.key as DayKey)}
              className="text-xs font-semibold text-coral underline-offset-4 hover:underline"
            >
              {closed ? 'Open this day' : 'Close this day'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
