interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  id?: string;
  description?: string;
}

export default function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
  error,
  id,
  description,
}: ToggleProps) {
  const toggleId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={toggleId}
        className="inline-flex items-center gap-3 cursor-pointer select-none"
      >
        <button
          id={toggleId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-describedby={error ? `${toggleId}-error` : description ? `${toggleId}-desc` : undefined}
          aria-invalid={error ? 'true' : undefined}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={[
            'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-input-border)]',
            error ? 'ring-2 ring-[var(--color-danger)] ring-offset-2 ring-offset-[var(--color-surface)]' : '',
          ].join(' ')}
        >
          <span
            aria-hidden="true"
            className={[
              'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
              'translate-y-0.5',
              checked ? 'translate-x-5.5' : 'translate-x-0.5',
            ].join(' ')}
          />
        </button>
        <span className="text-sm text-[var(--color-text)]">{label}</span>
      </label>
      {description && (
        <span id={`${toggleId}-desc`} className="text-xs text-[var(--color-text-muted)] ml-14">
          {description}
        </span>
      )}
      {error && (
        <span id={`${toggleId}-error`} className="text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
