import { forwardRef, type InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, id, className = '', ...rest },
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
      <input ref={ref} id={inputId} className={`swo-input ${className}`} {...rest} />
      {(hint || error) && (
        <span className={`text-xs ${error ? 'text-danger' : 'text-ink-3'}`}>{error || hint}</span>
      )}
    </div>
  );
});
