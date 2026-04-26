import { forwardRef, type SelectHTMLAttributes } from 'react';

type Option = { value: string; label: string };
type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label?: string;
  hint?: string;
  error?: string;
  options: ReadonlyArray<Option>;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, hint, error, options, id, className = '', ...rest },
  ref
) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="swo-label">
          {label}
        </label>
      )}
      <select ref={ref} id={inputId} className={`swo-input pr-8 ${className}`} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {(hint || error) && (
        <span className={`text-xs ${error ? 'text-danger' : 'text-ink-3'}`}>{error || hint}</span>
      )}
    </div>
  );
});
