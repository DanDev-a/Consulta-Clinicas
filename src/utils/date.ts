const BOLIVIA_TZ = 'America/La_Paz';
const BOLIVIA_OFFSET = '-04:00';

export function toLocalISO(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00${BOLIVIA_OFFSET}`;
}

export function getBoliviaDateComponents(date?: Date): { year: number; month: number; day: number; hours: number; minutes: number; dayOfWeek: number } {
  const d = date ?? new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BOLIVIA_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
    weekday: 'short',
  }).formatToParts(d);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0', 10);
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hours: get('hour'),
    minutes: get('minute'),
    dayOfWeek: weekdayMap[parts.find(p => p.type === 'weekday')?.value ?? 'Mon'] ?? 1,
  };
}

export function getBoliviaDateString(date?: Date): string {
  const c = getBoliviaDateComponents(date);
  return `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`;
}

export function getBoliviaTimeString(date?: Date): string {
  const c = getBoliviaDateComponents(date);
  return `${String(c.hours).padStart(2, '0')}:${String(c.minutes).padStart(2, '0')}`;
}

export function getBoliviaHours(date: Date): number {
  return getBoliviaDateComponents(date).hours;
}

export function getBoliviaMinutes(date: Date): number {
  return getBoliviaDateComponents(date).minutes;
}

export function getBoliviaDayOfWeek(date: Date): number {
  return getBoliviaDateComponents(date).dayOfWeek;
}

export function formatTimeBolivia(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-BO', { timeZone: BOLIVIA_TZ, hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function formatDateTimeBolivia(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-BO', { timeZone: BOLIVIA_TZ });
  } catch {
    return iso;
  }
}

export function isSameDayBolivia(a: Date, b: Date): boolean {
  const ca = getBoliviaDateComponents(a);
  const cb = getBoliviaDateComponents(b);
  return ca.year === cb.year && ca.month === cb.month && ca.day === cb.day;
}

export function isTodayBolivia(date: Date): boolean {
  return isSameDayBolivia(date, new Date());
}
