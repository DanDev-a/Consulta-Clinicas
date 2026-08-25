import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import type {
  StatCardData,
  AppointmentByDay,
  AppointmentByStatus,
  SpecialtyData,
  RecentPatient,
  UpcomingAppointment,
  AiActivity,
  AppointmentReportRow,
  ProductivityRow,
  DemographicData,
  EpidemiologicRow,
} from '../types/dashboard';

export function useDashboard(userId: string | undefined, userRole: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<StatCardData[]>([]);
  const [appointmentsByDay, setAppointmentsByDay] = useState<AppointmentByDay[]>([]);
  const [appointmentsByStatus, setAppointmentsByStatus] = useState<AppointmentByStatus[]>([]);
  const [specialtyData, setSpecialtyData] = useState<SpecialtyData[]>([]);
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [aiActivity, setAiActivity] = useState<AiActivity | null>(null);
  const [appointmentReport, setAppointmentReport] = useState<AppointmentReportRow[]>([]);
  const [productivity, setProductivity] = useState<ProductivityRow[]>([]);
  const [demographics, setDemographics] = useState<DemographicData | null>(null);
  const [epidemiologic, setEpidemiologic] = useState<EpidemiologicRow[]>([]);

  const fetchAll = useCallback(async () => {
    if (!userId || !userRole) return;
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const isAdmin = userRole === 'ADMIN';
      const isDoctor = userRole === 'DOCTOR';
      const isRecepcionista = userRole === 'RECEPCIONISTA';
      const isPaciente = userRole === 'PACIENTE';

      if (isAdmin) {
        const [totalPacientes, totalCitasHoy, totalDoctores, totalCitasMes] = await Promise.all([
          supabase.from('paciente').select('id_paciente', { count: 'exact', head: true }),
          supabase.from('cita').select('id_cita', { count: 'exact', head: true })
            .gte('fecha_hora', todayStart).lt('fecha_hora', todayEnd),
          supabase.from('doctor').select('id_doctor', { count: 'exact', head: true }),
          supabase.from('cita').select('id_cita', { count: 'exact', head: true })
            .gte('fecha_hora', monthStart),
        ]);

        setStats([
          { label: 'Total Pacientes', value: totalPacientes.count ?? 0, icon: 'RiUserHeartLine', color: 'accent' },
          { label: 'Citas Hoy', value: totalCitasHoy.count ?? 0, icon: 'RiCalendarEventLine', color: 'success' },
          { label: 'Doctores', value: totalDoctores.count ?? 0, icon: 'RiStethoscopeLine', color: 'warning' },
          { label: 'Citas del Mes', value: totalCitasMes.count ?? 0, icon: 'RiBarChartLine', color: 'accent' },
        ]);
      } else if (isDoctor) {
        const [citasHoy, citasPendientes, pacientesAtendidos, consultasMes] = await Promise.all([
          supabase.from('cita').select('id_cita', { count: 'exact', head: true })
            .eq('id_doctor', userId).gte('fecha_hora', todayStart).lt('fecha_hora', todayEnd),
          supabase.from('cita').select('id_cita', { count: 'exact', head: true })
            .eq('id_doctor', userId).eq('estado', 'PENDIENTE'),
          supabase.from('cita').select('id_paciente', { count: 'exact', head: true })
            .eq('id_doctor', userId).eq('estado', 'ATENDIDA').gte('fecha_hora', monthStart),
          supabase.from('cita').select('id_cita', { count: 'exact', head: true })
            .eq('id_doctor', userId).gte('fecha_hora', monthStart),
        ]);

        setStats([
          { label: 'Mis Citas Hoy', value: citasHoy.count ?? 0, icon: 'RiCalendarEventLine', color: 'success' },
          { label: 'Mis Citas Pendientes', value: citasPendientes.count ?? 0, icon: 'RiTimeLine', color: 'warning' },
          { label: 'Pacientes Atendidos', value: pacientesAtendidos.count ?? 0, icon: 'RiUserHeartLine', color: 'accent' },
          { label: 'Mis Consultas', value: consultasMes.count ?? 0, icon: 'RiStethoscopeLine', color: 'accent' },
        ]);
      } else if (isRecepcionista) {
        const [totalPacientes, totalCitasHoy, totalCitasPendientes, totalCitasMes] = await Promise.all([
          supabase.from('paciente').select('id_paciente', { count: 'exact', head: true }),
          supabase.from('cita').select('id_cita', { count: 'exact', head: true })
            .gte('fecha_hora', todayStart).lt('fecha_hora', todayEnd),
          supabase.from('cita').select('id_cita', { count: 'exact', head: true })
            .eq('estado', 'PENDIENTE'),
          supabase.from('cita').select('id_cita', { count: 'exact', head: true })
            .gte('fecha_hora', monthStart),
        ]);

        setStats([
          { label: 'Total Pacientes', value: totalPacientes.count ?? 0, icon: 'RiUserHeartLine', color: 'accent' },
          { label: 'Citas Hoy', value: totalCitasHoy.count ?? 0, icon: 'RiCalendarEventLine', color: 'success' },
          { label: 'Citas Pendientes', value: totalCitasPendientes.count ?? 0, icon: 'RiTimeLine', color: 'warning' },
          { label: 'Citas del Mes', value: totalCitasMes.count ?? 0, icon: 'RiBarChartLine', color: 'accent' },
        ]);
      } else if (isPaciente) {
        const { data: expediente } = await supabase
          .from('expediente')
          .select('id_expediente')
          .eq('id_paciente', userId)
          .single();

        const [citasHoy, citasPendientes, diagnosticos, recetasActivas] = await Promise.all([
          supabase.from('cita').select('id_cita', { count: 'exact', head: true })
            .eq('id_paciente', userId).gte('fecha_hora', todayStart).lt('fecha_hora', todayEnd),
          supabase.from('cita').select('id_cita', { count: 'exact', head: true })
            .eq('id_paciente', userId).eq('estado', 'PENDIENTE'),
          expediente
            ? supabase.from('diagnostico').select('id_diagnostico', { count: 'exact', head: true })
                .eq('id_expediente', expediente.id_expediente)
            : { count: 0 },
          expediente
            ? supabase.from('receta').select('id_receta', { count: 'exact', head: true })
                .in('id_diagnostico', 
                  await supabase.from('diagnostico').select('id_diagnostico')
                    .eq('id_expediente', expediente.id_expediente)
                    .then(r => r.data?.map(d => d.id_diagnostico) ?? [])
                ).gte('fecha_emision', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            : { count: 0 },
        ]);

        setStats([
          { label: 'Mis Citas Hoy', value: citasHoy.count ?? 0, icon: 'RiCalendarEventLine', color: 'success' },
          { label: 'Mis Citas Pendientes', value: citasPendientes.count ?? 0, icon: 'RiTimeLine', color: 'warning' },
          { label: 'Mis Diagnósticos', value: diagnosticos.count ?? 0, icon: 'RiFileList3Line', color: 'accent' },
          { label: 'Mis Recetas Activas', value: recetasActivas.count ?? 0, icon: 'RiMedicineBottleLine', color: 'warning' },
        ]);
      }

      const { data: citasSemana } = await supabase
        .from('cita')
        .select('fecha_hora')
        .gte('fecha_hora', weekAgo)
        .order('fecha_hora');

      const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      const dayMap: Record<string, number> = {};
      for (const c of citasSemana ?? []) {
        const d = new Date(c.fecha_hora);
        const key = dayNames[d.getDay()];
        dayMap[key] = (dayMap[key] ?? 0) + 1;
      }
      const orderedDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
      setAppointmentsByDay(orderedDays.map(d => ({ name: d, citas: dayMap[d] ?? 0 })));

      const { data: citasEstado } = await supabase
        .from('cita')
        .select('estado');

      const estadoMap: Record<string, number> = {};
      for (const c of citasEstado ?? []) {
        estadoMap[c.estado] = (estadoMap[c.estado] ?? 0) + 1;
      }
      const estadoLabels: Record<string, string> = {
        PENDIENTE: 'Pendiente',
        CONFIRMADA: 'Confirmada',
        ATENDIDA: 'Atendida',
        CANCELADA: 'Cancelada',
      };
      setAppointmentsByStatus(
        Object.entries(estadoMap).map(([k, v]) => ({ name: estadoLabels[k] ?? k, value: v }))
      );

      const { data: citaEsp } = await supabase
        .from('cita')
        .select('doctor:doctor(id_doctor, especialidad:especialidad(nombre))');

      const espMap: Record<string, number> = {};
      for (const c of citaEsp ?? []) {
        const doc = c.doctor as Record<string, unknown> | null;
        const esp = doc?.especialidad as Record<string, unknown> | null;
        const espNombre = (esp?.nombre as string) ?? 'Sin especialidad';
        espMap[espNombre] = (espMap[espNombre] ?? 0) + 1;
      }
      setSpecialtyData(Object.entries(espMap).map(([k, v]) => ({ name: k, value: v })));

      const { data: pacRec } = await supabase
        .from('paciente')
        .select('id_paciente, usuario:usuario(nombre, apellido, email), fecha_registro')
        .order('fecha_registro', { ascending: false })
        .limit(5);

      setRecentPatients(
        (pacRec ?? []).map((p: Record<string, unknown>) => {
          const usuario = p.usuario as Record<string, string> | null;
          return {
            idPaciente: p.id_paciente as string,
            nombre: usuario?.nombre ?? '',
            apellido: usuario?.apellido ?? '',
            email: usuario?.email ?? '',
            fechaRegistro: p.fecha_registro as string,
          };
        })
      );

      let citasQuery = supabase
        .from('cita')
        .select(
          'id_cita, fecha_hora, motivo, estado, ' +
          'paciente:paciente(id_paciente, usuario:usuario(nombre, apellido)), ' +
          'doctor:doctor(id_doctor, usuario:usuario(nombre, apellido), especialidad:especialidad(nombre))'
        )
        .gte('fecha_hora', now.toISOString())
        .order('fecha_hora')
        .limit(10);

      if (isDoctor) citasQuery = citasQuery.eq('id_doctor', userId);
      else if (userRole === 'PACIENTE') citasQuery = citasQuery.eq('id_paciente', userId);

      const { data: citasProx } = await citasQuery;

      setUpcomingAppointments(
        (citasProx ?? []).map((c: Record<string, unknown>) => {
          const paciente = c.paciente as Record<string, unknown> | null;
          const pacUsuario = paciente?.usuario as Record<string, string> | null;
          const doctor = c.doctor as Record<string, unknown> | null;
          const docUsuario = doctor?.usuario as Record<string, string> | null;
          const especialidad = doctor?.especialidad as Record<string, string> | null;
          return {
            idCita: c.id_cita as number,
            fechaHora: c.fecha_hora as string,
            motivo: c.motivo as string | null,
            estado: c.estado as string,
            pacienteNombre: pacUsuario?.nombre ?? '',
            pacienteApellido: pacUsuario?.apellido ?? '',
            doctorNombre: docUsuario?.nombre ?? '',
            doctorApellido: docUsuario?.apellido ?? '',
            especialidad: especialidad?.nombre ?? '',
          };
        })
      );

      if (isAdmin || isDoctor) {
        const { data: iaData } = await supabase
          .from('diagnostico_ia')
          .select('id_diagnostico_ia, estado_validacion');

        const iaStats: AiActivity = {
          totalDiagnostico: iaData?.length ?? 0,
          pendientes: 0,
          aceptados: 0,
          rechazados: 0,
          modificados: 0,
          tasaAceptacion: 0,
        };

        for (const d of iaData ?? []) {
          if (d.estado_validacion === 'PENDIENTE') iaStats.pendientes++;
          else if (d.estado_validacion === 'ACEPTADO') iaStats.aceptados++;
          else if (d.estado_validacion === 'RECHAZADO') iaStats.rechazados++;
          else if (d.estado_validacion === 'MODIFICADO') iaStats.modificados++;
        }

        if (iaStats.totalDiagnostico > 0) {
          iaStats.tasaAceptacion = Math.round(
            ((iaStats.aceptados + iaStats.modificados) / iaStats.totalDiagnostico) * 100
          );
        }

        setAiActivity(iaStats);
      }

      if (isAdmin || userRole === 'RECEPCIONISTA') {
        const { data: citasMes } = await supabase
          .from('cita')
          .select('fecha_hora, estado')
          .gte('fecha_hora', monthStart)
          .order('fecha_hora');

        const reportMap: Record<string, AppointmentReportRow> = {};
        for (const c of citasMes ?? []) {
          const fecha = new Date(c.fecha_hora).toISOString().split('T')[0];
          if (!reportMap[fecha]) {
            reportMap[fecha] = { fecha, total: 0, pendientes: 0, confirmadas: 0, atendidas: 0, canceladas: 0 };
          }
          reportMap[fecha].total++;
          if (c.estado === 'PENDIENTE') reportMap[fecha].pendientes++;
          else if (c.estado === 'CONFIRMADA') reportMap[fecha].confirmadas++;
          else if (c.estado === 'ATENDIDA') reportMap[fecha].atendidas++;
          else if (c.estado === 'CANCELADA') reportMap[fecha].canceladas++;
        }
        setAppointmentReport(Object.values(reportMap).sort((a, b) => a.fecha.localeCompare(b.fecha)));
      }

      if (isAdmin) {
        const { data: doctorCitas } = await supabase
          .from('cita')
          .select(
            'id_doctor, estado, ' +
            'doctor:doctor(usuario:usuario(nombre, apellido), especialidad:especialidad(nombre))'
          );

        const docMap: Record<string, { nombre: string; apellido: string; especialidad: string; total: number; atendidas: number }> = {};
        for (const c of doctorCitas ?? []) {
          const doc = c.doctor as Record<string, unknown> | null;
          const docUsuario = doc?.usuario as Record<string, string> | null;
          const esp = doc?.especialidad as Record<string, string> | null;
          const id = c.id_doctor as string;
          if (!docMap[id]) {
            docMap[id] = {
              nombre: docUsuario?.nombre ?? '',
              apellido: docUsuario?.apellido ?? '',
              especialidad: esp?.nombre ?? '',
              total: 0,
              atendidas: 0,
            };
          }
          docMap[id].total++;
          if (c.estado === 'ATENDIDA') docMap[id].atendidas++;
        }

        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        setProductivity(
          Object.entries(docMap).map(([id, d]) => ({
            doctorId: id,
            nombre: d.nombre,
            apellido: d.apellido,
            especialidad: d.especialidad,
            totalCitas: d.total,
            citasAtendidas: d.atendidas,
            promedioDiario: Math.round((d.total / daysInMonth) * 10) / 10,
          }))
        );
      }

      if (isAdmin || userRole === 'RECEPCIONISTA') {
        const { data: pacData } = await supabase
          .from('paciente')
          .select('sexo, fecha_nacimiento, grupo_sanguineo');

        const sexoMap: Record<string, number> = {};
        const edadBuckets: Record<string, number> = { '0-17': 0, '18-30': 0, '31-50': 0, '51-70': 0, '70+': 0 };
        const sangreMap: Record<string, number> = {};

        for (const p of pacData ?? []) {
          sexoMap[p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'Otro'] =
            (sexoMap[p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'Otro'] ?? 0) + 1;

          const birth = new Date(p.fecha_nacimiento);
          const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          if (age < 18) edadBuckets['0-17']++;
          else if (age <= 30) edadBuckets['18-30']++;
          else if (age <= 50) edadBuckets['31-50']++;
          else if (age <= 70) edadBuckets['51-70']++;
          else edadBuckets['70+']++;

          sangreMap[p.grupo_sanguineo ?? 'N/D'] = (sangreMap[p.grupo_sanguineo ?? 'N/D'] ?? 0) + 1;
        }

        setDemographics({
          porSexo: Object.entries(sexoMap).map(([k, v]) => ({ name: k, value: v })),
          porEdad: Object.entries(edadBuckets).map(([k, v]) => ({ name: k, value: v })),
          porGrupoSanguineo: Object.entries(sangreMap).map(([k, v]) => ({ name: k, value: v })),
        });
      }

      if (isAdmin || isDoctor) {
        const { data: diagData } = await supabase
          .from('diagnostico')
          .select('cie10:diagnosticos_cie10(clave, descripcion)');

        const cie10Map: Record<string, { descripcion: string; total: number }> = {};
        for (const d of diagData ?? []) {
          const cie = d.cie10 as Record<string, string> | null;
          if (!cie?.clave) continue;
          if (!cie10Map[cie.clave]) {
            cie10Map[cie.clave] = { descripcion: cie.descripcion ?? '', total: 0 };
          }
          cie10Map[cie.clave].total++;
        }

        setEpidemiologic(
          Object.entries(cie10Map)
            .map(([clave, d]) => ({ claveCie10: clave, descripcion: d.descripcion, totalDiagnosticos: d.total }))
            .sort((a, b) => b.totalDiagnosticos - a.totalDiagnosticos)
            .slice(0, 10)
        );
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    loading,
    error,
    stats,
    appointmentsByDay,
    appointmentsByStatus,
    specialtyData,
    recentPatients,
    upcomingAppointments,
    aiActivity,
    appointmentReport,
    productivity,
    demographics,
    epidemiologic,
    refetch: fetchAll,
  };
}
