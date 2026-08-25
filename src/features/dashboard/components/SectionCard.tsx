import { type ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export default function SectionCard({ title, subtitle, children, className = '', actions }: SectionCardProps) {
  return (
    <section className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] ${className}`}>
      <header className="px-6 py-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <div className="px-6 py-4">{children}</div>
    </section>
  );
}
