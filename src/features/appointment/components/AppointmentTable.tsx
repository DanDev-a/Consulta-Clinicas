import { DataTable, Pagination } from '../../../components/ui';
import AppointmentStatusBadge from './AppointmentStatusBadge';
import type { Appointment } from '../types/appointment';

interface AppointmentTableProps {
  data: Appointment[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  userRole: string | undefined;
  onStatusChange?: (id: number, status: Appointment['estado']) => void;
  onCancel?: (id: number) => void;
}

export default function AppointmentTable({ data, loading, page, totalPages, onPageChange, userRole, onStatusChange, onCancel }: AppointmentTableProps) {
  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DataTable
      data={data as unknown as Record<string, unknown>[]}
      keyField="id_cita"
      loading={loading}
      emptyTitle="No hay citas"
      emptyDescription="No se encontraron citas con los filtros aplicados."
      pagination={<Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />}
    >
      <DataTable.Column header="Paciente">
        {(row) => {
          const apt = row as Appointment;
          return <span className="font-medium">{apt.paciente?.usuario?.nombre} {apt.paciente?.usuario?.apellido}</span>;
        }}
      </DataTable.Column>
      <DataTable.Column header="Doctor">
        {(row) => {
          const apt = row as Appointment;
          return (
            <div>
              <span className="font-medium">{apt.doctor?.usuario?.nombre} {apt.doctor?.usuario?.apellido}</span>
              {apt.doctor?.especialidad && <span className="text-xs text-[var(--color-text-muted)] block">{apt.doctor.especialidad.nombre}</span>}
            </div>
          );
        }}
      </DataTable.Column>
      <DataTable.Column header="Fecha y Hora" sortKey="fecha_hora" align="center">
        {(row) => <span className="text-sm">{formatDateTime((row as Appointment).fecha_hora)}</span>}
      </DataTable.Column>
      <DataTable.Column header="Motivo">
        {(row) => <span className="text-sm text-[var(--color-text-muted)]">{(row as Appointment).motivo ?? '—'}</span>}
      </DataTable.Column>
      <DataTable.Column header="Estado" align="center">
        {(row) => <AppointmentStatusBadge status={(row as Appointment).estado} />}
      </DataTable.Column>
      <DataTable.Column header="Acciones">
        {(row) => {
          const apt = row as Appointment;
          const canConfirm = (userRole === 'ADMIN' || userRole === 'RECEPCIONISTA' || userRole === 'DOCTOR') && apt.estado === 'PENDIENTE';
          const canAttend = (userRole === 'ADMIN' || userRole === 'DOCTOR') && apt.estado === 'CONFIRMADA';
          const canCancel = (userRole === 'ADMIN' || userRole === 'RECEPCIONISTA' || userRole === 'DOCTOR') && apt.estado !== 'CANCELADA' && apt.estado !== 'ATENDIDA';
          const canPatientCancel = userRole === 'PACIENTE' && apt.estado === 'PENDIENTE';

          return (
            <div className="flex gap-1 text-xs">
              {canConfirm && (
                <button onClick={() => onStatusChange?.(apt.id_cita, 'CONFIRMADA')} className="text-[var(--color-info)] hover:underline cursor-pointer">
                  Confirmar
                </button>
              )}
              {canAttend && (
                <button onClick={() => onStatusChange?.(apt.id_cita, 'ATENDIDA')} className="text-[var(--color-success)] hover:underline cursor-pointer">
                  Atender
                </button>
              )}
              {(canCancel || canPatientCancel) && (
                <button onClick={() => onCancel?.(apt.id_cita)} className="text-[var(--color-danger)] hover:underline cursor-pointer">
                  Cancelar
                </button>
              )}
            </div>
          );
        }}
      </DataTable.Column>
    </DataTable>
  );
}
