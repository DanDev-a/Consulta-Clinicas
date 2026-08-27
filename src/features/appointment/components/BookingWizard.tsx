import { useState, useEffect } from 'react';
import { Button, DatePicker, Textarea, Alert } from '../../../components/ui';
import { RiArrowLeftLine, RiCheckLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useBookingWizard } from '../hooks/useBookingWizard';
import TimeSlotPicker from './TimeSlotPicker';

interface BookingWizardProps {
  userId: string;
  onClose: () => void;
  onBooked: () => void;
}

export default function BookingWizard({ userId, onClose, onBooked }: BookingWizardProps) {
  const {
    state,
    especialidades,
    doctors,
    slots,
    loading,
    loadingSlots,
    error,
    selectEspecialidad,
    selectDoctor,
    selectDate,
    selectTime,
    setMotivo,
    goBack,
    submitBooking,
    reset,
  } = useBookingWizard(userId);

  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (state.date) setSelectedDate(state.date);
  }, [state.date]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    selectDate(date);
  };

  const handleSubmit = async () => {
    const ok = await submitBooking();
    if (ok) {
      toast.success('Cita solicitada exitosamente');
      reset();
      onBooked();
    }
  };

  const steps = [
    { num: 1, label: 'Especialidad' },
    { num: 2, label: 'Doctor' },
    { num: 3, label: 'Fecha y Hora' },
    { num: 4, label: 'Confirmar' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <RiArrowLeftLine />
        </Button>
        <h2 className="text-xl font-semibold text-[var(--color-text)]">Solicitar Nueva Cita</h2>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              state.step >= s.num
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]',
            ].join(' ')}>
              {state.step > s.num ? <RiCheckLine /> : s.num}
            </div>
            <span className={[
              'text-sm hidden sm:inline',
              state.step >= s.num ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]',
            ].join(' ')}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-[var(--color-border-light)] hidden sm:block" />}
          </div>
        ))}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="min-h-[300px]">
        {state.step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--color-text)]">Especialidad</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {especialidades.map(esp => (
                <button
                  key={esp.id_especialidad}
                  onClick={() => selectEspecialidad(esp)}
                  className={[
                    'p-4 rounded-xl border text-left transition-all',
                    'border-[var(--color-border-light)] bg-[var(--color-surface)]',
                    'hover:border-[var(--color-accent)] hover:shadow-md',
                  ].join(' ')}
                >
                  <div className="font-medium text-[var(--color-text)]">{esp.nombre}</div>
                  {esp.descripcion && (
                    <div className="text-sm text-[var(--color-text-muted)] mt-1">{esp.descripcion}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--color-text)]">
              Doctor — {state.especialidad?.nombre}
            </h3>
            {doctors.length === 0 ? (
              <Alert variant="info">No hay doctores disponibles para esta especialidad</Alert>
            ) : (
              <div className="space-y-3">
                {doctors.map(doc => (
                  <button
                    key={doc.id_doctor}
                    onClick={() => selectDoctor(doc)}
                    className={[
                      'w-full p-4 rounded-xl border text-left transition-all',
                      'border-[var(--color-border-light)] bg-[var(--color-surface)]',
                      'hover:border-[var(--color-accent)] hover:shadow-md',
                    ].join(' ')}
                  >
                    <div className="font-medium text-[var(--color-text)]">
                      Dr. {doc.nombre} {doc.apellido}
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)]">{doc.especialidad}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {state.step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--color-text)]">
              Dr. {state.doctor?.nombre} {state.doctor?.apellido}
            </h3>
            <DatePicker
              label="Fecha *"
              type="date"
              value={selectedDate}
              onChange={e => handleDateChange(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
            />
            {selectedDate && (
              <TimeSlotPicker
                slots={slots}
                selected={state.time}
                onSelect={selectTime}
                loading={loadingSlots}
              />
            )}
          </div>
        )}

        {state.step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--color-text)]">Confirmar Cita</h3>
            <div className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Especialidad</span>
                <span className="font-medium text-[var(--color-text)]">{state.especialidad?.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Doctor</span>
                <span className="font-medium text-[var(--color-text)]">Dr. {state.doctor?.nombre} {state.doctor?.apellido}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Fecha</span>
                <span className="font-medium text-[var(--color-text)]">
                  {new Date(state.date + 'T12:00:00').toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Hora</span>
                <span className="font-medium text-[var(--color-text)]">{state.time}</span>
              </div>
            </div>
            <Textarea
              label="Motivo de la consulta"
              value={state.motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Describa brevemente el motivo de su consulta..."
            />
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-[var(--color-border-light)]">
        <Button variant="ghost" onClick={state.step === 1 ? onClose : goBack}>
          {state.step === 1 ? 'Cancelar' : 'Anterior'}
        </Button>
        {state.step === 4 && (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Solicitando...' : 'Solicitar Cita'}
          </Button>
        )}
      </div>
    </div>
  );
}
