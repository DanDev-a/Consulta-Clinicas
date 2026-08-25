import { type SelectHTMLAttributes } from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export default function Select({
  label,
  options,
  error,
  placeholder,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-[var(--color-text)]"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-describedby={error ? `${selectId}-error` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={[
            'w-full appearance-none rounded-lg border px-3 py-2.5 pr-10',
            'bg-[var(--color-input-bg)] text-[var(--color-text)]',
            'border-[var(--color-input-border)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
              : '',
            className,
          ].join(' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <RiArrowDownSLine
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]"
          aria-hidden="true"
        />
      </div>
      {error && (
        <span id={`${selectId}-error`} className="text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
