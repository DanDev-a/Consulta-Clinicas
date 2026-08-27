import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import type { Especialidad, DoctorInfo, TimeSlot, BookingWizardState } from '../types/booking';
import { TIME_SLOTS } from '../types/booking';

const INITIAL_STATE: BookingWizardState = {
  step: 1,
  especialidad: null,
  doctor: null,
  date: '',
  time: '',
  motivo: '',
};

export function useBookingWizard(userId: string | undefined) {
  const [state, setState] = useState<BookingWizardState>(INITIAL_STATE);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    const { data } = await supabase
      .from('especialidad')
      .select('id_especialidad, nombre, descripcion')
      .eq('activa', true)
      .order('nombre');
    setEspecialidades((data ?? []) as Especialidad[]);
  };

  const fetchDoctors = async (especialidadId: number) => {
    const { data } = await supabase
      .from('doctor')
      .select('id_doctor, usuario:usuario(nombre, apellido), especialidad:especialidad(nombre, id_especialidad)')
      .eq('id_especialidad', especialidadId);
    setDoctors((data ?? []).map((d: Record<string, unknown>) => {
      const usuario = d.usuario as Record<string, string> | null;
      const esp = d.especialidad as Record<string, unknown> | null;
      return {
        id_doctor: d.id_doctor as string,
        nombre: usuario?.nombre ?? '',
        apellido: usuario?.apellido ?? '',
        especialidad: (esp?.nombre as string) ?? '',
        id_especialidad: (esp?.id_especialidad as number) ?? especialidadId,
      };
    }));
  };

  const fetchAvailableSlots = useCallback(async (doctorId: string, dateStr: string) => {
    setLoadingSlots(true);
    try {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();

      const { data: horarios } = await supabase
        .from('horario_doctor')
        .select('hora_inicio, hora_fin')
        .eq('id_doctor', doctorId)
        .eq('dia_semana', dayOfWeek)
        .eq('activo', true);

      let availableTimes = TIME_SLOTS;

      if (horarios && horarios.length > 0) {
        const allTimes: string[] = [];
        for (const h of horarios) {
          const [startH, startM] = h.hora_inicio.split(':').map(Number);
          const [endH, endM] = h.hora_fin.split(':').map(Number);
          const startMin = startH * 60 + startM;
          const endMin = endH * 60 + endM;
          for (let m = startMin; m < endMin; m += 30) {
            const hh = String(Math.floor(m / 60)).padStart(2, '0');
            const mm = String(m % 60).padStart(2, '0');
            allTimes.push(`${hh}:${mm}`);
          }
        }
        availableTimes = allTimes;
      }

      const { data: citas } = await supabase
        .from('cita')
        .select('fecha_hora')
        .eq('id_doctor', doctorId)
        .gte('fecha_hora', `${dateStr}T00:00:00`)
        .lte('fecha_hora', `${dateStr}T23:59:59`)
        .in('estado', ['PENDIENTE', 'CONFIRMADA']);

      const occupiedTimes = new Set(
        (citas ?? []).map((c: { fecha_hora: string }) => {
          const d = new Date(c.fecha_hora);
          return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        })
      );

      const now = new Date();
      const isToday = dateStr === now.toISOString().slice(0, 10);

      const result: TimeSlot[] = availableTimes.map(time => {
        const [h, m] = time.split(':').map(Number);
        const isPast = isToday && (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes()));
        return {
          time,
          label: time,
          available: !occupiedTimes.has(time) && !isPast,
        };
      });

      setSlots(result);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const selectEspecialidad = async (esp: Especialidad) => {
    setState(prev => ({ ...prev, especialidad: esp, step: 2 as const }));
    await fetchDoctors(esp.id_especialidad);
  };

  const selectDoctor = (doc: DoctorInfo) => {
    setState(prev => ({ ...prev, doctor: doc, step: 3 as const, date: '', time: '' }));
  };

  const selectDate = async (dateStr: string) => {
    setState(prev => ({ ...prev, date: dateStr, time: '' }));
    if (state.doctor) {
      await fetchAvailableSlots(state.doctor.id_doctor, dateStr);
    }
  };

  const selectTime = (time: string) => {
    setState(prev => ({ ...prev, time, step: 4 as const }));
  };

  const setMotivo = (motivo: string) => {
    setState(prev => ({ ...prev, motivo }));
  };

  const goBack = () => {
    setState(prev => {
      if (prev.step === 2) return { ...prev, step: 1 as const, especialidad: null };
      if (prev.step === 3) return { ...prev, step: 2 as const, doctor: null, date: '', time: '' };
      if (prev.step === 4) return { ...prev, step: 3 as const, time: '' };
      return prev;
    });
  };

  const submitBooking = async (): Promise<boolean> => {
    if (!userId || !state.doctor || !state.date || !state.time) return false;
    setLoading(true);
    setError(null);
    try {
      const { data: expediente } = await supabase
        .from('expediente')
        .select('id_expediente')
        .eq('id_paciente', userId)
        .single();

      if (!expediente) {
        throw new Error('No se encontró tu expediente médico');
      }

      const fecha_hora = `${state.date}T${state.time}:00`;

      const { error: insertError } = await supabase
        .from('cita')
        .insert({
          id_paciente: userId,
          id_doctor: state.doctor.id_doctor,
          id_expediente: expediente.id_expediente,
          fecha_hora,
          motivo: state.motivo || null,
          estado: 'PENDIENTE',
        });

      if (insertError) throw insertError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cita');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setState(INITIAL_STATE);
    setDoctors([]);
    setSlots([]);
    setError(null);
  };

  return {
    state,
    especialidades,
    doctors,
    slots,
    loading,
    loadingSlots,
    error,
    selectEspecialidad,
    selectDoctor,
    selectDate,
    selectTime,
    setMotivo,
    goBack,
    submitBooking,
    reset,
  };
}
