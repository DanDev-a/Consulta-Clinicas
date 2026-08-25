interface SkeletonProps {
  lines?: number;
  variant?: 'text' | 'rectangular' | 'circular';
  className?: string;
}

export default function Skeleton({
  lines = 3,
  variant = 'text',
  className = '',
}: SkeletonProps) {
  if (variant === 'circular') {
    return (
      <div
        aria-busy="true"
        aria-label="Cargando contenido"
        className={[
          'animate-pulse rounded-full bg-[var(--color-surface-alt)]',
          className,
        ].join(' ')}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        aria-busy="true"
        aria-label="Cargando contenido"
        className={[
          'animate-pulse rounded-lg bg-[var(--color-surface-alt)]',
          className,
        ].join(' ')}
      />
    );
  }

  return (
    <div
      aria-busy="true"
      aria-label="Cargando contenido"
      className={['space-y-2', className].join(' ')}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={[
            'h-4 rounded bg-[var(--color-surface-alt)] animate-pulse',
            i === lines - 1 ? 'w-3/4' : 'w-full',
          ].join(' ')}
        />
      ))}
    </div>
  );
}
