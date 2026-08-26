import { type ReactNode } from 'react';
import { RiArrowRightSLine } from 'react-icons/ri';

/* ─── Root ─── */
interface BreadcrumbProps {
  separator?: ReactNode;
  children: ReactNode;
  className?: string;
}

function BreadcrumbRoot({ separator = <RiArrowRightSLine size={14} />, children, className = '' }: BreadcrumbProps) {
  const items = Array.isArray(children) ? children : [children];

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, i) => {
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <span aria-hidden="true" className="text-[var(--color-text-subtle)]">
                  {separator}
                </span>
              )}
              {item}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ─── Item ─── */
interface BreadcrumbItemProps {
  href?: string;
  current?: boolean;
  children: ReactNode;
  className?: string;
}

function BreadcrumbItem({ href, current = false, children, className = '' }: BreadcrumbItemProps) {
  const baseClass = [
    'text-sm transition-colors',
    current
      ? 'font-semibold text-[var(--color-text)]'
      : href
        ? 'text-[var(--color-text-muted)] hover:text-[var(--color-accent)]'
        : 'text-[var(--color-text-subtle)]',
    className,
  ].join(' ');

  if (current) {
    return (
      <span aria-current="page" className={baseClass}>
        {children}
      </span>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClass}>
        {children}
      </a>
    );
  }

  return <span className={baseClass}>{children}</span>;
}

/* ─── Composed ─── */
const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Item: BreadcrumbItem,
});

export default Breadcrumb;
