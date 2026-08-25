import { useMemo } from 'react';
import type { Appointment } from '../types/appointment';
import AppointmentStatusBadge from './AppointmentStatusBadge';

interface AgendaViewProps {
  appointments: Appointment[];
  onSelectEvent?: (appointment: Appointment) => void;
}

function getStatusBorderColor(status: string): string {
  const map: Record<string, string> = {
    PENDIENTE: 'var(--color-warning)',
    CONFIRMADA: 'var(--color-accent)',
    ATENDIDA: 'var(--color-success)',
    CANCELADA: 'var(--color-danger)',
  };
  return map[status] ?? 'var(--color-border)';
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === tomorrow.toDateString()) return 'Mañana';

  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function AgendaView({ appointments, onSelectEvent }: AgendaViewProps) {
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  }, [appointments]);

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Appointment[]>();
    for (const apt of sortedAppointments) {
      const d = new Date(apt.fecha_hora);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const existing = groups.get(key) ?? [];
      existing.push(apt);
      groups.set(key, existing);
    }
    return groups;
  }, [sortedAppointments]);

  if (sortedAppointments.length === 0) {
    return (
      <div className="cal-empty">
        <div className="cal-empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="12" y1="14" x2="12" y2="14.01" strokeWidth="2" />
          </svg>
        </div>
        <div className="cal-empty-title">Sin citas programadas</div>
        <div className="cal-empty-text">No hay citas en este período. Creá una nueva cita o cambiá de vista.</div>
      </div>
    );
  }

  return (
    <div className="cal-scroll" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
      {Array.from(groupedByDate.entries()).map(([dateStr, apts]) => (
        <div key={dateStr} className="cal-agenda-group">
          <div className="cal-agenda-date">{formatDateHeader(dateStr)}</div>
          {apts.map((apt) => {
            const d = new Date(apt.fecha_hora);
            const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
            const doctorName = apt.doctor?.usuario
              ? `${apt.doctor.usuario.nombre} ${apt.doctor.usuario.apellido}`
              : 'Sin asignar';
            const specialty = apt.doctor?.especialidad?.nombre ?? '';

            return (
              <div
                key={apt.id_cita}
                className="cal-agenda-item"
                onClick={() => onSelectEvent?.(apt)}
              >
                <div className="cal-agenda-time">{time}</div>
                <div
                  className="cal-agenda-divider"
                  style={{ backgroundColor: getStatusBorderColor(apt.estado) }}
                />
                <div className="cal-agenda-info">
                  <div className="cal-agenda-patient">
                    {apt.paciente?.usuario?.nombre} {apt.paciente?.usuario?.apellido}
                  </div>
                  <div className="cal-agenda-doctor">
                    {doctorName}{specialty ? ` — ${specialty}` : ''}
                  </div>
                  {apt.motivo && <div className="cal-agenda-motivo">{apt.motivo}</div>}
                </div>
                <AppointmentStatusBadge status={apt.estado} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
