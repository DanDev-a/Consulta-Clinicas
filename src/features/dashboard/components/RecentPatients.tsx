import { RiUserLine } from 'react-icons/ri';
import Badge from '../../../components/ui/Badge';
import type { RecentPatient } from '../types/dashboard';

interface RecentPatientsProps {
  patients: RecentPatient[];
}

export default function RecentPatients({ patients }: RecentPatientsProps) {
  if (patients.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">No hay pacientes recientes.</p>;
  }

  return (
    <div className="space-y-3">
      {patients.map((p) => (
        <div
          key={p.idPaciente}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface-alt)] transition-colors"
        >
          <div className="p-2 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <RiUserLine className="text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">
              {p.nombre} {p.apellido}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{p.email}</p>
          </div>
          <Badge variant="info" size="sm">
            {new Date(p.fechaRegistro).toLocaleDateString('es-BO')}
          </Badge>
        </div>
      ))}
    </div>
  );
}
