import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { useTheme, type MedicalTheme } from '../../../hooks/useTheme';
import { useAuthContext, type UserRole } from '../../../contexts/AuthContext';

export interface Preferencias {
  theme: MedicalTheme;
  language: 'es' | 'en';
  notifications: {
    whatsapp: boolean;
    in_app: boolean;
  };
  doctor?: {
    default_view: string;
    work_start: string;
    work_end: string;
  };
  recepcionista?: {
    default_view: string;
    auto_reminders: boolean;
  };
  admin?: {
    system_notifications: boolean;
  };
}

const DEFAULT_SETTINGS: Preferencias = {
  theme: 'catppuccin-mocha',
  language: 'es',
  notifications: { whatsapp: true, in_app: true },
};

function defaultsForRole(role: UserRole): Partial<Preferencias> {
  switch (role) {
    case 'DOCTOR':
      return { doctor: { default_view: 'week', work_start: '08:00', work_end: '17:00' } };
    case 'RECEPCIONISTA':
      return { recepcionista: { default_view: 'week', auto_reminders: true } };
    case 'ADMIN':
      return {
        admin: {
          system_notifications: true,
        },
      };
    default:
      return {};
  }
}

export function useSettings() {
  const { user } = useAuthContext();
  const role = user?.rol ?? 'PACIENTE';
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState<Preferencias>({
    ...DEFAULT_SETTINGS,
    ...defaultsForRole(role),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_user_preferencias');
    if (error || !data) {
      if (error) console.error('Error cargando preferencias:', error);
      setSettings({ ...DEFAULT_SETTINGS, ...defaultsForRole(role) });
      setLoading(false);
      return;
    }
    const merged: Preferencias = {
      ...DEFAULT_SETTINGS,
      ...data,
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(data.notifications || {}) },
      doctor: data.doctor ?? defaultsForRole(role).doctor,
      recepcionista: data.recepcionista ?? defaultsForRole(role).recepcionista,
      admin: {
        ...defaultsForRole(role).admin,
        ...data.admin,
      },
    };
    setSettings(merged);
    setTheme(merged.theme);
    setLoading(false);
  }, [role]);

  useEffect(() => { loadSettings(); }, []);

  const update = <K extends keyof Preferencias>(key: K, value: Preferencias[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'theme') setTheme(value as MedicalTheme);
  };

  const updateNotification = (channel: keyof Preferencias['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [channel]: value },
    }));
  };

  const updateDoctor = <K extends keyof NonNullable<Preferencias['doctor']>>(
    key: K,
    value: NonNullable<Preferencias['doctor']>[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      doctor: { ...prev.doctor!, [key]: value },
    }));
  };

  const updateRecepcionista = <K extends keyof NonNullable<Preferencias['recepcionista']>>(
    key: K,
    value: NonNullable<Preferencias['recepcionista']>[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      recepcionista: { ...prev.recepcionista!, [key]: value },
    }));
  };

  const updateAdmin = <K extends keyof NonNullable<Preferencias['admin']>>(
    key: K,
    value: NonNullable<Preferencias['admin']>[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      admin: { ...prev.admin!, [key]: value },
    }));
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.rpc('update_user_preferencias', { new_preferencias: settings });
    setSaving(false);
    if (error) {
      console.error('Error guardando preferencias:', error);
      return false;
    }
    return true;
  };

  return {
    settings,
    role,
    loading,
    saving,
    update,
    updateNotification,
    updateDoctor,
    updateRecepcionista,
    updateAdmin,
    save,
  };
}
