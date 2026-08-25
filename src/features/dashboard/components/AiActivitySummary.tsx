import { RiRobot2Line } from 'react-icons/ri';
import Badge from '../../../components/ui/Badge';
import type { AiActivity } from '../types/dashboard';

interface Props {
  data: AiActivity | null;
}

export default function AiActivitySummary({ data }: Props) {
  if (!data) {
    return <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">Sin datos de actividad IA.</p>;
  }

  const items = [
    { label: 'Total diagnosticos', value: data.totalDiagnostico, color: 'accent' as const },
    { label: 'Pendientes', value: data.pendientes, color: 'warning' as const },
    { label: 'Aceptados', value: data.aceptados, color: 'success' as const },
    { label: 'Rechazados', value: data.rechazados, color: 'danger' as const },
    { label: 'Modificados', value: data.modificados, color: 'info' as const },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-accent-soft)]">
        <RiRobot2Line className="text-2xl text-[var(--color-accent)]" />
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">Tasa de aceptacion</p>
          <p className="text-2xl font-bold text-[var(--color-accent)]">{data.tasaAceptacion}%</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-alt)]">
            <span className="text-xs text-[var(--color-text-muted)]">{item.label}</span>
            <Badge variant={item.color} size="sm">{item.value}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
