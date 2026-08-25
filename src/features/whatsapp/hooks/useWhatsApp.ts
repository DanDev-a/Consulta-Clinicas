import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import type { WhatsAppConfig, WhatsAppLog, WhatsAppConfigFormData, WhatsAppLogFilter } from '../types/whatsapp';

const LOG_PAGE_SIZE = 20;

export function useWhatsApp() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logFilters, setLogFilters] = useState<WhatsAppLogFilter>({
    search: '', tipo: '', estado: '', fecha_desde: '', fecha_hasta: '',
  });

  const fetchConfig = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('activo', true)
      .order('fecha_creacion', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (err) {
      setError(err.message);
      return;
    }
    setConfig(data);
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const saveConfig = async (formData: WhatsAppConfigFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (config) {
        const { error: err } = await supabase
          .from('whatsapp_config')
          .update({
            phone_number_id: formData.phone_number_id,
            token: formData.token,
            numero_display: formData.numero_display,
            activo: formData.activo,
            fecha_actualizacion: new Date().toISOString(),
          })
          .eq('id', config.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('whatsapp_config')
          .insert({
            phone_number_id: formData.phone_number_id,
            token: formData.token,
            numero_display: formData.numero_display,
            activo: formData.activo,
          });
        if (err) throw err;
      }
      await fetchConfig();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar configuración');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('whatsapp_log')
        .select('*, paciente:paciente(usuario:usuario(nombre, apellido))', { count: 'exact' });

      if (logFilters.tipo) query = query.eq('tipo', logFilters.tipo);
      if (logFilters.estado) query = query.eq('estado', logFilters.estado);
      if (logFilters.fecha_desde) query = query.gte('fecha_envio', logFilters.fecha_desde);
      if (logFilters.fecha_hasta) query = query.lte('fecha_envio', logFilters.fecha_hasta + 'T23:59:59');
      if (logFilters.search) {
        query = query.or(`phone_number.ilike.%${logFilters.search}%,mensaje.ilike.%${logFilters.search}%`);
      }

      const from = (logPage - 1) * LOG_PAGE_SIZE;
      const to = from + LOG_PAGE_SIZE - 1;

      const { data, count, error: err } = await query
        .order('fecha_envio', { ascending: false })
        .range(from, to);

      if (err) throw err;

      setLogs((data ?? []) as WhatsAppLog[]);
      setTotalLogs(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar logs');
    } finally {
      setLoading(false);
    }
  }, [logPage, logFilters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return {
    config,
    logs,
    totalLogs,
    logPage,
    LOG_PAGE_SIZE,
    loading,
    error,
    logFilters,
    setLogFilters,
    setLogPage,
    fetchConfig,
    saveConfig,
    fetchLogs,
  };
}
