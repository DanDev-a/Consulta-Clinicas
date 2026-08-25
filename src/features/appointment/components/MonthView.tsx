import { useMemo, useCallback } from 'react';
import type { Appointment } from '../types/appointment';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onSelectEvent?: (appointment: Appointment) => void;
  onSelectDay?: (date: Date) => void;
}

const shortDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MAX_CHIPS = 3;

function getMonthGrid(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay() === 0 ? -5 : 2 - firstDay.getDay();
  const startDate = new Date(year, month, startDay);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function isCurrentMonth(date: Date, currentMonth: Date): boolean {
  return date.getMonth() === currentMonth.getMonth();
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDIENTE: 'var(--color-warning-soft)',
    CONFIRMADA: 'var(--color-accent-soft)',
    ATENDIDA: 'var(--color-success-soft)',
    CANCELADA: 'var(--color-danger-soft)',
  };
  return map[status] ?? 'var(--color-surface-alt)';
}

function getStatusBorder(status: string): string {
  const map: Record<string, string> = {
    PENDIENTE: 'var(--color-warning)',
    CONFIRMADA: 'var(--color-accent)',
    ATENDIDA: 'var(--color-success)',
    CANCELADA: 'var(--color-danger)',
  };
  return map[status] ?? 'var(--color-border)';
}

function getStatusTextColor(status: string): string {
  const map: Record<string, string> = {
    PENDIENTE: 'var(--color-warning)',
    CONFIRMADA: 'var(--color-accent)',
    ATENDIDA: 'var(--color-success)',
    CANCELADA: 'var(--color-danger)',
  };
  return map[status] ?? 'var(--color-text-muted)';
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export default function MonthView({ currentDate, appointments, onSelectEvent, onSelectDay }: MonthViewProps) {
  const monthGrid = useMemo(() => getMonthGrid(currentDate), [currentDate]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const apt of appointments) {
      const d = new Date(apt.fecha_hora);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const existing = map.get(key) ?? [];
      existing.push(apt);
      map.set(key, existing);
    }
    return map;
  }, [appointments]);

  const handleDayClick = useCallback((day: Date) => {
    onSelectDay?.(day);
  }, [onSelectDay]);

  return (
    <div>
      {/* Day names header */}
      <div className="cal-month-grid" style={{ borderBottom: 'none' }}>
        {shortDays.map((name, i) => (
          <div key={i} className="cal-month-header">{name}</div>
        ))}
      </div>

      {/* Month grid */}
      <div className="cal-month-grid">
        {monthGrid.map((day, idx) => {
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const dayEvents = eventsByDate.get(key) ?? [];
          const visibleEvents = dayEvents.slice(0, MAX_CHIPS);
          const extraCount = dayEvents.length - MAX_CHIPS;
          const isOff = !isCurrentMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={idx}
              className={[
                'cal-month-cell',
                isOff ? 'cal-month-cell-off' : '',
                today ? 'cal-month-cell-today' : '',
              ].join(' ')}
              onClick={() => handleDayClick(day)}
            >
              <div className="cal-month-day-number">{day.getDate()}</div>

              {visibleEvents.map((apt) => (
                <div
                  key={apt.id_cita}
                  className="cal-month-chip"
                  style={{
                    backgroundColor: getStatusColor(apt.estado),
                    color: getStatusTextColor(apt.estado),
                    borderLeftColor: getStatusBorder(apt.estado),
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEvent?.(apt);
                  }}
                >
                  {formatTime(apt.fecha_hora)} {apt.paciente?.usuario?.nombre ?? ''}
                </div>
              ))}

              {extraCount > 0 && (
                <div className="cal-month-more" onClick={(e) => e.stopPropagation()}>
                  +{extraCount} más
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
