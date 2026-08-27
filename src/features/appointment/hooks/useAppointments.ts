import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { toLocalISO, getBoliviaDateString, getBoliviaTimeString } from '../../../utils/date';
import type { Appointment, AppointmentFormData, AppointmentFilter, AppointmentStatus } from '../types/appointment';

const PAGE_SIZE = 10;

const SELECT_RELATIONS = '*, paciente:paciente(id_paciente, usuario:usuario(nombre, apellido)), doctor:doctor(id_doctor, usuario:usuario(nombre, apellido), especialidad:especialidad(nombre))';

function mapRowToAppointment(c: Record<string, unknown>): Appointment {
  const paciente = c.paciente as Record<string, unknown> | null;
  const pacUsuario = paciente?.usuario as Record<string, string> | null;
  const doctor = c.doctor as Record<string, unknown> | null;
  const docUsuario = doctor?.usuario as Record<string, string> | null;
  const especialidad = doctor?.especialidad as Record<string, string> | null;
  return {
    id_cita: c.id_cita as number,
    id_paciente: c.id_paciente as string,
    id_doctor: c.id_doctor as string,
    id_expediente: c.id_expediente as number,
    fecha_hora: c.fecha_hora as string,
    motivo: c.motivo as string | null,
    estado: c.estado as AppointmentStatus,
    fecha_creacion: c.fecha_creacion as string,
    paciente: paciente ? {
      id_paciente: paciente.id_paciente as string,
      usuario: pacUsuario ? { nombre: pacUsuario.nombre, apellido: pacUsuario.apellido } : null,
    } : null,
    doctor: doctor ? {
      id_doctor: doctor.id_doctor as string,
      usuario: docUsuario ? { nombre: docUsuario.nombre, apellido: docUsuario.apellido } : null,
      especialidad: especialidad ? { nombre: especialidad.nombre } : null,
    } : null,
  };
}

export function useAppointments(userRole: string | undefined, userId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AppointmentFilter>({
    search: '', estado: '', id_doctor: '', fecha_desde: '', fecha_hasta: '',
  });

  const fetchAppointments = useCallback(async () => {
    if (!userRole) return;
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('cita')
        .select(
          '*, paciente:paciente(id_paciente, usuario:usuario(nombre, apellido)), doctor:doctor(id_doctor, usuario:usuario(nombre, apellido), especialidad:especialidad(nombre))',
          { count: 'exact' }
        );

      if (userRole === 'DOCTOR') query = query.eq('id_doctor', userId);
      else if (userRole === 'PACIENTE') query = query.eq('id_paciente', userId);

      if (filters.estado) query = query.eq('estado', filters.estado);
      if (filters.id_doctor && userRole !== 'DOCTOR') query = query.eq('id_doctor', filters.id_doctor);
      if (filters.fecha_desde) query = query.gte('fecha_hora', filters.fecha_desde);
      if (filters.fecha_hasta) query = query.lte('fecha_hora', filters.fecha_hasta + 'T23:59:59');

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error: err } = await query
        .order('fecha_hora', { ascending: false })
        .range(from, to);

      if (err) throw err;

      setAppointments((data ?? []).map(mapRowToAppointment));
      setTotal(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, [userRole, userId, page, filters]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const createAppointment = async (data: AppointmentFormData): Promise<number | null> => {
    try {
      const { data: expediente } = await supabase
        .from('expediente')
        .select('id_expediente')
        .eq('id_paciente', data.id_paciente)
        .single();

      if (!expediente) throw new Error('El paciente no tiene expediente');

      const { data: newCita, error } = await supabase
        .from('cita')
        .insert({
          id_paciente: data.id_paciente,
          id_doctor: data.id_doctor,
          id_expediente: expediente.id_expediente,
          fecha_hora: data.fecha_hora,
          motivo: data.motivo || null,
          estado: 'PENDIENTE',
        })
        .select('id_cita')
        .single();
      if (error) throw error;
      await fetchAppointments();
      return newCita?.id_cita ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cita');
      return null;
    }
  };

  const updateAppointmentStatus = async (id: number, status: AppointmentStatus): Promise<boolean> => {
    try {
      const updates: Record<string, unknown> = { estado: status };
      if (status === 'ATENDIDA') updates.fecha_atencion = new Date().toISOString();

      const { error } = await supabase.from('cita').update(updates).eq('id_cita', id);
      if (error) throw error;
      await fetchAppointments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cita');
      return false;
    }
  };

  const cancelAppointment = async (id: number): Promise<boolean> => {
    return updateAppointmentStatus(id, 'CANCELADA');
  };

  const updateAppointmentTime = async (id: number, newFechaHora: Date): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('cita')
        .update({ fecha_hora: toLocalISO(getBoliviaDateString(newFechaHora), getBoliviaTimeString(newFechaHora)) })
        .eq('id_cita', id);
      if (error) throw error;
      await fetchAppointments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reprogramar cita');
      return false;
    }
  };

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from('doctor')
      .select('id_doctor, usuario:usuario(nombre, apellido), especialidad:especialidad(nombre)');
    if (error) {
      console.error('Error fetching doctors:', error.message);
      return [];
    }
    return (data ?? []).map((d: Record<string, unknown>) => {
      const usuario = d.usuario as Record<string, string> | null;
      const esp = d.especialidad as Record<string, string> | null;
      return {
        id_doctor: d.id_doctor as string,
        nombre: usuario?.nombre ?? '',
        apellido: usuario?.apellido ?? '',
        especialidad: esp?.nombre ?? '',
      };
    });
  };

  const fetchAllPatients = async () => {
    const { data, error } = await supabase
      .from('paciente')
      .select('id_paciente, usuario:usuario(nombre, apellido)');
    if (error) {
      console.error('Error fetching patients:', error.message);
      return [];
    }
    return (data ?? []).map((p: Record<string, unknown>) => {
      const usuario = p.usuario as Record<string, string> | null;
      return {
        id_paciente: p.id_paciente as string,
        nombre: usuario?.nombre ?? '',
        apellido: usuario?.apellido ?? '',
      };
    });
  };

  const fetchCalendarAppointments = useCallback(async (fechaDesde: string, fechaHasta: string): Promise<Appointment[]> => {
    try {
      let query = supabase
        .from('cita')
        .select(SELECT_RELATIONS)
        .gte('fecha_hora', fechaDesde)
        .lte('fecha_hora', fechaHasta + 'T23:59:59')
        .order('fecha_hora', { ascending: true });

      if (userRole === 'DOCTOR') query = query.eq('id_doctor', userId);
      else if (userRole === 'PACIENTE') query = query.eq('id_paciente', userId);

      const { data, error: err } = await query;
      if (err) throw err;
      return (data ?? []).map(mapRowToAppointment);
    } catch {
      return [];
    }
  }, [userRole, userId]);

  return {
    loading, error, appointments, total, page, PAGE_SIZE,
    setPage, filters, setFilters,
    fetchAppointments, fetchCalendarAppointments, createAppointment, updateAppointmentStatus, cancelAppointment, updateAppointmentTime,
    fetchDoctors, fetchAllPatients,
  };
}
