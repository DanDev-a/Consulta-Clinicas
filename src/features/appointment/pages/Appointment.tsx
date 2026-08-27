import { useState, useCallback } from 'react';
import { PageHeader, Button, Spinner, Alert } from '../../../components/ui';
import { RiAddLine, RiListCheck, RiCalendarEventLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import AppointmentTable from '../components/AppointmentTable';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentCalendar from '../components/AppointmentCalendar';
import AppointmentFilters from '../components/AppointmentFilters';
import BookingWizard from '../components/BookingWizard';
import { useAppointments } from '../hooks/useAppointments';
import type { AppointmentStatus } from '../types/appointment';

interface AppointmentPageProps {
  userRole: string | undefined;
  userId: string | undefined;
}

export default function Appointment({ userRole, userId }: AppointmentPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [initialDateTime, setInitialDateTime] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>(canViewCalendar(userRole) ? 'calendar' : 'list');
  const {
    loading, error, appointments, total, page, PAGE_SIZE,
    setPage, filters, setFilters,
    fetchAppointments, createAppointment, updateAppointmentStatus, cancelAppointment, updateAppointmentTime,
    fetchDoctors, fetchAllPatients,
  } = useAppointments(userRole, userId);

  const isAdmin = userRole === 'ADMIN';
  const isRecepcionista = userRole === 'RECEPCIONISTA';
  const isPaciente = userRole === 'PACIENTE';
  const canCreate = isAdmin || isRecepcionista;
  const showCalendar = canViewCalendar(userRole);

  const handleStatusChange = async (id: number, status: AppointmentStatus) => {
    const ok = await updateAppointmentStatus(id, status);
    if (ok) toast.success('Estado actualizado');
    else toast.error('Error al actualizar');
  };

  const handleCancel = async (id: number) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    const ok = await cancelAppointment(id);
    if (ok) toast.success('Cita cancelada');
    else toast.error('Error al cancelar');
  };

  const handleSlotClick = useCallback((date: Date) => {
    if (!canCreate) return;
    setInitialDateTime(date.toISOString().slice(0, 16));
    setShowForm(true);
  }, [canCreate]);

  const handleDragDrop = useCallback(async (appointmentId: number, newDate: Date) => {
    const ok = await updateAppointmentTime(appointmentId, newDate);
    if (ok) {
      const dateStr = newDate.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' });
      const timeStr = newDate.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
      toast.success(`Cita reprogramada para ${dateStr} ${timeStr}`, { icon: '📅' });
    } else {
      toast.error('Error al reprogramar la cita');
    }
  }, [updateAppointmentTime]);

  const handleWizardBooked = () => {
    setShowWizard(false);
    fetchAppointments();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (showWizard && isPaciente && userId) {
    return (
      <div className="space-y-6">
        <BookingWizard
          userId={userId}
          onClose={() => setShowWizard(false)}
          onBooked={handleWizardBooked}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isPaciente ? 'Mis Citas' : 'Citas'}
        subtitle={`${total} cita(s)`}
        actions={
          isPaciente ? (
            <Button onClick={() => setShowWizard(true)}>
              <RiAddLine className="mr-1" />Solicitar Cita
            </Button>
          ) : canCreate ? (
            <Button onClick={() => { setInitialDateTime(undefined); setShowForm(true); }}>
              <RiAddLine className="mr-1" />Nueva Cita
            </Button>
          ) : undefined
        }
      />

      {!isPaciente && <AppointmentFilters filters={filters} onChange={setFilters} userRole={userRole} />}

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tab buttons */}
      <div role="tablist" className="flex gap-1 border-b border-[var(--color-border-light)]">
        <button
          role="tab"
          aria-selected={activeTab === 'list'}
          onClick={() => setActiveTab('list')}
          className={[
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer flex items-center gap-1.5',
            activeTab === 'list'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]',
          ].join(' ')}
        >
          <RiListCheck /> Lista
        </button>
        {showCalendar && (
          <button
            role="tab"
            aria-selected={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer flex items-center gap-1.5',
              activeTab === 'calendar'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]',
            ].join(' ')}
          >
            <RiCalendarEventLine /> Calendario
          </button>
        )}
      </div>

      {/* Lista — always mounted */}
      <div style={{ display: activeTab === 'list' ? 'block' : 'none' }}>
        {loading && appointments.length === 0 ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <AppointmentTable
            data={appointments}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            userRole={userRole}
            onStatusChange={handleStatusChange}
            onCancel={handleCancel}
          />
        )}
      </div>

      {/* Calendario custom */}
      {showCalendar && (
        <div style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>
          <AppointmentCalendar
            appointments={appointments}
            userRole={userRole}
            onSelectSlot={handleSlotClick}
            onDrop={handleDragDrop}
            onStatusChange={handleStatusChange}
            onCancel={handleCancel}
          />
        </div>
      )}

      <AppointmentForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setInitialDateTime(undefined); }}
        onSubmit={createAppointment}
        fetchDoctors={fetchDoctors}
        fetchPatients={fetchAllPatients}
        initialDateTime={initialDateTime}
      />
    </div>
  );
}

function canViewCalendar(userRole: string | undefined): boolean {
  return userRole !== 'PACIENTE';
}
