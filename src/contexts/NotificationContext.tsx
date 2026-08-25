import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuthContext } from './AuthContext';

export interface Notification {
  id: string;
  id_notificacion?: number;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function mapTipoToNotifType(tipo: string): Notification['type'] {
  switch (tipo) {
    case 'EMAIL': return 'info';
    case 'SMS': return 'info';
    case 'WHATSAPP': return 'success';
    case 'APP': return 'info';
    default: return 'info';
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('notificacion')
      .select('id_notificacion, id_paciente, id_cita, tipo, asunto, mensaje, fecha_envio, estado')
      .eq('id_paciente', user.id)
      .order('fecha_envio', { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(
        data.map((n) => ({
          id: String(n.id_notificacion),
          id_notificacion: n.id_notificacion,
          title: n.asunto ?? n.tipo,
          message: n.mensaje,
          timestamp: new Date(n.fecha_envio),
          read: n.estado === 'ENVIADO',
          type: mapTipoToNotifType(n.tipo),
        }))
      );
    }
  }, [user]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const addNotification = useCallback(async (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const localNotif: Notification = {
      ...n,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [localNotif, ...prev].slice(0, 50));

    if (user) {
      const { data: pacienteData } = await supabase
        .from('paciente')
        .select('id_paciente')
        .eq('id_paciente', user.id)
        .single();

      if (pacienteData) {
        await supabase.from('notificacion').insert({
          id_paciente: user.id,
          tipo: 'APP',
          asunto: n.title,
          mensaje: n.message,
          estado: 'ENVIADO',
        });
      }
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    const notif = notifications.find((n) => n.id === id);
    if (notif?.id_notificacion) {
      await supabase
        .from('notificacion')
        .update({ estado: 'ENVIADO' })
        .eq('id_notificacion', notif.id_notificacion);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    if (user) {
      await supabase
        .from('notificacion')
        .update({ estado: 'ENVIADO' })
        .eq('id_paciente', user.id)
        .eq('estado', 'PENDIENTE');
    }
  }, [user]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
