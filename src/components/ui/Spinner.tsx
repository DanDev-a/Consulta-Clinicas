interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-[2px]',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={[
        'animate-spin rounded-full border-accent border-t-transparent',
        sizeMap[size],
        className,
      ].join(' ')}
    />
  );
}
