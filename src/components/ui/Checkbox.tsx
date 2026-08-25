import { type InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export default function Checkbox({
  label,
  error,
  id,
  className = '',
  ...props
}: CheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={checkboxId}
        className="inline-flex items-center gap-2.5 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          id={checkboxId}
          aria-describedby={error ? `${checkboxId}-error` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={[
            'h-4 w-4 rounded border-[var(--color-input-border)]',
            'text-[var(--color-accent)] bg-[var(--color-input-bg)]',
            'focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'accent-[var(--color-accent)]',
            error ? 'border-[var(--color-danger)]' : '',
            className,
          ].join(' ')}
          {...props}
        />
        <span className="text-sm text-[var(--color-text)]">{label}</span>
      </label>
      {error && (
        <span id={`${checkboxId}-error`} className="text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
