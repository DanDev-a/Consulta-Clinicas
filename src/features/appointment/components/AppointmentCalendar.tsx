import { useState, useCallback, useMemo } from 'react';
import '../../../styles/calendar-custom.css';
import CalendarToolbar, { type CalendarView } from './CalendarToolbar';
import StatusLegend from './StatusLegend';
import WeekView from './WeekView';
import DayView from './DayView';
import MonthView from './MonthView';
import AgendaView from './AgendaView';
import AppointmentDetailPanel from './AppointmentDetailPanel';
import type { Appointment, AppointmentStatus } from '../types/appointment';
import { getBoliviaDateComponents } from '../../../utils/date';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  userRole?: string;
  onSelectEvent?: (appointment: Appointment) => void;
  onSelectSlot?: (date: Date) => void;
  onDrop?: (appointmentId: number, newDate: Date) => void;
  onStatusChange?: (id: number, status: AppointmentStatus) => void;
  onCancel?: (id: number) => void;
}

export default function AppointmentCalendar({
  appointments,
  userRole,
  onSelectEvent,
  onSelectSlot,
  onDrop,
  onStatusChange,
  onCancel,
}: AppointmentCalendarProps) {
  const [currentView, setCurrentView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      const offset = direction === 'next' ? 1 : -1;

      if (currentView === 'week') d.setDate(d.getDate() + offset * 7);
      else if (currentView === 'month') d.setMonth(d.getMonth() + offset);
      else if (currentView === 'day') d.setDate(d.getDate() + offset);
      else d.setDate(d.getDate() + offset * 7);

      return d;
    });
  }, [currentView]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleViewChange = useCallback((view: CalendarView) => {
    setCurrentView(view);
  }, []);

  const prevDisabled = useMemo(() => {
    const now = new Date();
    const nowComp = getBoliviaDateComponents(now);

    if (currentView === 'day') {
      const curComp = getBoliviaDateComponents(currentDate);
      return curComp.year === nowComp.year && curComp.month === nowComp.month && curComp.day === nowComp.day;
    }

    if (currentView === 'week') {
      const dayOfWeek = getBoliviaDateComponents(currentDate).dayOfWeek;
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() + diff);
      const sowComp = getBoliviaDateComponents(startOfWeek);
      return sowComp.year === nowComp.year && sowComp.month === nowComp.month && sowComp.day === nowComp.day;
    }

    if (currentView === 'month') {
      const curComp = getBoliviaDateComponents(currentDate);
      return curComp.year === nowComp.year && curComp.month === nowComp.month;
    }

    return false;
  }, [currentDate, currentView]);

  const handleSelectEvent = useCallback((apt: Appointment) => {
    setSelectedAppointment(apt);
    setDetailOpen(true);
    onSelectEvent?.(apt);
  }, [onSelectEvent]);

  const handleSelectSlot = useCallback((date: Date) => {
    onSelectSlot?.(date);
  }, [onSelectSlot]);

  const handleDrop = useCallback((appointmentId: number, newDate: Date) => {
    onDrop?.(appointmentId, newDate);
  }, [onDrop]);

  return (
    <div className="custom-calendar">
      <CalendarToolbar
        currentDate={currentDate}
        currentView={currentView}
        onNavigate={handleNavigate}
        onToday={handleToday}
        onViewChange={handleViewChange}
        prevDisabled={prevDisabled}
      />

      {currentView !== 'agenda' && <StatusLegend />}

      {currentView === 'week' && (
        <WeekView
          currentDate={currentDate}
          appointments={appointments}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onDrop={handleDrop}
        />
      )}

      {currentView === 'day' && (
        <DayView
          currentDate={currentDate}
          appointments={appointments}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onDrop={handleDrop}
        />
      )}

      {currentView === 'month' && (
        <MonthView
          currentDate={currentDate}
          appointments={appointments}
          onSelectEvent={handleSelectEvent}
          onSelectDay={(day) => {
            setCurrentDate(day);
            setCurrentView('day');
          }}
        />
      )}

      {currentView === 'agenda' && (
        <AgendaView
          appointments={appointments}
          onSelectEvent={handleSelectEvent}
        />
      )}

      <AppointmentDetailPanel
        appointment={selectedAppointment}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        userRole={userRole}
        onStatusChange={onStatusChange}
        onCancel={onCancel}
      />
    </div>
  );
}
