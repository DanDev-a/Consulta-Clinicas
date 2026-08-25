import { DataTable, Pagination, Badge } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { RiUserLine } from 'react-icons/ri';
import type { Patient } from '../types/patient';

interface PatientTableProps {
  data: Patient[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  userRole: string | undefined;
  onDelete?: (id: string) => void;
}

const sexoLabels: Record<string, string> = { M: 'Masculino', F: 'Femenino', O: 'Otro' };

export default function PatientTable({ data, loading, page, totalPages, onPageChange, userRole, onDelete }: PatientTableProps) {
  const navigate = useNavigate();
  const canDelete = userRole === 'ADMIN';

  return (
    <DataTable
      data={data as unknown as Record<string, unknown>[]}
      keyField="id_paciente"
      loading={loading}
      emptyTitle="No hay pacientes"
      emptyDescription="No se encontraron pacientes con los filtros aplicados."
      onRowClick={(row) => navigate(`/app/patient/${row.id_paciente}`)}
      pagination={<Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />}
    >
      <DataTable.Column header="Nombre" sortKey="nombre">
        {(row) => {
          const u = (row as Patient).usuario;
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center">
                <RiUserLine className="text-[var(--color-accent)]" />
              </div>
              <span className="font-medium">{u?.nombre} {u?.apellido}</span>
            </div>
          );
        }}
      </DataTable.Column>
      <DataTable.Column header="Email" sortKey="email">
        {(row) => <span className="text-[var(--color-text-muted)]">{(row as Patient).usuario?.email}</span>}
      </DataTable.Column>
      <DataTable.Column header="CI" sortKey="ci">
        {(row) => <span>{(row as Patient).ci}</span>}
      </DataTable.Column>
      <DataTable.Column header="Sexo" sortKey="sexo">
        {(row) => <Badge variant="neutral">{sexoLabels[(row as Patient).sexo] ?? (row as Patient).sexo}</Badge>}
      </DataTable.Column>
      <DataTable.Column header="Teléfono">
        {(row) => <span className="text-[var(--color-text-muted)]">{(row as Patient).telefono ?? '—'}</span>}
      </DataTable.Column>
      <DataTable.Column header="Ciudad">
        {(row) => <span className="text-[var(--color-text-muted)]">{(row as Patient).ciudad ?? '—'}</span>}
      </DataTable.Column>
      {canDelete && (
        <DataTable.Column header="Acciones">
          {(row) => (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.((row as Patient).id_paciente); }}
              className="text-[var(--color-danger)] hover:underline text-sm cursor-pointer"
            >
              Eliminar
            </button>
          )}
        </DataTable.Column>
      )}
    </DataTable>
  );
}
