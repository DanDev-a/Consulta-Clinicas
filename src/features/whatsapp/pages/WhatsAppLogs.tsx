import { Card, Input, Select, EmptyState, Pagination } from '../../../components/ui';
import { RiWhatsappLine } from 'react-icons/ri';
import WhatsAppStatusBadge from '../components/WhatsAppStatusBadge';
import type { WhatsAppLog, WhatsAppLogFilter } from '../types/whatsapp';

interface WhatsAppLogsProps {
  logs: WhatsAppLog[];
  totalLogs: number;
  logPage: number;
  pageSize: number;
  filters: WhatsAppLogFilter;
  loading: boolean;
  onFilterChange: (filters: WhatsAppLogFilter) => void;
  onPageChange: (page: number) => void;
}

const TIPO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'CONFIRMACION', label: 'Confirmación' },
  { value: 'RECORDATORIO', label: 'Recordatorio' },
  { value: 'SEGUIMIENTO', label: 'Seguimiento' },
];

const ESTADO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'FALLIDO', label: 'Fallido' },
  { value: 'NO_WHATSAPP', label: 'Sin WhatsApp' },
];

export default function WhatsAppLogs({
  logs, totalLogs, logPage, pageSize, filters, loading,
  onFilterChange, onPageChange,
}: WhatsAppLogsProps) {
  const totalPages = Math.ceil(totalLogs / pageSize);

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Log de Mensajes WhatsApp</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          label="Buscar"
          value={filters.search}
          onChange={e => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Teléfono o mensaje..."
        />
        <Select
          label="Tipo"
          options={TIPO_OPTIONS}
          value={filters.tipo}
          onChange={e => onFilterChange({ ...filters, tipo: e.target.value })}
        />
        <Select
          label="Estado"
          options={ESTADO_OPTIONS}
          value={filters.estado}
          onChange={e => onFilterChange({ ...filters, estado: e.target.value })}
        />
        <Input
          label="Desde"
          type="date"
          value={filters.fecha_desde}
          onChange={e => onFilterChange({ ...filters, fecha_desde: e.target.value })}
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-[var(--color-text-muted)]">Cargando...</div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={RiWhatsappLine}
          title="Sin mensajes"
          description="No se encontraron mensajes WhatsApp con los filtros aplicados"
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-light)]">
                  <th className="text-left py-3 px-2 text-[var(--color-text-muted)] font-medium">Fecha</th>
                  <th className="text-left py-3 px-2 text-[var(--color-text-muted)] font-medium">Paciente</th>
                  <th className="text-left py-3 px-2 text-[var(--color-text-muted)] font-medium">Tipo</th>
                  <th className="text-left py-3 px-2 text-[var(--color-text-muted)] font-medium">Teléfono</th>
                  <th className="text-left py-3 px-2 text-[var(--color-text-muted)] font-medium">Estado</th>
                  <th className="text-left py-3 px-2 text-[var(--color-text-muted)] font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const usuario = (log as any).paciente?.usuario;
                  const nombrePaciente = usuario ? `${usuario.nombre} ${usuario.apellido}` : '—';
                  return (
                    <tr key={log.id} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-alt)]">
                      <td className="py-3 px-2">{new Date(log.fecha_envio).toLocaleString('es-AR')}</td>
                      <td className="py-3 px-2 font-medium">{nombrePaciente}</td>
                      <td className="py-3 px-2">{log.tipo}</td>
                      <td className="py-3 px-2 font-mono text-xs">{log.phone_number}</td>
                      <td className="py-3 px-2"><WhatsAppStatusBadge estado={log.estado} /></td>
                      <td className="py-3 px-2 text-xs text-[var(--color-text-muted)] max-w-[200px] truncate">
                        {log.error_message ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                currentPage={logPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
}
