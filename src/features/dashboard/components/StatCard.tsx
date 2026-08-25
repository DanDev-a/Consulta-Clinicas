import {
  RiUserHeartLine,
  RiCalendarEventLine,
  RiStethoscopeLine,
  RiBarChartLine,
} from 'react-icons/ri';
import type { StatCardData } from '../types/dashboard';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  RiUserHeartLine,
  RiCalendarEventLine,
  RiStethoscopeLine,
  RiBarChartLine,
};

const colorMap: Record<string, string> = {
  accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
};

interface StatCardProps {
  data: StatCardData;
}

export default function StatCard({ data }: StatCardProps) {
  const Icon = iconMap[data.icon];
  const colorClass = colorMap[data.color ?? 'accent'];

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        {Icon && <Icon className="text-xl" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text-muted)] truncate">{data.label}</p>
        <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{data.value}</p>
        {data.trend && (
          <p className={`text-xs mt-1 ${data.trend.isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
            {data.trend.isPositive ? '+' : ''}{data.trend.value}% este mes
          </p>
        )}
      </div>
    </article>
  );
}
