import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="mt-3 sm:mt-0 flex items-center gap-2">{actions}</div>}
    </header>
  );
}
