'use client';

import { Chip } from '@/components/ui/Chip';
import { QUIET_HOURS_SLOTS } from '@/lib/design-tokens';

export function QuietHoursSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(slot: string) {
    onChange(value.includes(slot) ? value.filter((s) => s !== slot) : [...value, slot]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {QUIET_HOURS_SLOTS.map((slot) => (
        <Chip key={slot} tone="mustard" active={value.includes(slot)} onClick={() => toggle(slot)}>
          {slot}
        </Chip>
      ))}
    </div>
  );
}
