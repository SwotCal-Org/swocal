import { forwardRef, type TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
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
      <textarea
        ref={ref}
        id={inputId}
        className={`swo-input min-h-[88px] resize-y ${className}`}
        {...rest}
      />
      {(hint || error) && (
        <span className={`text-xs ${error ? 'text-danger' : 'text-ink-3'}`}>{error || hint}</span>
      )}
    </div>
  );
});
