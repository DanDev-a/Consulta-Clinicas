import { PageHeader } from '../../../components/ui';

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Registro de auditoría del sistema"
      />
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-[var(--color-text-muted)]">Próximamente</p>
      </div>
    </div>
  );
}
