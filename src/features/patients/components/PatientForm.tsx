import { useState, useEffect } from 'react';
import { Modal, Input, Select, DatePicker, Button } from '../../../components/ui';
import type { PatientFormData } from '../types/patient';

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<boolean>;
  initialData?: PatientFormData;
  mode: 'create' | 'edit';
}

const sexoOptions = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
];

const sangreOptions = [
  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
];

export default function PatientForm({ isOpen, onClose, onSubmit, initialData, mode }: PatientFormProps) {
  const [form, setForm] = useState<PatientFormData>({
    ci: '', nombre: '', apellido: '', email: '', fecha_nacimiento: '',
    sexo: 'M', telefono: '', direccion: '', ciudad: '', grupo_sanguineo: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ ci: '', nombre: '', apellido: '', email: '', fecha_nacimiento: '', sexo: 'M', telefono: '', direccion: '', ciudad: '', grupo_sanguineo: '' });
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.ci.trim()) errs.ci = 'La CI es requerida';
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (!form.apellido.trim()) errs.apellido = 'El apellido es requerido';
    if (!form.email.trim()) errs.email = 'El email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    if (!form.fecha_nacimiento) errs.fecha_nacimiento = 'La fecha es requerida';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const ok = await onSubmit(form);
    setLoading(false);
    if (ok) onClose();
  };

  const update = (field: keyof PatientFormData, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Nuevo Paciente' : 'Editar Paciente'} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="CI *" value={form.ci} onChange={e => update('ci', e.target.value)} error={errors.ci} disabled={mode === 'edit'} />
          <DatePicker label="Fecha de Nacimiento *" value={form.fecha_nacimiento} onChange={e => update('fecha_nacimiento', e.target.value)} error={errors.fecha_nacimiento} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nombre *" value={form.nombre} onChange={e => update('nombre', e.target.value)} error={errors.nombre} />
          <Input label="Apellido *" value={form.apellido} onChange={e => update('apellido', e.target.value)} error={errors.apellido} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email *" type="email" value={form.email} onChange={e => update('email', e.target.value)} error={errors.email} disabled={mode === 'edit'} />
          <Select label="Sexo" options={sexoOptions} value={form.sexo} onChange={e => update('sexo', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Teléfono" value={form.telefono} onChange={e => update('telefono', e.target.value)} />
          <Input label="Ciudad" value={form.ciudad} onChange={e => update('ciudad', e.target.value)} />
        </div>
        <Input label="Dirección" value={form.direccion} onChange={e => update('direccion', e.target.value)} />
        <Select label="Grupo Sanguíneo" options={sangreOptions} value={form.grupo_sanguineo} onChange={e => update('grupo_sanguineo', e.target.value)} />

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border-light)]">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : mode === 'create' ? 'Crear Paciente' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
