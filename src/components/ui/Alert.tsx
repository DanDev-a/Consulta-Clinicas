import { type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { RiCloseLine } from 'react-icons/ri';

type AlertVariant = 'success' | 'danger' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  icon?: IconType;
  onClose?: () => void;
  children: ReactNode;
}

const variantStyles: Record<AlertVariant, string> = {
  success: 'border-l-[var(--color-success)] bg-[var(--color-success-soft)]',
  danger: 'border-l-[var(--color-danger)] bg-[var(--color-danger-soft)]',
  warning: 'border-l-[var(--color-warning)] bg-[var(--color-warning-soft)]',
  info: 'border-l-[var(--color-accent)] bg-[var(--color-accent-soft)]',
};

const iconColorMap: Record<AlertVariant, string> = {
  success: 'text-[var(--color-success)]',
  danger: 'text-[var(--color-danger)]',
  warning: 'text-[var(--color-warning)]',
  info: 'text-[var(--color-accent)]',
};

export default function Alert({
  variant = 'info',
  title,
  icon: Icon,
  onClose,
  children,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={[
        'flex items-start gap-3 rounded-lg border-l-4 px-4 py-3',
        variantStyles[variant],
      ].join(' ')}
    >
      {Icon && (
        <Icon
          className={['mt-0.5 shrink-0 text-lg', iconColorMap[variant]].join(' ')}
          aria-hidden="true"
        />
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold text-[var(--color-text)]">
            {title}
          </h4>
        )}
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          {children}
        </p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="shrink-0 p-0.5 rounded hover:bg-[var(--color-surface-alt)] text-[var(--color-text-subtle)] transition-colors"
        >
          <RiCloseLine size={18} />
        </button>
      )}
    </div>
  );
}
