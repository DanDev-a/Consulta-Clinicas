import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiListCheck,
  RiCalendarEventLine,
  RiCalendarTodoLine,
  RiBusLine,
} from 'react-icons/ri';

export type CalendarView = 'week' | 'month' | 'day' | 'agenda';

interface CalendarToolbarProps {
  currentDate: Date;
  currentView: CalendarView;
  onNavigate: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
}

const viewLabels: Record<CalendarView, { label: string; icon: React.ReactNode }> = {
  week: { label: 'Semana', icon: <RiCalendarEventLine size={15} /> },
  month: { label: 'Mes', icon: <RiCalendarTodoLine size={15} /> },
  day: { label: 'Día', icon: <RiBusLine size={15} /> },
  agenda: { label: 'Lista', icon: <RiListCheck size={15} /> },
};

function formatDateRange(date: Date, view: CalendarView): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const shortMonths = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  if (view === 'month') {
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  if (view === 'day') {
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  if (view === 'week') {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
      return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${shortMonths[startOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;
    }
    return `${startOfWeek.getDate()} ${shortMonths[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${shortMonths[endOfWeek.getMonth()]} ${endOfWeek.getFullYear()}`;
  }

  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function CalendarToolbar({
  currentDate,
  currentView,
  onNavigate,
  onToday,
  onViewChange,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--color-border-light)]">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('prev')}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          aria-label="Anterior"
        >
          <RiArrowLeftSLine size={20} />
        </button>
        <button
          onClick={onToday}
          className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <RiCalendarLine size={14} />
          Hoy
        </button>
        <button
          onClick={() => onNavigate('next')}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          aria-label="Siguiente"
        >
          <RiArrowRightSLine size={20} />
        </button>

        <h2 className="ml-2 text-base font-semibold text-[var(--color-text)] select-none">
          {formatDateRange(currentDate, currentView)}
        </h2>
      </div>

      <div className="flex items-center gap-0.5 bg-[var(--color-surface-alt)] rounded-lg p-0.5">
        {(Object.keys(viewLabels) as CalendarView[]).map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={[
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5',
              currentView === view
                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]',
            ].join(' ')}
          >
            {viewLabels[view].icon}
            {viewLabels[view].label}
          </button>
        ))}
      </div>
    </div>
  );
}
