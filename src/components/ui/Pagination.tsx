import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className={[
          'inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm transition-colors',
          'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]',
          'disabled:opacity-40 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        <RiArrowLeftSLine size={18} />
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex items-center justify-center h-9 w-9 text-sm text-[var(--color-text-subtle)]"
            aria-hidden="true"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? 'page' : undefined}
            className={[
              'inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors',
              currentPage === page
                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]',
            ].join(' ')}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
        className={[
          'inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm transition-colors',
          'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]',
          'disabled:opacity-40 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        <RiArrowRightSLine size={18} />
      </button>
    </nav>
  );
}
