import { useMemo, useState, useEffect, useCallback } from 'react';
import { formatTimeBolivia, getBoliviaDateComponents, getBoliviaHours, getBoliviaMinutes } from '../../../utils/date';
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
const SLOTS_PER_HOUR = 2;
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;

function formatTime(iso: string): string {
  return formatTimeBolivia(iso);
}

function getEventPosition(fechaHora: string): { top: number; height: number } {
  const d = new Date(fechaHora);
  const hours = getBoliviaHours(d);
  const minutes = getBoliviaMinutes(d);
  const slotIndex = (hours - START_HOUR) * SLOTS_PER_HOUR + (minutes >= 30 ? 1 : 0);
  const top = slotIndex * SLOT_HEIGHT;
  return { top: Math.max(0, top), height: SLOT_HEIGHT - 4 };
}

function getSlotHour(slotIndex: number): number {
  return START_HOUR + Math.floor(slotIndex / SLOTS_PER_HOUR);
}

function getSlotMinute(slotIndex: number): number {
  return (slotIndex % SLOTS_PER_HOUR) * SLOT_MINUTES;
}

export default function DayView({ currentDate, appointments, onSelectEvent, onSelectSlot, onDrop }: DayViewProps) {
  const [now, setNow] = useState(new Date());
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const d = new Date(apt.fecha_hora);
      const comp = getBoliviaDateComponents(d);
      const curComp = getBoliviaDateComponents(currentDate);
      return (
        comp.year === curComp.year &&
        comp.month === curComp.month &&
        comp.day === curComp.day
      );
    }).sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  }, [appointments, currentDate]);

  const currentTimePos = useMemo(() => {
    const hours = getBoliviaHours(now);
    const minutes = getBoliviaMinutes(now);
    if (hours < START_HOUR || hours >= END_HOUR) return null;
    const slotIndex = (hours - START_HOUR) * SLOTS_PER_HOUR + (minutes >= 30 ? 1 : 0);
    const partial = (minutes % 30) / 30;
    return slotIndex * SLOT_HEIGHT + partial * SLOT_HEIGHT;
  }, [now]);

  const isToday = useMemo(() => {
    const curComp = getBoliviaDateComponents(currentDate);
    const todayComp = getBoliviaDateComponents(now);
    return (
      curComp.year === todayComp.year &&
      curComp.month === todayComp.month &&
      curComp.day === todayComp.day
    );
  }, [currentDate, now]);

  const handleDragStart = useCallback((e: React.DragEvent, aptId: number) => {
    e.dataTransfer.setData('text/plain', String(aptId));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(aptId);
    setTimeout(() => (e.target as HTMLElement).classList.add('dragging'), 0);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).classList.remove('dragging');
    setDraggingId(null);
    setDragOverSlot(null);
  }, []);

  const handleSlotDrop = useCallback((e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);
    const aptId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!aptId || !onDrop) return;
    const hour = getSlotHour(slotIdx);
    const minute = getSlotMinute(slotIdx);
    const curComp = getBoliviaDateComponents(currentDate);
    const newDate = new Date(curComp.year, curComp.month - 1, curComp.day, hour, minute, 0, 0);
    onDrop(aptId, newDate);
  }, [onDrop, currentDate]);

  const handleSlotClick = useCallback((slotIdx: number) => {
    if (!onSelectSlot) return;
    const hour = getSlotHour(slotIdx);
    const minute = getSlotMinute(slotIdx);
    const curComp = getBoliviaDateComponents(currentDate);
    const d = new Date(curComp.year, curComp.month - 1, curComp.day, hour, minute, 0, 0);
    onSelectSlot(d);
  }, [onSelectSlot, currentDate]);

  const curComp = getBoliviaDateComponents(currentDate);

  return (
    <div className="cal-time-grid cal-time-grid-day cal-scroll" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
      {/* Day header */}
      <div className="col-span-full grid grid-cols-[56px_1fr]" style={{ position: 'sticky', top: 0, zIndex: 15 }}>
        <div className="cal-day-header" style={{ borderRight: '1px solid var(--color-border-light)' }} />
        <div className={`cal-day-header ${isToday ? 'cal-day-header-today' : ''}`}>
          <div className="cal-day-header-name">
            {currentDate.toLocaleDateString('es-BO', { weekday: 'long' })}
          </div>
          <div className="cal-day-header-number">{curComp.day}</div>
        </div>
      </div>

      {/* Time grid */}
      {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
        const hour = getSlotHour(slotIdx);
        const minute = getSlotMinute(slotIdx);
        const isHourStart = minute === 0;
        const isDragOver = dragOverSlot === slotIdx;

        const hourEvents = dayAppointments.filter((apt) => {
          const d = new Date(apt.fecha_hora);
          const ah = getBoliviaHours(d);
          const am = getBoliviaMinutes(d);
          return ah === hour && (minute === 0 ? am < 30 : am >= 30);
        });

        return (
          <div key={slotIdx} className="col-span-full grid grid-cols-[56px_1fr]">
            <div className="cal-time-label">
              {isHourStart ? `${String(hour).padStart(2, '0')}:00` : ''}
            </div>

            <div
              className={`cal-slot ${isDragOver ? 'drag-over' : ''} ${isToday ? 'cal-slot-today' : ''} ${minute === 30 ? 'cal-slot-half-hour' : ''}`}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverSlot(slotIdx); }}
              onDrop={(e) => handleSlotDrop(e, slotIdx)}
              onDragLeave={() => setDragOverSlot(null)}
              onClick={() => handleSlotClick(slotIdx)}
            >
              {minute === 0 && <div className="cal-slot-half" />}

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
