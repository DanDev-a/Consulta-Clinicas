import { Badge } from '../../../components/ui';

interface WhatsAppStatusBadgeProps {
  estado: string;
}

const STATUS_MAP: Record<string, { variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral'; label: string }> = {
  ENVIADO: { variant: 'success', label: 'Enviado' },
  ENTREGADO: { variant: 'success', label: 'Entregado' },
  PENDIENTE: { variant: 'warning', label: 'Pendiente' },
  FALLIDO: { variant: 'danger', label: 'Fallido' },
  NO_WHATSAPP: { variant: 'danger', label: 'Sin WhatsApp' },
  CONNECTED: { variant: 'success', label: 'Conectado' },
  DISCONNECTED: { variant: 'danger', label: 'Desconectado' },
  WAITING_QR: { variant: 'warning', label: 'Esperando QR' },
  RECONNECTING: { variant: 'warning', label: 'Reconectando' },
  LOGGED_OUT: { variant: 'danger', label: 'Deslogueado' },
  REPLACED: { variant: 'danger', label: 'Reemplazado' },
};

export default function WhatsAppStatusBadge({ estado }: WhatsAppStatusBadgeProps) {
  const config = STATUS_MAP[estado] ?? { variant: 'neutral' as const, label: estado };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
