import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Button, Spinner, Alert } from '../../../components/ui';
import { RiArrowLeftLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import PatientDetail from '../components/PatientDetail';
import PatientForm from '../components/PatientForm';
import { usePatients } from '../hooks/usePatients';
import type { Patient, PatientFormData } from '../types/patient';

interface PatientDetailPageProps {
  userRole: string | undefined;
  userId: string | undefined;
}

export default function PatientDetailPage({ userRole, userId }: PatientDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const { getPatientById, updatePatient, updateExpediente } = usePatients(userRole, userId);

  const isAdmin = userRole === 'ADMIN';
  const isDoctor = userRole === 'DOCTOR';
  const canEdit = isAdmin || isDoctor;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const p = await getPatientById(id);
      if (p) setPatient(p);
      else setError('Paciente no encontrado');
      setLoading(false);
    };
    load();
  }, [id, getPatientById]);

  const handleEdit = async (data: PatientFormData): Promise<boolean> => {
    if (!id) return false;
    const ok = await updatePatient(id, data);
    if (ok) {
      toast.success('Paciente actualizado');
      const updated = await getPatientById(id);
      if (updated) setPatient(updated);
    } else {
      toast.error('Error al actualizar');
    }
    return ok;
  };

  const handleExpedienteUpdate = async (observaciones: string): Promise<boolean> => {
    if (!id) return false;
    return await updateExpediente(id, observaciones);
  };

  const toFormData = (p: Patient): PatientFormData => ({
    ci: p.ci,
    nombre: p.usuario?.nombre ?? '',
    apellido: p.usuario?.apellido ?? '',
    email: p.usuario?.email ?? '',
    fecha_nacimiento: p.fecha_nacimiento,
    sexo: p.sexo,
    telefono: p.telefono ?? '',
    direccion: p.direccion ?? '',
    ciudad: p.ciudad ?? '',
    grupo_sanguineo: p.grupo_sanguineo ?? '',
  });

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (error || !patient) return <Alert variant="danger">{error ?? 'Paciente no encontrado'}</Alert>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${patient.usuario?.nombre} ${patient.usuario?.apellido}`}
        subtitle={`CI: ${patient.ci} — ${patient.usuario?.email}`}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/app/patient')}><RiArrowLeftLine className="mr-1" />Volver</Button>
            {canEdit && <Button onClick={() => setShowEditForm(true)}>Editar</Button>}
          </div>
        }
      />

      <PatientDetail patient={patient} userRole={userRole} onExpedienteUpdate={handleExpedienteUpdate} />

      <PatientForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleEdit}
        initialData={toFormData(patient)}
        mode="edit"
      />
    </div>
  );
}
