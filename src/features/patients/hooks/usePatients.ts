import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import type { Patient, PatientFormData, PatientFilter, PatientAlergia, PatientMedicamento, Expediente } from '../types/patient';

const PAGE_SIZE = 10;
const NIL_UUID = '00000000-0000-0000-0000-000000000000';

export function usePatients(userRole: string | undefined, userId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PatientFilter>({ search: '', sexo: '', ciudad: '', grupo_sanguineo: '' });

  const fetchPatients = useCallback(async () => {
    if (!userRole) return;
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('paciente')
        .select('*, usuario:usuario(nombre, apellido, email)', { count: 'exact' });

      if (userRole === 'DOCTOR') {
        const { data: citasDoctor } = await supabase
          .from('cita')
          .select('id_paciente')
          .eq('id_doctor', userId);
        const pacienteIds = [...new Set((citasDoctor ?? []).map(c => c.id_paciente))];
        if (pacienteIds.length === 0) {
          setPatients([]);
          setTotal(0);
          setLoading(false);
          return;
        }
        query = query.in('id_paciente', pacienteIds);
      }

      if (filters.search) {
        const term = filters.search.replace(/[%_,()\\]/g, '').trim();
        if (term) {
          const { data: matchIds } = await supabase
            .from('usuario')
            .select('id_usuario')
            .or(`nombre.ilike.%${term}%,apellido.ilike.%${term}%,email.ilike.%${term}%`)
            .limit(200);
          const ids = (matchIds ?? []).map((m: { id_usuario: string }) => m.id_usuario);
          query = query.or(`ci.ilike.%${term}%,id_paciente.in.(${ids.length > 0 ? ids.join(',') : NIL_UUID})`);
        }
      }
      if (filters.sexo) query = query.eq('sexo', filters.sexo);
      if (filters.ciudad) query = query.ilike('ciudad', `%${filters.ciudad}%`);
      if (filters.grupo_sanguineo) query = query.eq('grupo_sanguineo', filters.grupo_sanguineo);

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error: err } = await query
        .order('fecha_registro', { ascending: false })
        .range(from, to);

      if (err) throw err;

      setPatients(
        (data ?? []).map((p: Record<string, unknown>) => {
          const usuario = p.usuario as Record<string, string> | null;
          return {
            id_paciente: p.id_paciente as string,
            ci: p.ci as string,
            fecha_nacimiento: p.fecha_nacimiento as string,
            sexo: p.sexo as 'M' | 'F' | 'O',
            telefono: p.telefono as string | null,
            direccion: p.direccion as string | null,
            ciudad: p.ciudad as string | null,
            grupo_sanguineo: p.grupo_sanguineo as string | null,
            fecha_registro: p.fecha_registro as string,
            fecha_actualizacion: p.fecha_actualizacion as string,
            usuario: usuario ? { nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email } : null,
          };
        })
      );
      setTotal(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  }, [userRole, userId, page, filters]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const createPatient = async (data: PatientFormData): Promise<boolean> => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: data.email,
        password: data.ci,
        options: {
          data: {
            rol: 'PACIENTE',
            nombre: data.nombre,
            apellido: data.apellido,
            ci: data.ci,
            fecha_nacimiento: data.fecha_nacimiento,
            sexo: data.sexo,
            telefono: data.telefono || '',
            direccion: data.direccion || '',
            ciudad: data.ciudad || '',
            grupo_sanguineo: data.grupo_sanguineo || '',
          },
        },
      });
      if (authErr) throw authErr;
      if (!authData.user) throw new Error('No se pudo crear el usuario');
      if ((authData.user.identities?.length ?? 0) === 0) {
        throw new Error('Ese email ya está registrado');
      }

      const { data: { session: afterSession } } = await supabase.auth.getSession();
      if (currentSession && afterSession?.user.id !== currentSession.user.id) {
        const { error: restoreErr } = await supabase.auth.setSession(currentSession);
        if (restoreErr) console.error('No se pudo restaurar la sesión:', restoreErr);
      }

      await fetchPatients();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear paciente');
      return false;
    }
  };

  const updatePatient = async (id: string, data: Partial<PatientFormData>): Promise<boolean> => {
    try {
      if (data.nombre || data.apellido) {
        const updates: Record<string, unknown> = {};
        if (data.nombre) updates.nombre = data.nombre;
        if (data.apellido) updates.apellido = data.apellido;
        const { error } = await supabase.from('usuario').update(updates).eq('id_usuario', id);
        if (error) throw error;
      }

      const pacUpdates: Record<string, unknown> = {};
      if (data.ci) pacUpdates.ci = data.ci;
      if (data.fecha_nacimiento) pacUpdates.fecha_nacimiento = data.fecha_nacimiento;
      if (data.sexo) pacUpdates.sexo = data.sexo;
      if (data.telefono !== undefined) pacUpdates.telefono = data.telefono || null;
      if (data.direccion !== undefined) pacUpdates.direccion = data.direccion || null;
      if (data.ciudad !== undefined) pacUpdates.ciudad = data.ciudad || null;
      if (data.grupo_sanguineo !== undefined) pacUpdates.grupo_sanguineo = data.grupo_sanguineo || null;
      pacUpdates.fecha_actualizacion = new Date().toISOString();

      const { error: pacErr } = await supabase.from('paciente').update(pacUpdates).eq('id_paciente', id);
      if (pacErr) throw pacErr;

      await fetchPatients();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar paciente');
      return false;
    }
  };

  const deletePatient = async (id: string): Promise<boolean> => {
    try {
      const { error: pacErr } = await supabase.from('paciente').delete().eq('id_paciente', id);
      if (pacErr) throw pacErr;

      await supabase.from('usuario').delete().eq('id_usuario', id);

      await fetchPatients();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar paciente');
      return false;
    }
  };

  const getPatientById = useCallback(async (id: string): Promise<Patient | null> => {
    try {
      const { data, error } = await supabase
        .from('paciente')
        .select('*, usuario:usuario(nombre, apellido, email)')
        .eq('id_paciente', id)
        .single();
      if (error) throw error;
      const usuario = data.usuario as Record<string, string> | null;
      return {
        id_paciente: data.id_paciente,
        ci: data.ci,
        fecha_nacimiento: data.fecha_nacimiento,
        sexo: data.sexo,
        telefono: data.telefono,
        direccion: data.direccion,
        ciudad: data.ciudad,
        grupo_sanguineo: data.grupo_sanguineo,
        fecha_registro: data.fecha_registro,
        fecha_actualizacion: data.fecha_actualizacion,
        usuario: usuario ? { nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email } : null,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar paciente');
      return null;
    }
  }, []);

  const getPatientAlergias = async (id: string): Promise<PatientAlergia[]> => {
    const { data } = await supabase
      .from('paciente_alergia')
      .select('alergia:alergia(id_alergia, nombre), observacion')
      .eq('id_paciente', id);
    return (data ?? []).map((a: Record<string, unknown>) => {
      const alergia = a.alergia as Record<string, unknown> | null;
      return {
        id_alergia: alergia?.id_alergia as number,
        nombre: alergia?.nombre as string,
        observacion: a.observacion as string | null,
      };
    });
  };

  const getPatientMedicamentos = async (id: string): Promise<PatientMedicamento[]> => {
    const { data } = await supabase
      .from('paciente_medicamento')
      .select('medicamento:medicamento(id_medicamento, nombre), dosis, indicacion, fecha_inicio, fecha_fin')
      .eq('id_paciente', id);
    return (data ?? []).map((m: Record<string, unknown>) => {
      const med = m.medicamento as Record<string, unknown> | null;
      return {
        id_medicamento: med?.id_medicamento as number,
        nombre: med?.nombre as string,
        dosis: m.dosis as string | null,
        indicacion: m.indicacion as string | null,
        fecha_inicio: m.fecha_inicio as string,
        fecha_fin: m.fecha_fin as string | null,
      };
    });
  };

  const getPatientExpediente = async (id: string): Promise<Expediente | null> => {
    const { data } = await supabase
      .from('expediente')
      .select('*')
      .eq('id_paciente', id)
      .single();
    return data as Expediente | null;
  };

  const updateExpediente = async (idPaciente: string, observaciones: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('expediente')
        .update({ observaciones })
        .eq('id_paciente', idPaciente);
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar expediente');
      return false;
    }
  };

  return {
    loading, error, patients, total, page, PAGE_SIZE,
    setPage, filters, setFilters,
    fetchPatients, createPatient, updatePatient, deletePatient,
    getPatientById, getPatientAlergias, getPatientMedicamentos, getPatientExpediente, updateExpediente,
  };
}
