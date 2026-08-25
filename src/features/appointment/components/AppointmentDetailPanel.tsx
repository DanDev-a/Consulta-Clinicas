import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { RiCloseLine, RiUserLine, RiStethoscopeLine, RiTimeLine, RiFileTextLine } from 'react-icons/ri';
import AppointmentStatusBadge from './AppointmentStatusBadge';
import type { Appointment, AppointmentStatus } from '../types/appointment';

interface AppointmentDetailPanelProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: string | undefined;
  onStatusChange?: (id: number, status: AppointmentStatus) => void;
  onCancel?: (id: number) => void;
}

const statusActions: Record<string, { label: string; status: AppointmentStatus; className: string }[]> = {
  PENDIENTE: [
    { label: 'Confirmar', status: 'CONFIRMADA', className: 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]' },
    { label: 'Cancelar', status: 'CANCELADA', className: 'bg-transparent border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]' },
  ],
  CONFIRMADA: [
    { label: 'Atender', status: 'ATENDIDA', className: 'bg-[var(--color-success)] text-[var(--color-text-inverse)] hover:opacity-90' },
    { label: 'Cancelar', status: 'CANCELADA', className: 'bg-transparent border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]' },
  ],
};

export default function AppointmentDetailPanel({
  appointment,
  isOpen,
  onClose,
  userRole,
  onStatusChange,
  onCancel,
}: AppointmentDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !appointment) return null;

  const fecha = new Date(appointment.fecha_hora);
  const timeStr = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const canChangeStatus = userRole === 'ADMIN' || userRole === 'DOCTOR' || userRole === 'RECEPCIONISTA';
  const actions = canChangeStatus ? (statusActions[appointment.estado] ?? []) : [];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div
        ref={panelRef}
        className="relative w-full max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl overflow-y-auto animate-slide-in-right"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-light)]">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">Detalle de Cita</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] transition-colors cursor-pointer"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center">
              <RiUserLine size={20} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Paciente</p>
              <p className="font-medium text-[var(--color-text)]">
                {appointment.paciente?.usuario?.nombre} {appointment.paciente?.usuario?.apellido}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-success-soft)] flex items-center justify-center">
              <RiStethoscopeLine size={20} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Doctor</p>
              <p className="font-medium text-[var(--color-text)]">
                {appointment.doctor?.usuario?.nombre} {appointment.doctor?.usuario?.apellido}
              </p>
              {appointment.doctor?.especialidad && (
                <p className="text-xs text-[var(--color-text-muted)]">{appointment.doctor.especialidad.nombre}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-warning-soft)] flex items-center justify-center">
              <RiTimeLine size={20} className="text-[var(--color-warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Fecha y Hora</p>
              <p className="font-medium text-[var(--color-text)]">{dateStr}</p>
              <p className="text-sm text-[var(--color-text)]">{timeStr}hs</p>
            </div>
          </div>

          {appointment.motivo && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface-alt)] flex items-center justify-center">
                <RiFileTextLine size={20} className="text-[var(--color-text-muted)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Motivo</p>
                <p className="text-[var(--color-text)]">{appointment.motivo}</p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <p className="text-sm text-[var(--color-text-muted)] mb-2">Estado</p>
            <AppointmentStatusBadge status={appointment.estado} />
          </div>

          {actions.length > 0 && (
            <div className="pt-3 border-t border-[var(--color-border-light)] space-y-2">
              <p className="text-sm text-[var(--color-text-muted)] mb-3">Acciones</p>
              <div className="flex gap-2">
                {actions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => {
                      if (action.status === 'CANCELADA') {
                        onCancel?.(appointment.id_cita);
                      } else {
                        onStatusChange?.(appointment.id_cita, action.status);
                      }
                      onClose();
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${action.className}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
