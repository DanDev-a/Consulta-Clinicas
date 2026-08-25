import Badge from '../../../components/ui/Badge';
import type { ProductivityRow } from '../types/dashboard';

interface Props {
  data: ProductivityRow[];
}

export default function ProductivityReport({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">Sin datos de productividad.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border-light)]">
            <th className="text-left py-2 px-3 text-[var(--color-text-muted)] font-medium">Doctor</th>
            <th className="text-left py-2 px-3 text-[var(--color-text-muted)] font-medium">Especialidad</th>
            <th className="text-right py-2 px-3 text-[var(--color-text-muted)] font-medium">Total Citas</th>
            <th className="text-right py-2 px-3 text-[var(--color-text-muted)] font-medium">Atendidas</th>
            <th className="text-right py-2 px-3 text-[var(--color-text-muted)] font-medium">Prom/Dia</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const efficiency = row.totalCitas > 0 ? Math.round((row.citasAtendidas / row.totalCitas) * 100) : 0;
            return (
              <tr key={row.doctorId} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-alt)]">
                <td className="py-2 px-3 text-[var(--color-text)] font-medium">
                  Dr. {row.nombre} {row.apellido}
                </td>
                <td className="py-2 px-3 text-[var(--color-text-muted)]">{row.especialidad}</td>
                <td className="py-2 px-3 text-right text-[var(--color-text)]">{row.totalCitas}</td>
                <td className="py-2 px-3 text-right">
                  <Badge variant={efficiency >= 80 ? 'success' : efficiency >= 50 ? 'warning' : 'danger'} size="sm">
                    {row.citasAtendidas} ({efficiency}%)
                  </Badge>
                </td>
                <td className="py-2 px-3 text-right text-[var(--color-text)]">{row.promedioDiario}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
