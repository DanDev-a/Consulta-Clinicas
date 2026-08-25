import { Select } from '../../../components/ui';
import type { PatientFilter } from '../types/patient';

interface PatientFiltersProps {
  filters: PatientFilter;
  onChange: (filters: PatientFilter) => void;
}

const sexoOptions = [
  { value: '', label: 'Todos' },
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
];

const sangreOptions = [
  { value: '', label: 'Todos' },
  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
];

export default function PatientFilters({ filters, onChange }: PatientFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        label="Sexo"
        options={sexoOptions}
        value={filters.sexo}
        onChange={e => onChange({ ...filters, sexo: e.target.value })}
      />
      <Select
        label="Grupo Sanguíneo"
        options={sangreOptions}
        value={filters.grupo_sanguineo}
        onChange={e => onChange({ ...filters, grupo_sanguineo: e.target.value })}
      />
    </div>
  );
}
