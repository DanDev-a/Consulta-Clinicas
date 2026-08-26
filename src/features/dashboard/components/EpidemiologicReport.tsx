import Badge from '../../../components/ui/Badge';
import type { EpidemiologicRow } from '../types/dashboard';

interface Props {
  data: EpidemiologicRow[];
}

export default function EpidemiologicReport({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">Sin datos epidemiologicos.</p>;
  }

  const maxTotal = Math.max(...data.map((d) => d.totalDiagnosticos));

  return (
    <div className="space-y-3">
      {data.map((row) => {
        const width = maxTotal > 0 ? (row.totalDiagnosticos / maxTotal) * 100 : 0;
        return (
          <div key={row.claveCie10} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">{row.claveCie10}</Badge>
                <span className="text-sm text-[var(--color-text)] truncate max-w-[300px]">
                  {row.descripcion}
                </span>
              </div>
              <span className="text-sm font-medium text-[var(--color-text-muted)]">
                {row.totalDiagnosticos}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface-alt)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
