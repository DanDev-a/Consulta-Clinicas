import Badge from '../../../components/ui/Badge';
import type { AppointmentReportRow } from '../types/dashboard';

interface Props {
  data: AppointmentReportRow[];
}

export default function AppointmentReport({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">Sin datos de reporte.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border-light)]">
            <th className="text-left py-2 px-3 text-[var(--color-text-muted)] font-medium">Fecha</th>
            <th className="text-right py-2 px-3 text-[var(--color-text-muted)] font-medium">Total</th>
            <th className="text-right py-2 px-3 text-[var(--color-text-muted)] font-medium">Pendientes</th>
            <th className="text-right py-2 px-3 text-[var(--color-text-muted)] font-medium">Confirmadas</th>
            <th className="text-right py-2 px-3 text-[var(--color-text-muted)] font-medium">Atendidas</th>
            <th className="text-right py-2 px-3 text-[var(--color-text-muted)] font-medium">Canceladas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.fecha} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-alt)]">
              <td className="py-2 px-3 text-[var(--color-text)]">
                {new Date(row.fecha + 'T12:00:00').toLocaleDateString('es-BO')}
              </td>
              <td className="py-2 px-3 text-right font-medium text-[var(--color-text)]">{row.total}</td>
              <td className="py-2 px-3 text-right"><Badge variant="warning" size="sm">{row.pendientes}</Badge></td>
              <td className="py-2 px-3 text-right"><Badge variant="info" size="sm">{row.confirmadas}</Badge></td>
              <td className="py-2 px-3 text-right"><Badge variant="success" size="sm">{row.atendidas}</Badge></td>
              <td className="py-2 px-3 text-right"><Badge variant="danger" size="sm">{row.canceladas}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
