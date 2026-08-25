import { useState } from 'react';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Pagination from '../../../components/ui/Pagination';

interface Patient {
  id_paciente: string;
  nombre: string;
  apellido: string;
  ci: string;
  sexo: string;
  activo: boolean;
}

const MOCK_PATIENTS: Patient[] = [
  { id_paciente: '1', nombre: 'Juan', apellido: 'Perez', ci: '12345678', sexo: 'M', activo: true },
  { id_paciente: '2', nombre: 'Maria', apellido: 'Gonzalez', ci: '23456789', sexo: 'F', activo: true },
  { id_paciente: '3', nombre: 'Carlos', apellido: 'Lopez', ci: '34567890', sexo: 'M', activo: false },
  { id_paciente: '4', nombre: 'Ana', apellido: 'Martinez', ci: '45678901', sexo: 'F', activo: true },
  { id_paciente: '5', nombre: 'Pedro', apellido: 'Rodriguez', ci: '56789012', sexo: 'M', activo: true },
  { id_paciente: '6', nombre: 'Laura', apellido: 'Hernandez', ci: '67890123', sexo: 'F', activo: false },
  { id_paciente: '7', nombre: 'Diego', apellido: 'Garcia', ci: '78901234', sexo: 'M', activo: true },
  { id_paciente: '8', nombre: 'Sofia', apellido: 'Fernandez', ci: '89012345', sexo: 'F', activo: true },
];

export default function TableShowcase() {
  const [selected, setSelected] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <section aria-label="DataTable">
      {/* Basica */}
      <div className="mb-6">
        <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Basica con sorting</p>
        <DataTable
          data={MOCK_PATIENTS}
          keyField="id_paciente"
          onRowClick={(row) => console.log('Row click:', row)}
        >
          <DataTable.Column header="Nombre" sortKey="nombre">
            {(row) => `${row.nombre} ${row.apellido}`}
          </DataTable.Column>
          <DataTable.Column header="CI" sortKey="ci">
            {(row) => row.ci}
          </DataTable.Column>
          <DataTable.Column header="Sexo" sortKey="sexo" align="center">
            {(row) => row.sexo}
          </DataTable.Column>
          <DataTable.Column header="Estado" sortKey="activo" align="center">
            {(row) => (
              <Badge variant={row.activo ? 'success' : 'neutral'}>
                {row.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            )}
          </DataTable.Column>
          <DataTable.Column header="Acciones" align="right">
            {() => <Button size="sm" variant="ghost">Ver</Button>}
          </DataTable.Column>
        </DataTable>
      </div>

      {/* Con seleccion */}
      <div className="mb-6">
        <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Con seleccion de filas</p>
        <DataTable
          data={MOCK_PATIENTS}
          keyField="id_paciente"
          selectable
          selectedRows={selected}
          onSelectionChange={setSelected}
        >
          <DataTable.Column header="Nombre" sortKey="nombre">
            {(row) => `${row.nombre} ${row.apellido}`}
          </DataTable.Column>
          <DataTable.Column header="CI">
            {(row) => row.ci}
          </DataTable.Column>
          <DataTable.Column header="Estado">
            {(row) => (
              <Badge variant={row.activo ? 'success' : 'neutral'}>
                {row.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            )}
          </DataTable.Column>
        </DataTable>
        {selected.length > 0 && (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{selected.length} fila(s) seleccionada(s)</p>
        )}
      </div>

      {/* Con pagination */}
      <div className="mb-6">
        <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Con paginacion</p>
        <DataTable
          data={MOCK_PATIENTS.slice(0, 4)}
          keyField="id_paciente"
          pagination={
            <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
          }
        >
          <DataTable.Column header="Nombre" sortKey="nombre">
            {(row) => `${row.nombre} ${row.apellido}`}
          </DataTable.Column>
          <DataTable.Column header="CI">
            {(row) => row.ci}
          </DataTable.Column>
        </DataTable>
      </div>

      {/* Loading */}
      <div className="mb-6">
        <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Loading state</p>
        <DataTable data={[]} loading>
          <DataTable.Column header="Nombre">{() => null}</DataTable.Column>
          <DataTable.Column header="CI">{() => null}</DataTable.Column>
          <DataTable.Column header="Estado">{() => null}</DataTable.Column>
        </DataTable>
      </div>

      {/* Empty */}
      <div>
        <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Empty state</p>
        <DataTable
          data={[]}
          emptyTitle="No hay pacientes"
          emptyDescription="Aun no se registraron pacientes en el sistema."
        >
          <DataTable.Column header="Nombre">{() => null}</DataTable.Column>
          <DataTable.Column header="CI">{() => null}</DataTable.Column>
        </DataTable>
      </div>
    </section>
  );
}
