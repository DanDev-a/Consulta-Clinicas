export type AppointmentStatus = 'PENDIENTE' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA';

export interface Appointment {
  id_cita: number;
  id_paciente: string;
  id_doctor: string;
  id_expediente: number;
  fecha_hora: string;
  motivo: string | null;
  estado: AppointmentStatus;
  fecha_creacion: string;
  paciente?: {
    id_paciente: string;
    usuario: {
      nombre: string;
      apellido: string;
    } | null;
  } | null;
  doctor?: {
    id_doctor: string;
    usuario: {
      nombre: string;
      apellido: string;
    } | null;
    especialidad?: {
      nombre: string;
    } | null;
  } | null;
}

export interface AppointmentFormData {
  id_paciente: string;
  id_doctor: string;
  fecha_hora: string;
  motivo: string;
}

export interface AppointmentFilter {
  search: string;
  estado: string;
  id_doctor: string;
  fecha_desde: string;
  fecha_hasta: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  estado: AppointmentStatus;
  resource: Appointment;
}
