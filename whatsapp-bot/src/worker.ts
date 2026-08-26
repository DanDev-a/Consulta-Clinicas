import { supabase } from './supabase.js';
import { sendText, isOnWhatsApp } from './wa.js';
import { config } from './config.js';

interface RecordatorioRow {
  id_recordatorio: number;
  id_cita: number;
  tipo: string;
  mensaje: string;
  fecha_programada: string;
  estado: string;
  intentos: number;
  cita?: {
    id_paciente: string;
    fecha_hora: string;
    paciente?: {
      id_paciente: string;
      telefono: string | null;
      usuario?: {
        nombre: string;
        apellido: string;
      } | null;
    } | null;
    doctor?: {
      usuario?: {
        nombre: string;
        apellido: string;
      } | null;
    } | null;
  } | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPendingRecordatorios(): Promise<RecordatorioRow[]> {
  const { data, error } = await supabase
    .from('recordatorio')
    .select(`
      id_recordatorio, id_cita, tipo, mensaje, fecha_programada, estado, intentos,
      cita:cita(
        id_paciente, fecha_hora,
        paciente:paciente(
          id_paciente, telefono,
          usuario:usuario(nombre, apellido)
        ),
        doctor:doctor(
          usuario:usuario(nombre, apellido)
        )
      )
    `)
    .eq('estado', 'PENDIENTE')
    .lte('fecha_programada', new Date().toISOString())
    .lt('intentos', config.maxRetries)
    .order('fecha_programada', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching recordatorios:', error.message);
    return [];
  }

  return (data ?? []) as unknown as RecordatorioRow[];
}

async function processRecordatorio(rec: RecordatorioRow): Promise<void> {
  const telefono = rec.cita?.paciente?.telefono;
  const nombrePaciente = rec.cita?.paciente?.usuario
    ? `${rec.cita.paciente.usuario.nombre} ${rec.cita.paciente.usuario.apellido}`
    : 'Paciente';
  const nombreDoctor = rec.cita?.doctor?.usuario
    ? `Dr. ${rec.cita.doctor.usuario.nombre} ${rec.cita.doctor.usuario.apellido}`
    : 'el doctor';
  const fechaCita = rec.cita?.fecha_hora
    ? new Date(rec.cita.fecha_hora).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  let mensaje = rec.mensaje;
  mensaje = mensaje.replace('{nombre_paciente}', nombrePaciente);
  mensaje = mensaje.replace('{doctor}', nombreDoctor);
  mensaje = mensaje.replace('{fecha}', fechaCita);
  mensaje = mensaje.replace('{hora}', fechaCita);

  if (!telefono) {
    await supabase
      .from('recordatorio')
      .update({ estado: 'FALLIDO', intentos: rec.intentos + 1 })
      .eq('id_recordatorio', rec.id_recordatorio);

    await supabase.from('whatsapp_log').insert({
      id_paciente: rec.cita?.paciente?.id_paciente ?? null,
      id_cita: rec.id_cita,
      tipo: rec.tipo,
      mensaje,
      phone_number: 'SIN_TELEFONO',
      estado: 'FALLIDO',
      error_message: 'Paciente sin teléfono registrado',
    });
    return;
  }

  const exists = await isOnWhatsApp(telefono);
  if (!exists) {
    await supabase
      .from('recordatorio')
      .update({ estado: 'FALLIDO', intentos: rec.intentos + 1 })
      .eq('id_recordatorio', rec.id_recordatorio);

    await supabase.from('whatsapp_log').insert({
      id_paciente: rec.cita?.paciente?.id_paciente ?? null,
      id_cita: rec.id_cita,
      tipo: rec.tipo,
      mensaje,
      phone_number: telefono,
      estado: 'NO_WHATSAPP',
      error_message: 'Número no registrado en WhatsApp',
    });
    return;
  }

  const result = await sendText(telefono, mensaje);

  if (result.success) {
    await supabase
      .from('recordatorio')
      .update({
        estado: 'ENVIADO',
        fecha_envio_real: new Date().toISOString(),
        intentos: rec.intentos + 1,
      })
      .eq('id_recordatorio', rec.id_recordatorio);

    await supabase.from('whatsapp_log').insert({
      id_paciente: rec.cita?.paciente?.id_paciente ?? null,
      id_cita: rec.id_cita,
      tipo: rec.tipo,
      mensaje,
      phone_number: telefono,
      wa_message_id: result.messageId ?? null,
      estado: 'ENVIADO',
    });
  } else {
    const newAttempts = rec.intentos + 1;
    await supabase
      .from('recordatorio')
      .update({ intentos: newAttempts })
      .eq('id_recordatorio', rec.id_recordatorio);

    await supabase.from('whatsapp_log').insert({
      id_paciente: rec.cita?.paciente?.id_paciente ?? null,
      id_cita: rec.id_cita,
      tipo: rec.tipo,
      mensaje,
      phone_number: telefono,
      estado: 'FALLIDO',
      error_message: result.error ?? 'Error desconocido',
    });
  }
}

export async function processPending(): Promise<void> {
  const recordatorios = await fetchPendingRecordatorios();
  if (recordatorios.length === 0) return;

  console.log(`📨 Procesando ${recordatorios.length} recordatorio(s)...`);

  for (const rec of recordatorios) {
    try {
      await processRecordatorio(rec);
      await sleep(config.messageDelayMs);
    } catch (err) {
      console.error(`Error procesando recordatorio ${rec.id_recordatorio}:`, err);
    }
  }
}

let workerInterval: NodeJS.Timeout | null = null;

export function startWorker(intervalMs?: number): NodeJS.Timeout {
  const interval = intervalMs ?? config.workerIntervalMs;
  console.log(`🔄 Worker iniciado — cada ${interval / 1000}s`);

  processPending();

  workerInterval = setInterval(() => {
    processPending();
  }, interval);

  return workerInterval;
}

export function stopWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('🛑 Worker detenido');
  }
}
