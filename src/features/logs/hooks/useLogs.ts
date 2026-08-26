import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../config/supabaseClient';

export interface AuditLog {
  id: number;
  id_usuario: string;
  tabla: string;
  accion: string;
  datos_anteriores: Record<string, unknown> | null;
  datos_nuevos: Record<string, unknown> | null;
  fecha: string;
  ip_address: string | null;
  usuario_nombre?: string;
  usuario_email?: string;
}

export function useLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('audit_log')
      .select(`
        id,
        id_usuario,
        tabla,
        accion,
        datos_anteriores,
        datos_nuevos,
        fecha,
        ip_address,
        usuario:id_usuario(nombre, apellido, email)
      `)
      .order('fecha', { ascending: false })
      .limit(100);

    if (fetchError) {
      setError(fetchError.message);
      setLogs([]);
    } else {
      const mapped = (data ?? []).map((row: Record<string, unknown>) => {
        const usuario = row.usuario as { nombre: string; apellido: string; email: string } | null;
        return {
          id: row.id as number,
          id_usuario: row.id_usuario as string,
          tabla: row.tabla as string,
          accion: row.accion as string,
          datos_anteriores: row.datos_anteriores as Record<string, unknown> | null,
          datos_nuevos: row.datos_nuevos as Record<string, unknown> | null,
          fecha: row.fecha as string,
          ip_address: row.ip_address as string | null,
          usuario_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : undefined,
          usuario_email: usuario?.email ?? undefined,
        };
      });
      setLogs(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs };
}
