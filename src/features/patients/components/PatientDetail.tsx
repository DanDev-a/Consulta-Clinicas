import { useEffect, useState } from 'react';
import { Tabs, Card, Badge, Alert, Button, Textarea } from '../../../components/ui';
import { RiEditLine, RiCheckLine, RiCloseLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { supabase } from '../../../config/supabaseClient';
import type { Patient, PatientAlergia, PatientMedicamento, Expediente } from '../types/patient';

interface PatientDetailProps {
  patient: Patient;
  userRole: string | undefined;
  onExpedienteUpdate?: (observaciones: string) => Promise<boolean>;
}

export default function PatientDetail({ patient, userRole, onExpedienteUpdate }: PatientDetailProps) {
  const [alergias, setAlergias] = useState<PatientAlergia[]>([]);
  const [medicamentos, setMedicamentos] = useState<PatientMedicamento[]>([]);
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [citasCount, setCitasCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingExpediente, setEditingExpediente] = useState(false);
  const [expedienteObs, setExpedienteObs] = useState('');
  const [savingExpediente, setSavingExpediente] = useState(false);

  const canEditExpediente = userRole === 'ADMIN' || userRole === 'DOCTOR';

  useEffect(() => {
    const load = async () => {
      const [alergiasRes, medsRes, expRes, citasRes] = await Promise.all([
        supabase.from('paciente_alergia').select('alergia:alergia(id_alergia, nombre), observacion').eq('id_paciente', patient.id_paciente),
        supabase.from('paciente_medicamento').select('medicamento:medicamento(id_medicamento, nombre), dosis, indicacion, fecha_inicio, fecha_fin').eq('id_paciente', patient.id_paciente),
        supabase.from('expediente').select('*').eq('id_paciente', patient.id_paciente).single(),
        supabase.from('cita').select('id_cita', { count: 'exact', head: true }).eq('id_paciente', patient.id_paciente),
      ]);

      setAlergias((alergiasRes.data ?? []).map((a: Record<string, unknown>) => {
        const alergia = a.alergia as Record<string, unknown> | null;
        return { id_alergia: alergia?.id_alergia as number, nombre: alergia?.nombre as string, observacion: a.observacion as string | null };
      }));

      setMedicamentos((medsRes.data ?? []).map((m: Record<string, unknown>) => {
        const med = m.medicamento as Record<string, unknown> | null;
        return { id_medicamento: med?.id_medicamento as number, nombre: med?.nombre as string, dosis: m.dosis as string | null, indicacion: m.indicacion as string | null, fecha_inicio: m.fecha_inicio as string, fecha_fin: m.fecha_fin as string | null };
      }));

      setExpediente(expRes.data as Expediente | null);
      setCitasCount(citasRes.count ?? 0);
      setLoading(false);
    };
    load();
  }, [patient.id_paciente]);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-[var(--color-bg-secondary)] rounded-2xl animate-pulse" />)}</div>;

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  const handleEditExpediente = () => {
    setExpedienteObs(expediente?.observaciones ?? '');
    setEditingExpediente(true);
  };

  const handleSaveExpediente = async () => {
    if (!onExpedienteUpdate) return;
    setSavingExpediente(true);
    const ok = await onExpedienteUpdate(expedienteObs);
    setSavingExpediente(false);
    if (ok) {
      setExpediente(prev => prev ? { ...prev, observaciones: expedienteObs } : null);
      setEditingExpediente(false);
      toast.success('Expediente actualizado');
    } else {
      toast.error('Error al actualizar expediente');
    }
  };

  const handleCancelEditExpediente = () => {
    setEditingExpediente(false);
    setExpedienteObs('');
  };

  return (
    <Tabs defaultActiveTab="info">
      <Tabs.List>
        <Tabs.Tab value="info" label="Información Personal" />
        <Tabs.Tab value="alergias" label={`Alergias (${alergias.length})`} />
        <Tabs.Tab value="medicamentos" label={`Medicamentos (${medicamentos.length})`} />
        <Tabs.Tab value="expediente" label="Expediente" />
      </Tabs.List>

      <Tabs.Panel value="info">
        <Card className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><span className="text-sm text-[var(--color-text-muted)]">Nombre</span><p className="font-medium">{patient.usuario?.nombre} {patient.usuario?.apellido}</p></div>
            <div><span className="text-sm text-[var(--color-text-muted)]">Email</span><p className="font-medium">{patient.usuario?.email}</p></div>
            <div><span className="text-sm text-[var(--color-text-muted)]">CI</span><p className="font-medium">{patient.ci}</p></div>
            <div><span className="text-sm text-[var(--color-text-muted)]">Edad</span><p className="font-medium">{calculateAge(patient.fecha_nacimiento)} años</p></div>
            <div><span className="text-sm text-[var(--color-text-muted)]">Sexo</span><p className="font-medium">{patient.sexo === 'M' ? 'Masculino' : patient.sexo === 'F' ? 'Femenino' : 'Otro'}</p></div>
            <div><span className="text-sm text-[var(--color-text-muted)]">Grupo Sanguíneo</span><p className="font-medium">{patient.grupo_sanguineo ?? 'No registrado'}</p></div>
            <div><span className="text-sm text-[var(--color-text-muted)]">Teléfono</span><p className="font-medium">{patient.telefono ?? 'No registrado'}</p></div>
            <div><span className="text-sm text-[var(--color-text-muted)]">Ciudad</span><p className="font-medium">{patient.ciudad ?? 'No registrada'}</p></div>
            <div><span className="text-sm text-[var(--color-text-muted)]">Dirección</span><p className="font-medium">{patient.direccion ?? 'No registrada'}</p></div>
            <div><span className="text-sm text-[var(--color-text-muted)]">Total Citas</span><p className="font-medium">{citasCount}</p></div>
          </div>
        </Card>
      </Tabs.Panel>

      <Tabs.Panel value="alergias">
        <Card className="p-6">
          {alergias.length === 0 ? (
            <Alert variant="info">No tiene alergias registradas</Alert>
          ) : (
            <ul className="space-y-2">
              {alergias.map((a, i) => (
                <li key={i} className="flex items-center gap-2 p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                  <Badge variant="danger">⚠️</Badge>
                  <div>
                    <span className="font-medium">{a.nombre}</span>
                    {a.observacion && <span className="text-[var(--color-text-muted)] text-sm ml-2">— {a.observacion}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Tabs.Panel>

      <Tabs.Panel value="medicamentos">
        <Card className="p-6">
          {medicamentos.length === 0 ? (
            <Alert variant="info">No tiene medicamentos registrados</Alert>
          ) : (
            <ul className="space-y-2">
              {medicamentos.map((m, i) => (
                <li key={i} className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                  <div className="font-medium">{m.nombre}</div>
                  {m.dosis && <div className="text-sm text-[var(--color-text-muted)]">Dosis: {m.dosis}</div>}
                  {m.indicacion && <div className="text-sm text-[var(--color-text-muted)]">{m.indicacion}</div>}
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">
                    Desde: {new Date(m.fecha_inicio).toLocaleDateString('es-BO')}
                    {m.fecha_fin && ` — Hasta: ${new Date(m.fecha_fin).toLocaleDateString('es-BO')}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Tabs.Panel>

      <Tabs.Panel value="expediente">
        <Card className="p-6">
          {expediente ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><span className="text-sm text-[var(--color-text-muted)]">ID Expediente</span><p className="font-medium">#{expediente.id_expediente}</p></div>
                {canEditExpediente && !editingExpediente && (
                  <Button variant="ghost" size="sm" onClick={handleEditExpediente}>
                    <RiEditLine className="mr-1" /> Editar
                  </Button>
                )}
                {editingExpediente && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleSaveExpediente} disabled={savingExpediente}>
                      <RiCheckLine className="mr-1" /> {savingExpediente ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEditExpediente}>
                      <RiCloseLine className="mr-1" /> Cancelar
                    </Button>
                  </div>
                )}
              </div>
              <div><span className="text-sm text-[var(--color-text-muted)]">Fecha de Creación</span><p className="font-medium">{new Date(expediente.fecha_creacion).toLocaleDateString('es-BO')}</p></div>
              <div>
                <span className="text-sm text-[var(--color-text-muted)]">Observaciones</span>
                {editingExpediente ? (
                  <Textarea
                    label="Observaciones"
                    value={expedienteObs}
                    onChange={e => setExpedienteObs(e.target.value)}
                    placeholder="Agregar observaciones del expediente..."
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{expediente.observaciones ?? 'Sin observaciones'}</p>
                )}
              </div>
            </div>
          ) : (
            <Alert variant="warning">No se encontró expediente para este paciente</Alert>
          )}
        </Card>
      </Tabs.Panel>
    </Tabs>
  );
}
