export interface WhatsAppConfig {
  id: number;
  phone_number_id: string;
  token: string;
  numero_display: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface WhatsAppLog {
  id: number;
  id_paciente: string | null;
  id_cita: number | null;
  tipo: 'CONFIRMACION' | 'RECORDATORIO' | 'SEGUIMIENTO';
  mensaje: string;
  phone_number: string;
  wa_message_id: string | null;
  estado: 'PENDIENTE' | 'ENVIADO' | 'ENTREGADO' | 'FALLIDO' | 'NO_WHATSAPP';
  error_message: string | null;
  fecha_envio: string;
  paciente?: {
    usuario?: {
      nombre: string;
      apellido: string;
    } | null;
  } | null;
}

export interface WhatsAppConfigFormData {
  phone_number_id: string;
  token: string;
  numero_display: string;
  activo: boolean;
}

export interface WhatsAppLogFilter {
  search: string;
  tipo: string;
  estado: string;
  fecha_desde: string;
  fecha_hasta: string;
}
