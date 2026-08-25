import { type InputHTMLAttributes } from 'react';
import { RiCalendarLine } from 'react-icons/ri';

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export default function DatePicker({
  label,
  error,
  id,
  className = '',
  ...props
}: DatePickerProps) {
  const dateId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={dateId}
        className="text-sm font-medium text-[var(--color-text)]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="date"
          id={dateId}
          aria-describedby={error ? `${dateId}-error` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={[
            'w-full rounded-lg border px-3 py-2.5 pr-10',
            'bg-[var(--color-input-bg)] text-[var(--color-text)]',
            'border-[var(--color-input-border)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[&::-webkit-calendar-picker-indicator]:opacity-0',
            '[&::-webkit-calendar-picker-indicator]:absolute',
            '[&::-webkit-calendar-picker-indicator]:inset-0',
            '[&::-webkit-calendar-picker-indicator]:w-full',
            '[&::-webkit-calendar-picker-indicator]:h-full',
            '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
            error
              ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
              : '',
            className,
          ].join(' ')}
          {...props}
        />
        <RiCalendarLine
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]"
          aria-hidden="true"
        />
      </div>
      {error && (
        <span id={`${dateId}-error`} className="text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
