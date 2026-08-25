interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export default function Separator({
  orientation = 'horizontal',
  className = '',
}: SeparatorProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={[
          'w-px h-full bg-[var(--color-border)]',
          className,
        ].join(' ')}
      />
    );
  }

  return (
    <hr
      className={[
        'w-full border-0 border-t border-[var(--color-border)]',
        className,
      ].join(' ')}
    />
  );
}
