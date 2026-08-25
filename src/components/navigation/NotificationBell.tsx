import { useState, useRef, useEffect, useCallback } from 'react';
import { RiNotification3Line, RiCheckDoubleLine, RiDeleteBinLine } from 'react-icons/ri';
import { supabase } from '../../config/supabaseClient';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import Badge from '../ui/Badge';

interface SupabaseNotification {
  id_notificacion: number;
  asunto: string;
  mensaje: string;
  tipo: string;
  estado: string;
  fecha_envio: string;
}

type MergedNotification = {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  source: 'supabase' | 'inapp';
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Ahora';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  return `Hace ${Math.floor(diff / 86400)}d`;
}

const TYPE_STYLES: Record<MergedNotification['type'], string> = {
  info: 'bg-[var(--color-accent-soft)]',
  success: 'bg-[var(--color-success-soft)]',
  warning: 'bg-[var(--color-warning-soft)]',
  error: 'bg-[var(--color-danger-soft)]',
};

const ESTADO_MAP: Record<string, MergedNotification['type']> = {
  PENDIENTE: 'warning',
  ENVIADO: 'success',
  FALLIDO: 'error',
};

export default function NotificationBell() {
  const { user } = useAuthContext();
  const { notifications: inAppNotifs, unreadCount: inAppUnread, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [sbNotifs, setSbNotifs] = useState<SupabaseNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPaciente = user?.rol === 'PACIENTE';
  const isAdmin = user?.rol === 'ADMIN';

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      let query = supabase
        .from('notificacion')
        .select('id_notificacion, asunto, mensaje, tipo, estado, fecha_envio');
      if (isPaciente) {
        query = query.eq('id_paciente', user.id);
      } else if (!isAdmin) {
        setSbNotifs([]);
        return;
      }
      const { data } = await query.order('fecha_envio', { ascending: false }).limit(20);
      if (data) setSbNotifs(data);
    };
    load();
  }, [user, isPaciente, isAdmin]);

  const merged: MergedNotification[] = [
    ...sbNotifs.map((n) => ({
      id: `sb-${n.id_notificacion}`,
      title: n.asunto ?? n.tipo,
      message: n.mensaje,
      timestamp: new Date(n.fecha_envio),
      read: n.estado !== 'PENDIENTE',
      type: ESTADO_MAP[n.estado] ?? ('info' as const),
      source: 'supabase' as const,
    })),
    ...inAppNotifs.map((n) => ({
      id: `ia-${n.id}`,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp,
      read: n.read,
      type: n.type,
      source: 'inapp' as const,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const totalUnread = inAppUnread + sbNotifs.filter((n) => n.estado === 'PENDIENTE').length;

  const toggle = useCallback(() => setIsOpen((p) => !p), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) close(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, close]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={`Notificaciones${totalUnread > 0 ? `, ${totalUnread} sin leer` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative p-3 rounded-full hover:bg-surface-alt transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      >
        <RiNotification3Line className="text-text-subtle hover:text-accent text-xl" aria-hidden="true" />
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[var(--color-danger)] text-[var(--color-text-inverse)] text-[10px] font-bold px-1">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Lista de notificaciones"
          className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] shadow-lg py-2 z-50"
        >
          <div className="flex items-center justify-between px-4 pb-2 border-b border-[var(--color-border-light)]">
            <h4 className="text-sm font-semibold text-text">Notificaciones</h4>
            {totalUnread > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-[var(--color-accent)] hover:underline focus:outline-none"
                aria-label="Marcar todas como leidas"
              >
                Marcar todas leidas
              </button>
            )}
          </div>

          {merged.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-text-muted">Sin notificaciones</div>
          ) : (
            <ul className="divide-y divide-[var(--color-border-light)]" role="list">
              {merged.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 hover:bg-surface-alt transition-colors ${!n.read ? 'bg-surface-alt/50' : ''}`}
                  role="menuitem"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${TYPE_STYLES[n.type]}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!n.read ? 'font-medium text-text' : 'text-text-muted'}`}>{n.title}</p>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-text-subtle mt-1">{timeAgo(n.timestamp)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {n.source === 'inapp' && !n.read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(n.id.replace('ia-', ''))}
                          className="p-1 rounded hover:bg-surface-elevated transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                          aria-label="Marcar como leida"
                        >
                          <RiCheckDoubleLine size={14} className="text-text-subtle" aria-hidden="true" />
                        </button>
                      )}
                      {n.source === 'inapp' && (
                        <button
                          type="button"
                          onClick={() => removeNotification(n.id.replace('ia-', ''))}
                          className="p-1 rounded hover:bg-[var(--color-danger-soft)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--color-danger)]"
                          aria-label="Eliminar notificacion"
                        >
                          <RiDeleteBinLine size={14} className="text-text-subtle" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
