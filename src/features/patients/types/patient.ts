export interface Patient {
  id_paciente: string;
  ci: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F' | 'O';
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  grupo_sanguineo: string | null;
  fecha_registro: string;
  fecha_actualizacion: string;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  } | null;
  alergias?: PatientAlergia[];
  medicamentos?: PatientMedicamento[];
}

export interface PatientAlergia {
  id_alergia: number;
  nombre: string;
  observacion: string | null;
}

export interface PatientMedicamento {
  id_medicamento: number;
  nombre: string;
  dosis: string | null;
  indicacion: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
}

export interface PatientFormData {
  ci: string;
  nombre: string;
  apellido: string;
  email: string;
  fecha_nacimiento: string;
  sexo: 'M' | 'F' | 'O';
  telefono: string;
  direccion: string;
  ciudad: string;
  grupo_sanguineo: string;
}

export interface PatientFilter {
  search: string;
  sexo: string;
  ciudad: string;
  grupo_sanguineo: string;
}

export interface Expediente {
  id_expediente: number;
  id_paciente: string;
  fecha_creacion: string;
  observaciones: string | null;
}
