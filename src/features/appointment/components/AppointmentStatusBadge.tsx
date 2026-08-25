import { Badge } from '../../../components/ui';
import type { AppointmentStatus } from '../types/appointment';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

const statusConfig: Record<AppointmentStatus, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' }> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  CONFIRMADA: { label: 'Confirmada', variant: 'info' },
  ATENDIDA: { label: 'Atendida', variant: 'success' },
  CANCELADA: { label: 'Cancelada', variant: 'danger' },
};

export default function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: 'neutral' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
