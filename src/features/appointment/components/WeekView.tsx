import { useMemo, useState, useEffect, useCallback } from 'react';
import { formatTimeBolivia, getBoliviaDateComponents, getBoliviaHours, getBoliviaMinutes } from '../../../utils/date';
import type { Appointment } from '../types/appointment';

interface WeekViewProps {
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

const shortDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(startOfWeek: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function getEventPosition(fechaHora: string): { top: number; height: number } {
  const d = new Date(fechaHora);
  const hours = getBoliviaHours(d) + getBoliviaMinutes(d) / 60;
  const top = (hours - START_HOUR) * SLOT_HEIGHT;
  return { top: Math.max(0, top), height: 30 };
}

function formatTime(iso: string): string {
  return formatTimeBolivia(iso);
}

export default function WeekView({ currentDate, appointments, onSelectEvent, onSelectSlot, onDrop }: WeekViewProps) {
  const [now, setNow] = useState(new Date());
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const startOfWeek = useMemo(() => getStartOfWeek(currentDate), [currentDate]);
  const weekDays = useMemo(() => getWeekDays(startOfWeek), [startOfWeek]);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, Appointment[]>();
    for (const day of weekDays) {
      map.set(day.getDate(), []);
    }
    for (const apt of appointments) {
      const aptDate = new Date(apt.fecha_hora);
      const aptComp = getBoliviaDateComponents(aptDate);
      const startComp = getBoliviaDateComponents(startOfWeek);
      const endComp = getBoliviaDateComponents(new Date(startOfWeek.getTime() + 7 * 86400000));
      const aptTime = aptComp.year * 10000 + aptComp.month * 100 + aptComp.day;
      const startTime = startComp.year * 10000 + startComp.month * 100 + startComp.day;
      const endTime = endComp.year * 10000 + endComp.month * 100 + endComp.day;
      if (aptTime >= startTime && aptTime < endTime) {
        const day = aptComp.day;
        const existing = map.get(day) ?? [];
        existing.push(apt);
        map.set(day, existing);
      }
    }
    return map;
  }, [appointments, weekDays, startOfWeek]);

  const currentTimePos = useMemo(() => {
    const h = now.getHours() + now.getMinutes() / 60;
    if (h < START_HOUR || h > END_HOUR) return null;
    return (h - START_HOUR) * SLOT_HEIGHT;
  }, [now]);

  const showCurrentTime = useMemo(() => {
    const today = new Date();
    return weekDays.some(d => isSameDay(d, today));
  }, [weekDays]);

  const handleDragStart = useCallback((e: React.DragEvent, aptId: number) => {
    e.dataTransfer.setData('text/plain', String(aptId));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(aptId);
    setTimeout(() => {
      (e.target as HTMLElement).classList.add('dragging');
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).classList.remove('dragging');
    setDraggingId(null);
    setDragOverSlot(null);
  }, []);

  const handleSlotDragOver = useCallback((e: React.DragEvent, dayDate: Date, hour: number) => {
    e.preventDefault();
    e.stopPropagation();
    const slotKey = `${dayDate.getDate()}-${hour}`;
    setDragOverSlot(slotKey);
  }, []);

  const handleSlotDrop = useCallback((e: React.DragEvent, dayDate: Date, hour: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);
    const aptId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!aptId || !onDrop) return;
    const newDate = new Date(dayDate);
    newDate.setHours(hour, 0, 0, 0);
    onDrop(aptId, newDate);
  }, [onDrop]);

  const handleSlotDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  const handleSlotClick = useCallback((dayDate: Date, hour: number) => {
    if (!onSelectSlot) return;
    const d = new Date(dayDate);
    d.setHours(hour, 0, 0, 0);
    onSelectSlot(d);
  }, [onSelectSlot]);

  return (
    <div className="cal-time-grid cal-time-grid-week cal-scroll" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
      {/* Day headers */}
      <div className="col-span-full grid grid-cols-[56px_repeat(7,1fr)]" style={{ position: 'sticky', top: 0, zIndex: 15 }}>
        <div className="cal-day-header" style={{ borderRight: '1px solid var(--color-border-light)' }} />
        {weekDays.map((day, i) => (
          <div
            key={i}
            className={`cal-day-header ${isToday(day) ? 'cal-day-header-today' : ''} ${i >= 5 ? 'cal-day-header-weekend' : ''}`}
          >
            <div className="cal-day-header-name">{shortDays[i]}</div>
            <div className="cal-day-header-number">{day.getDate()}</div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      {HOURS.map((hour) => (
        <div key={hour} className="col-span-full grid grid-cols-[56px_repeat(7,1fr)]">
          {/* Time label */}
          <div className="cal-time-label">
            {String(hour).padStart(2, '0')}:00
          </div>

          {/* Day cells */}
          {weekDays.map((day, dayIdx) => {
            const slotKey = `${day.getDate()}-${hour}`;
            const isDragOver = dragOverSlot === slotKey;
            const dayEvents = eventsByDay.get(day.getDate()) ?? [];
            const slotEvents = dayEvents.filter((apt) => {
              const d = new Date(apt.fecha_hora);
              return getBoliviaHours(d) === hour;
            });

            return (
              <div
                key={dayIdx}
                className={`cal-slot ${isDragOver ? 'drag-over' : ''} ${isToday(day) ? 'cal-slot-today' : ''}`}
                onDragOver={(e) => handleSlotDragOver(e, day, hour)}
                onDrop={(e) => handleSlotDrop(e, day, hour)}
                onDragLeave={handleSlotDragLeave}
                onClick={() => handleSlotClick(day, hour)}
              >
                <div className="cal-slot-half" />

                {/* Events */}
                {slotEvents.map((apt) => {
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
            );
          })}
        </div>
      ))}

      {/* Current time indicator */}
      {showCurrentTime && currentTimePos !== null && (
        <div
          className="cal-current-time"
          style={{ top: `${44 + currentTimePos}px` }}
        />
      )}
    </div>
  );
}
