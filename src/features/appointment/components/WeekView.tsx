import { useMemo, useState, useEffect, useCallback } from 'react';
import { formatTimeBolivia, getBoliviaDateComponents, getBoliviaHours, getBoliviaMinutes, getBoliviaDateString } from '../../../utils/date';
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
const SLOTS_PER_HOUR = 2;
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;

const shortDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getStartOfWeek(date: Date): Date {
  const comp = getBoliviaDateComponents(date);
  const dayOfWeek = comp.dayOfWeek;
  const diff = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const d = new Date(date);
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

function getEventPosition(fechaHora: string): { top: number; height: number } {
  const d = new Date(fechaHora);
  const hours = getBoliviaHours(d);
  const minutes = getBoliviaMinutes(d);
  const slotIndex = (hours - START_HOUR) * SLOTS_PER_HOUR + (minutes >= 30 ? 1 : 0);
  const top = slotIndex * SLOT_HEIGHT;
  return { top: Math.max(0, top), height: SLOT_HEIGHT - 4 };
}

function formatTime(iso: string): string {
  return formatTimeBolivia(iso);
}

function getSlotHour(slotIndex: number): number {
  return START_HOUR + Math.floor(slotIndex / SLOTS_PER_HOUR);
}

function getSlotMinute(slotIndex: number): number {
  return (slotIndex % SLOTS_PER_HOUR) * SLOT_MINUTES;
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
    const map = new Map<string, Appointment[]>();
    for (const day of weekDays) {
      map.set(getBoliviaDateString(day), []);
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
        const dayKey = getBoliviaDateString(aptDate);
        const existing = map.get(dayKey) ?? [];
        existing.push(apt);
        map.set(dayKey, existing);
      }
    }
    return map;
  }, [appointments, weekDays, startOfWeek]);

  const currentTimePos = useMemo(() => {
    const hours = getBoliviaHours(now);
    const minutes = getBoliviaMinutes(now);
    if (hours < START_HOUR || hours >= END_HOUR) return null;
    const slotIndex = (hours - START_HOUR) * SLOTS_PER_HOUR + (minutes >= 30 ? 1 : 0);
    const partial = (minutes % 30) / 30;
    return slotIndex * SLOT_HEIGHT + partial * SLOT_HEIGHT;
  }, [now]);

  const showCurrentTime = useMemo(() => {
    return weekDays.some(d => {
      const dc = getBoliviaDateComponents(d);
      const nc = getBoliviaDateComponents(now);
      return dc.year === nc.year && dc.month === nc.month && dc.day === nc.day;
    });
  }, [weekDays, now]);

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

  const handleSlotDragOver = useCallback((e: React.DragEvent, dayDate: Date, slotIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const slotKey = `${getBoliviaDateString(dayDate)}-${slotIdx}`;
    setDragOverSlot(slotKey);
  }, []);

  const handleSlotDrop = useCallback((e: React.DragEvent, dayDate: Date, slotIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);
    const aptId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!aptId || !onDrop) return;
    const hour = getSlotHour(slotIdx);
    const minute = getSlotMinute(slotIdx);
    const dayComp = getBoliviaDateComponents(dayDate);
    const newDate = new Date(dayComp.year, dayComp.month - 1, dayComp.day, hour, minute, 0, 0);
    onDrop(aptId, newDate);
  }, [onDrop]);

  const handleSlotDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  const handleSlotClick = useCallback((dayDate: Date, slotIdx: number) => {
    if (!onSelectSlot) return;
    const hour = getSlotHour(slotIdx);
    const minute = getSlotMinute(slotIdx);
    const dayComp = getBoliviaDateComponents(dayDate);
    const d = new Date(dayComp.year, dayComp.month - 1, dayComp.day, hour, minute, 0, 0);
    onSelectSlot(d);
  }, [onSelectSlot]);

  return (
    <div className="cal-time-grid cal-time-grid-week cal-scroll" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
      {/* Day headers */}
      <div className="col-span-full grid grid-cols-[56px_repeat(7,1fr)]" style={{ position: 'sticky', top: 0, zIndex: 15 }}>
        <div className="cal-day-header" style={{ borderRight: '1px solid var(--color-border-light)' }} />
        {weekDays.map((day, i) => {
          const dc = getBoliviaDateComponents(day);
          const nc = getBoliviaDateComponents(now);
          const isToday = dc.year === nc.year && dc.month === nc.month && dc.day === nc.day;
          return (
            <div
              key={i}
              className={`cal-day-header ${isToday ? 'cal-day-header-today' : ''} ${i >= 5 ? 'cal-day-header-weekend' : ''}`}
            >
              <div className="cal-day-header-name">{shortDays[i]}</div>
              <div className="cal-day-header-number">{dc.day}</div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
        const hour = getSlotHour(slotIdx);
        const minute = getSlotMinute(slotIdx);
        const isHourStart = minute === 0;

        return (
          <div key={slotIdx} className="col-span-full grid grid-cols-[56px_repeat(7,1fr)]">
            {/* Time label — only show on hour boundaries */}
            <div className="cal-time-label">
              {isHourStart ? `${String(hour).padStart(2, '0')}:00` : ''}
            </div>

            {/* Day cells */}
            {weekDays.map((day, dayIdx) => {
              const dayKey = getBoliviaDateString(day);
              const slotKey = `${dayKey}-${slotIdx}`;
              const isDragOver = dragOverSlot === slotKey;
              const dayEvents = eventsByDay.get(dayKey) ?? [];
              const slotEvents = dayEvents.filter((apt) => {
                const d = new Date(apt.fecha_hora);
                const ah = getBoliviaHours(d);
                const am = getBoliviaMinutes(d);
                return ah === hour && (am >= 30 ? 1 : 0) === (minute >= 30 ? 1 : 0) && (minute === 0 ? am < 30 : am >= 30);
              });

              const dc = getBoliviaDateComponents(day);
              const nc = getBoliviaDateComponents(now);
              const isToday = dc.year === nc.year && dc.month === nc.month && dc.day === nc.day;

              return (
                <div
                  key={dayIdx}
                  className={`cal-slot ${isDragOver ? 'drag-over' : ''} ${isToday ? 'cal-slot-today' : ''} ${minute === 30 ? 'cal-slot-half-hour' : ''}`}
                  onDragOver={(e) => handleSlotDragOver(e, day, slotIdx)}
                  onDrop={(e) => handleSlotDrop(e, day, slotIdx)}
                  onDragLeave={handleSlotDragLeave}
                  onClick={() => handleSlotClick(day, slotIdx)}
                >
                  {minute === 0 && <div className="cal-slot-half" />}

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
        );
      })}

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
