import { useState } from 'react';
import { PageHeader, SearchInput, Button, Spinner, Alert } from '../../../components/ui';
import { RiUserAddLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import PatientTable from '../components/PatientTable';
import PatientForm from '../components/PatientForm';
import PatientFilters from '../components/PatientFilters';
import { usePatients } from '../hooks/usePatients';
import type { PatientFilter } from '../types/patient';

interface PatientPageProps {
  userRole: string | undefined;
  userId: string | undefined;
}

export default function Patient({ userRole, userId }: PatientPageProps) {
  const [showForm, setShowForm] = useState(false);
  const {
    loading, error, patients, total, page, PAGE_SIZE,
    setPage, filters, setFilters,
    createPatient, deletePatient,
  } = usePatients(userRole, userId);

  const isAdmin = userRole === 'ADMIN';
  const isRecepcionista = userRole === 'RECEPCIONISTA';
  const canCreate = isAdmin || isRecepcionista;
  const canDelete = isAdmin;

  const handleSearch = (search: string) => setFilters(prev => ({ ...prev, search }));
  const handleFilterChange = (f: PatientFilter) => { setFilters(f); setPage(1); };
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este paciente?')) return;
    const ok = await deletePatient(id);
    if (ok) toast.success('Paciente eliminado');
    else toast.error('Error al eliminar');
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        subtitle={`${total} paciente(s) registrado(s)`}
        actions={canCreate ? <Button onClick={() => setShowForm(true)}><RiUserAddLine className="mr-1" />Nuevo Paciente</Button> : undefined}
      />

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <SearchInput placeholder="Buscar por nombre, email o CI..." onSearch={handleSearch} value={filters.search} />
        </div>
        <PatientFilters filters={filters} onChange={handleFilterChange} />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && patients.length === 0 ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <PatientTable
          data={patients}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          userRole={userRole}
          onDelete={canDelete ? handleDelete : undefined}
        />
      )}

      <PatientForm isOpen={showForm} onClose={() => setShowForm(false)} onSubmit={createPatient} mode="create" />
    </div>
  );
}
