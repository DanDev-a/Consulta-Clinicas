import { RiTimeLine } from 'react-icons/ri';

interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selected: string;
  onSelect: (time: string) => void;
  loading?: boolean;
}

export default function TimeSlotPicker({ slots, selected, onSelect, loading }: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[var(--color-text)]">Horario *</span>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-[var(--color-surface-alt)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[var(--color-text)]">Horario *</span>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-alt)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
          <RiTimeLine size={16} />
          No hay horarios disponibles para esta fecha
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[var(--color-text)]">Horario *</span>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            disabled={!slot.available}
            onClick={() => onSelect(slot.time)}
            className={[
              'rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
              selected === slot.time
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                : slot.available
                  ? 'border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                  : 'border-[var(--color-border-light)] bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50',
            ].join(' ')}
          >
            {slot.label}
          </button>
        ))}
      </div>
    </div>
  );
}
