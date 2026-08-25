import { useMemo, useState, useEffect, useCallback } from 'react';
import type { Appointment } from '../types/appointment';

interface DayViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onSelectEvent?: (appointment: Appointment) => void;
  onSelectSlot?: (date: Date) => void;
  onDrop?: (appointmentId: number, newDate: Date) => void;
}

const SLOT_HEIGHT = 48;
const START_HOUR = 8;
const END_HOUR = 20;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function getEventPosition(fechaHora: string): { top: number; height: number } {
  const d = new Date(fechaHora);
  const hours = d.getHours() + d.getMinutes() / 60;
  const top = (hours - START_HOUR) * SLOT_HEIGHT;
  return { top: Math.max(0, top), height: 30 };
}

export default function DayView({ currentDate, appointments, onSelectEvent, onSelectSlot, onDrop }: DayViewProps) {
  const [now, setNow] = useState(new Date());
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const d = new Date(apt.fecha_hora);
      return (
        d.getFullYear() === currentDate.getFullYear() &&
        d.getMonth() === currentDate.getMonth() &&
        d.getDate() === currentDate.getDate()
      );
    }).sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  }, [appointments, currentDate]);

  const currentTimePos = useMemo(() => {
    const h = now.getHours() + now.getMinutes() / 60;
    if (h < START_HOUR || h > END_HOUR) return null;
    return (h - START_HOUR) * SLOT_HEIGHT;
  }, [now]);

  const isToday = useMemo(() => {
    const today = new Date();
    return (
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getDate() === today.getDate()
    );
  }, [currentDate]);

  const handleDragStart = useCallback((e: React.DragEvent, aptId: number) => {
    e.dataTransfer.setData('text/plain', String(aptId));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(aptId);
    setTimeout(() => (e.target as HTMLElement).classList.add('dragging'), 0);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).classList.remove('dragging');
    setDraggingId(null);
    setDragOverHour(null);
  }, []);

  const handleSlotDrop = useCallback((e: React.DragEvent, hour: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverHour(null);
    const aptId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!aptId || !onDrop) return;
    const newDate = new Date(currentDate);
    newDate.setHours(hour, 0, 0, 0);
    onDrop(aptId, newDate);
  }, [onDrop, currentDate]);

  const handleSlotClick = useCallback((hour: number) => {
    if (!onSelectSlot) return;
    const d = new Date(currentDate);
    d.setHours(hour, 0, 0, 0);
    onSelectSlot(d);
  }, [onSelectSlot, currentDate]);

  return (
    <div className="cal-time-grid cal-time-grid-day cal-scroll" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
      {/* Day header */}
      <div className="col-span-full grid grid-cols-[56px_1fr]" style={{ position: 'sticky', top: 0, zIndex: 15 }}>
        <div className="cal-day-header" style={{ borderRight: '1px solid var(--color-border-light)' }} />
        <div className={`cal-day-header ${isToday ? 'cal-day-header-today' : ''}`}>
          <div className="cal-day-header-name">
            {currentDate.toLocaleDateString('es-AR', { weekday: 'long' })}
          </div>
          <div className="cal-day-header-number">{currentDate.getDate()}</div>
        </div>
      </div>

      {/* Time grid */}
      {HOURS.map((hour) => {
        const hourEvents = dayAppointments.filter((apt) => new Date(apt.fecha_hora).getHours() === hour);
        const isDragOver = dragOverHour === hour;

        return (
          <div key={hour} className="col-span-full grid grid-cols-[56px_1fr]">
            <div className="cal-time-label">
              {String(hour).padStart(2, '0')}:00
            </div>

            <div
              className={`cal-slot ${isDragOver ? 'drag-over' : ''} ${isToday ? 'cal-slot-today' : ''}`}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverHour(hour); }}
              onDrop={(e) => handleSlotDrop(e, hour)}
              onDragLeave={() => setDragOverHour(null)}
              onClick={() => handleSlotClick(hour)}
            >
              <div className="cal-slot-half" />

              {hourEvents.map((apt) => {
                const pos = getEventPosition(apt.fecha_hora);
                const doctorName = apt.doctor?.usuario
                  ? `${apt.doctor.usuario.nombre} ${apt.doctor.usuario.apellido}`
                  : '';
                const specialty = apt.doctor?.especialidad?.nombre ?? '';

                return (
                  <div
                    key={apt.id_cita}
                    className={`cal-event cal-event-${apt.estado} ${draggingId === apt.id_cita ? 'dragging' : ''}`}
                    style={{ top: `${pos.top % SLOT_HEIGHT}px`, height: `${pos.height}px` }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, apt.id_cita)}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent?.(apt);
                    }}
                  >
                    <div className="cal-event-title">
                      {apt.paciente?.usuario?.nombre} {apt.paciente?.usuario?.apellido}
                    </div>
                    <div className="cal-event-time">{formatTime(apt.fecha_hora)}</div>
                    {specialty && <div className="cal-event-specialty">{doctorName} — {specialty}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Current time indicator */}
      {isToday && currentTimePos !== null && (
        <div className="cal-current-time" style={{ top: `${44 + currentTimePos}px` }} />
      )}
    </div>
  );
}
