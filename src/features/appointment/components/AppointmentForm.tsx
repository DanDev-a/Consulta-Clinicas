import { useState, useEffect } from 'react';
import { Modal, Select, DatePicker, Textarea, Button } from '../../../components/ui';
import type { AppointmentFormData } from '../types/appointment';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<boolean | number | null>;
  fetchDoctors: () => Promise<Array<{ id_doctor: string; nombre: string; apellido: string; especialidad: string }>>;
  fetchPatients: () => Promise<Array<{ id_paciente: string; nombre: string; apellido: string }>>;
  initialDateTime?: string;
}

export default function AppointmentForm({ isOpen, onClose, onSubmit, fetchDoctors, fetchPatients, initialDateTime }: AppointmentFormProps) {
  const [form, setForm] = useState<AppointmentFormData>({ id_paciente: '', id_doctor: '', fecha_hora: '', motivo: '' });
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Array<{ value: string; label: string }>>([]);
  const [patients, setPatients] = useState<Array<{ value: string; label: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialDateTime) {
        setForm(prev => ({ ...prev, fecha_hora: initialDateTime }));
      } else {
        setForm({ id_paciente: '', id_doctor: '', fecha_hora: '', motivo: '' });
      }
      Promise.all([fetchDoctors(), fetchPatients()]).then(([docs, pacs]) => {
        setDoctors(docs.map(d => ({ value: d.id_doctor, label: `${d.nombre} ${d.apellido} — ${d.especialidad}` })));
        setPatients(pacs.map(p => ({ value: p.id_paciente, label: `${p.nombre} ${p.apellido}` })));
      });
    }
  }, [isOpen, initialDateTime]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.id_paciente) errs.id_paciente = 'Seleccioná un paciente';
    if (!form.id_doctor) errs.id_doctor = 'Seleccioná un doctor';
    if (!form.fecha_hora) errs.fecha_hora = 'Seleccioná fecha y hora';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const ok = await onSubmit(form);
    setLoading(false);
    if (ok) { setForm({ id_paciente: '', id_doctor: '', fecha_hora: '', motivo: '' }); onClose(); }
  };

  const update = (field: keyof AppointmentFormData, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Cita" size="lg">
      <div className="space-y-4">
        <Select label="Paciente *" options={patients} value={form.id_paciente} onChange={e => update('id_paciente', e.target.value)} error={errors.id_paciente} placeholder="Seleccionar paciente" />
        <Select label="Doctor *" options={doctors} value={form.id_doctor} onChange={e => update('id_doctor', e.target.value)} error={errors.id_doctor} placeholder="Seleccionar doctor" />
        <DatePicker label="Fecha y Hora *" value={form.fecha_hora} onChange={e => update('fecha_hora', e.target.value)} error={errors.fecha_hora} />
        <Textarea label="Motivo de la consulta" value={form.motivo} onChange={e => update('motivo', e.target.value)} />

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border-light)]">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando...' : 'Crear Cita'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
