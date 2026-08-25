import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, rows = 4, className = '', ...props }, ref) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-[var(--color-text)]"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={[
            'w-full rounded-lg border px-3 py-2.5 resize-y',
            'bg-[var(--color-input-bg)] text-[var(--color-text)]',
            'border-[var(--color-input-border)]',
            'placeholder:text-[var(--color-text-subtle)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
              : '',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <span id={`${textareaId}-error`} className="text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
