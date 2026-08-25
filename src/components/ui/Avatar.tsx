interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ src, name, size = 'md' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={[
          'rounded-full object-cover',
          sizeMap[size],
        ].join(' ')}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={[
        'inline-flex items-center justify-center rounded-full',
        'bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-bold',
        sizeMap[size],
      ].join(' ')}
    >
      {getInitials(name)}
    </div>
  );
}
