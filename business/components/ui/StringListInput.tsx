'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  inputType?: 'text' | 'url';
  validate?: (raw: string) => string | null; // return error message or null
  renderItem?: (item: string, onRemove: () => void) => ReactNode;
};

export function StringListInput({
  value,
  onChange,
  placeholder,
  inputType = 'text',
  validate,
  renderItem,
}: Props) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (validate) {
      const err = validate(v);
      if (err) {
        setError(err);
        return;
      }
    }
    if (value.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...value, v]);
    setDraft('');
    setError(null);
  }

  function remove(item: string) {
    onChange(value.filter((v) => v !== item));
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          type={inputType}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {value.length > 0 && (
        <div className="mt-3">
          {renderItem ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {value.map((item) => renderItem(item, () => remove(item)))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {value.map((item) => (
                <Chip key={item} tone="neutral" onClick={() => remove(item)}>
                  {item} <span aria-hidden className="ml-1 text-ink-3">×</span>
                </Chip>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
