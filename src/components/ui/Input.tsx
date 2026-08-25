import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text)]"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-lg border px-3 py-2.5
            bg-[var(--color-input-bg)] text-[var(--color-text)]
            border-[var(--color-input-border)]
            placeholder:text-[var(--color-text-subtle)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs text-[var(--color-danger)]">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;