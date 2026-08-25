import { type ButtonHTMLAttributes } from 'react';
import type { IconType } from 'react-icons';
import Spinner from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-text-inverse hover:bg-accent-hover active:bg-accent-hover',
  secondary:
    'bg-surface-alt text-text hover:bg-surface-elevated active:bg-surface-elevated border border-border',
  danger:
    'bg-danger text-text-inverse hover:opacity-90 active:opacity-90',
  ghost:
    'bg-transparent text-text hover:bg-surface-alt active:bg-surface-alt',
  outline:
    'bg-transparent text-text border border-border hover:bg-surface-alt active:bg-surface-alt',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-md',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

const iconSizeMap: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 };

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} />
      ) : (
        Icon && iconPosition === 'left' && (
          <Icon size={iconSizeMap[size]} aria-hidden="true" />
        )
      )}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={iconSizeMap[size]} aria-hidden="true" />
      )}
    </button>
  );
}
