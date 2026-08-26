import { RiCalendarEventLine } from 'react-icons/ri';
import Badge from '../../../components/ui/Badge';
import type { UpcomingAppointment } from '../types/dashboard';

interface UpcomingAppointmentsProps {
  appointments: UpcomingAppointment[];
}

const estadoVariant: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> = {
  PENDIENTE: 'warning',
  CONFIRMADA: 'info',
  ATENDIDA: 'success',
  CANCELADA: 'danger',
};

export default function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  if (appointments.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">No hay citas programadas.</p>;
  }

  return (
    <div className="space-y-3">
      {appointments.map((a) => (
        <div
          key={a.idCita}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface-alt)] transition-colors"
        >
          <div className="p-2 rounded-lg bg-[var(--color-success-soft)] text-[var(--color-success)]">
            <RiCalendarEventLine className="text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">
              {a.pacienteNombre} {a.pacienteApellido}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Dr. {a.doctorNombre} {a.doctorApellido} - {a.especialidad}
            </p>
            <p className="text-xs text-[var(--color-text-subtle)]">
              {new Date(a.fechaHora).toLocaleDateString('es-BO', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <Badge variant={estadoVariant[a.estado] ?? 'neutral'} size="sm">
            {a.estado}
          </Badge>
        </div>
      ))}
    </div>
  );
}
