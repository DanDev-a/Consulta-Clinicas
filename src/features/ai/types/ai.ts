export interface DiagnosticoIA {
  id_diagnostico_ia: number;
  id_expediente: number;
  id_diagnostico: number | null;
  id_cie10_sugerido: number | null;
  analisis_ia: string;
  probabilidad: number | null;
  receta_sugerida: RecetaSugerida | null;
  fecha_generacion: string;
  estado_validacion: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO' | 'MODIFICADO';
  id_doctor_validador: string | null;
  fecha_validacion: string | null;
}

export interface RecetaSugerida {
  medicamentos?: RecetaMedicamento[];
  indicaciones?: string;
  duracion_dias?: number;
}

export interface RecetaMedicamento {
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

export interface DiagnosticoResultado {
  id_diagnostico_ia?: number;
  diagnosticos: DiagnosticoDiferencial[];
  estudios_sugeridos: string[];
  tratamiento_sugerido?: RecetaSugerida | null;
  urgencia: 'baja' | 'media' | 'alta' | 'critica';
}

export interface DiagnosticoDiferencial {
  nombre: string;
  cie10: string;
  probabilidad: number;
  descripcion: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatMedicoRecord {
  id_chat: number;
  id_doctor: string;
  id_diagnostico_ia: number;
  mensaje: string;
  respuesta_ia: string;
  fecha: string;
}

export interface AISession {
  id: number;
  id_doctor: string;
  id_paciente: string | null;
  modelo: string;
  tokens_input: number | null;
  tokens_output: number | null;
  costo_usd: number | null;
  started_at: string;
  ended_at: string | null;
}

export interface AIMemory {
  id: number;
  id_doctor: string | null;
  id_paciente: string | null;
  session_id: string | null;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function validateDiagnosticoResultado(raw: unknown): DiagnosticoResultado {
  const obj = raw as Record<string, unknown>;
  if (!obj || typeof obj !== 'object') throw new Error('Respuesta de IA inválida');

  const diagnosticos = Array.isArray(obj.diagnosticos) ? obj.diagnosticos : [];
  const validated = diagnosticos.map((d: any) => ({
    nombre: String(d?.nombre ?? 'Sin nombre'),
    cie10: String(d?.cie10 ?? 'S/D'),
    probabilidad: typeof d?.probabilidad === 'number' ? d.probabilidad : 0,
    descripcion: String(d?.descripcion ?? ''),
  }));

  return {
    id_diagnostico_ia: typeof obj.id_diagnostico_ia === 'number' ? obj.id_diagnostico_ia : undefined,
    diagnosticos: validated,
    estudios_sugeridos: Array.isArray(obj.estudios_sugeridos) ? obj.estudios_sugeridos.map(String) : [],
    tratamiento_sugerido: obj.tratamiento_sugerido as RecetaSugerida | null | undefined,
    urgencia: ['baja', 'media', 'alta', 'critica'].includes(obj.urgencia as string)
      ? (obj.urgencia as DiagnosticoResultado['urgencia'])
      : 'media',
  };
}
