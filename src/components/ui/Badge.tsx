import { type ReactNode } from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
  info: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  neutral: 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  variant = 'neutral',
  size = 'sm',
  children,
}: BadgeProps) {
  return (
    <span
      role="status"
      className={[
        'inline-flex items-center font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
      ].join(' ')}
    >
      {children}
    </span>
  );
}
