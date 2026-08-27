export interface Especialidad {
  id_especialidad: number;
  nombre: string;
  descripcion: string | null;
}

export interface DoctorInfo {
  id_doctor: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  id_especialidad: number;
}

export interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

export interface BookingWizardState {
  step: 1 | 2 | 3 | 4;
  especialidad: Especialidad | null;
  doctor: DoctorInfo | null;
  date: string;
  time: string;
  motivo: string;
}

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];
