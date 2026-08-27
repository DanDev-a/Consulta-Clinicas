import { useState, useEffect } from 'react';
import { Modal, Select, DatePicker, Textarea, Button } from '../../../components/ui';
import TimeSlotPicker from './TimeSlotPicker';
import { toLocalISO, getBoliviaDateString, getBoliviaTimeString } from '../../../utils/date';
import type { AppointmentFormData } from '../types/appointment';

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

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
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Array<{ value: string; label: string }>>([]);
  const [patients, setPatients] = useState<Array<{ value: string; label: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialDateTime) {
        const dt = new Date(initialDateTime);
        const dateStr = getBoliviaDateString(dt);
        const timeStr = getBoliviaTimeString(dt);
        setSelectedDate(dateStr);
        setSelectedTime(timeStr);
        setForm(prev => ({ ...prev, fecha_hora: toLocalISO(dateStr, timeStr) }));
      } else {
        setSelectedDate('');
        setSelectedTime('');
        setForm({ id_paciente: '', id_doctor: '', fecha_hora: '', motivo: '' });
      }
      Promise.all([fetchDoctors(), fetchPatients()]).then(([docs, pacs]) => {
        setDoctors(docs.map(d => ({ value: d.id_doctor, label: `${d.nombre} ${d.apellido} — ${d.especialidad}` })));
        setPatients(pacs.map(p => ({ value: p.id_paciente, label: `${p.nombre} ${p.apellido}` })));
      }).catch(() => {});
    }
  }, [isOpen, initialDateTime]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedTime) {
      setForm(prev => ({ ...prev, fecha_hora: toLocalISO(date, selectedTime) }));
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      setForm(prev => ({ ...prev, fecha_hora: toLocalISO(selectedDate, time) }));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.id_paciente) errs.id_paciente = 'Seleccioná un paciente';
    if (!form.id_doctor) errs.id_doctor = 'Seleccioná un doctor';
    if (!selectedDate) errs.fecha = 'Seleccioná una fecha';
    if (!selectedTime) errs.hora = 'Seleccioná un horario';
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

  const availableSlots = TIME_SLOTS.map(time => ({
    time,
    label: time,
    available: true,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Cita" size="lg">
      <div className="space-y-4">
        <Select label="Paciente *" options={patients} value={form.id_paciente} onChange={e => update('id_paciente', e.target.value)} error={errors.id_paciente} placeholder="Seleccionar paciente" />
        <Select label="Doctor *" options={doctors} value={form.id_doctor} onChange={e => update('id_doctor', e.target.value)} error={errors.id_doctor} placeholder="Seleccionar doctor" />
        <DatePicker label="Fecha *" type="date" value={selectedDate} onChange={e => handleDateChange(e.target.value)} error={errors.fecha} />
        <TimeSlotPicker slots={availableSlots} selected={selectedTime} onSelect={handleTimeSelect} />
        {errors.hora && <span className="text-xs text-[var(--color-danger)]" role="alert">{errors.hora}</span>}
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
