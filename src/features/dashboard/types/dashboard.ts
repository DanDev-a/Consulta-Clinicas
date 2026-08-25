export interface StatCardData {
  label: string;
  value: number | string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'accent' | 'success' | 'danger' | 'warning';
}

export interface AppointmentByDay {
  name: string;
  citas: number;
}

export interface AppointmentByStatus {
  name: string;
  value: number;
}

export interface SpecialtyData {
  name: string;
  value: number;
}

export interface RecentPatient {
  idPaciente: string;
  nombre: string;
  apellido: string;
  email: string;
  fechaRegistro: string;
}

export interface UpcomingAppointment {
  idCita: number;
  fechaHora: string;
  motivo: string | null;
  estado: string;
  pacienteNombre: string;
  pacienteApellido: string;
  doctorNombre: string;
  doctorApellido: string;
  especialidad: string;
}

export interface AiActivity {
  totalDiagnostico: number;
  pendientes: number;
  aceptados: number;
  rechazados: number;
  modificados: number;
  tasaAceptacion: number;
}

export interface AppointmentReportRow {
  fecha: string;
  total: number;
  pendientes: number;
  confirmadas: number;
  atendidas: number;
  canceladas: number;
}

export interface ProductivityRow {
  doctorId: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  totalCitas: number;
  citasAtendidas: number;
  promedioDiario: number;
}

export interface DemographicData {
  porSexo: { name: string; value: number }[];
  porEdad: { name: string; value: number }[];
  porGrupoSanguineo: { name: string; value: number }[];
}

export interface EpidemiologicRow {
  claveCie10: string;
  descripcion: string;
  totalDiagnosticos: number;
}
