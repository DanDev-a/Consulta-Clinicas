import { Select, DatePicker } from '../../../components/ui';
import type { AppointmentFilter } from '../types/appointment';

interface AppointmentFiltersProps {
  filters: AppointmentFilter;
  onChange: (filters: AppointmentFilter) => void;
  userRole: string | undefined;
}

const estadoOptions = [
  { value: '', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'ATENDIDA', label: 'Atendida' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

export default function AppointmentFilters({ filters, onChange, userRole }: AppointmentFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        label="Estado"
        options={estadoOptions}
        value={filters.estado}
        onChange={e => onChange({ ...filters, estado: e.target.value })}
      />
      <DatePicker
        label="Desde"
        value={filters.fecha_desde}
        onChange={e => onChange({ ...filters, fecha_desde: e.target.value })}
      />
      <DatePicker
        label="Hasta"
        value={filters.fecha_hasta}
        onChange={e => onChange({ ...filters, fecha_hasta: e.target.value })}
      />
      {userRole !== 'DOCTOR' && userRole !== 'PACIENTE' && (
        <div className="flex items-end">
          <button
            onClick={() => onChange({ search: '', estado: '', id_doctor: '', fecha_desde: '', fecha_hasta: '' })}
            className="text-sm text-[var(--color-accent)] hover:underline pb-2 cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
