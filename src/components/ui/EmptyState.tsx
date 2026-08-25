import { type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { RiInboxLine } from 'react-icons/ri';

interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon: Icon = RiInboxLine,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div role="status" className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-alt)] mb-4">
        <Icon className="text-2xl text-[var(--color-text-subtle)]" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
