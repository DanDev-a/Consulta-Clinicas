import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { PageHeader, Tabs, Select, Alert, EmptyState, Badge, Card, Button, Modal } from '../../../components/ui';
import { RiBrainLine, RiChat3Line, RiHistoryLine, RiShieldLine, RiQuestionLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import DiagnosticoPanel from '../components/DiagnosticoPanel';
import ResultadoDiagnostico from '../components/ResultadoDiagnostico';
import ChatMedico from '../components/ChatMedico';
import { useDiagnosticoIA } from '../hooks/useDiagnosticoIA';
import { useChatMedico } from '../hooks/useChatMedico';

interface AiSystemPageProps {
  userRole: string | undefined;
  userId: string | undefined;
}

interface PatientOption {
  value: string;
  label: string;
}

interface PatientInfo {
  id_paciente: string;
  id_expediente: number;
  nombre: string;
}

export default function AiSystem({ userRole, userId }: AiSystemPageProps) {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ type: 'aceptar' | 'rechazar' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const patientsRef = useRef<PatientOption[]>([]);

  const { loading: aiLoading, error: aiError, resultado, historial, analizarSintomas, aceptarDiagnostico, rechazarDiagnostico, fetchHistorial } = useDiagnosticoIA(userId);
  const { messages, loading: chatLoading, error: chatError, sendMessage, startChat, fetchChatHistory } = useChatMedico(userId);

  const isAdmin = userRole === 'ADMIN';
  const isDoctor = userRole === 'DOCTOR';
  const canAccess = isAdmin || isDoctor;

  useEffect(() => {
    if (!canAccess) return;
    const controller = new AbortController();

    const loadPatients = async () => {
      const { data, error } = await supabase
        .from('paciente')
        .select('id_paciente, usuario:usuario(nombre, apellido)')
        .abortSignal(controller.signal);

      if (error) {
        console.error('Error loading patients:', error.message);
        return;
      }
      const mapped = (data ?? []).map((p: Record<string, unknown>) => {
        const u = p.usuario as Record<string, string> | null;
        return { value: p.id_paciente as string, label: `${u?.nombre ?? ''} ${u?.apellido ?? ''}` };
      });
      setPatients(mapped);
      patientsRef.current = mapped;
    };
    loadPatients();
    return () => controller.abort();
  }, [canAccess]);

  useEffect(() => {
    if (!selectedPatient) {
      setPatientInfo(null);
      setPatientError(null);
      return;
    }

    const controller = new AbortController();

    const loadExp = async () => {
      setPatientError(null);
      const { data, error } = await supabase
        .from('expediente')
        .select('id_expediente')
        .eq('id_paciente', selectedPatient)
        .abortSignal(controller.signal)
        .maybeSingle();

      if (error) {
        setPatientError('Error al cargar expediente');
        return;
      }
      if (!data) {
        setPatientError('Este paciente no tiene expediente registrado');
        setPatientInfo(null);
        return;
      }

      const p = patientsRef.current.find(pt => pt.value === selectedPatient);
      setPatientInfo({
        id_paciente: selectedPatient,
        id_expediente: data.id_expediente,
        nombre: p?.label ?? '',
      });
      startChat();
      fetchHistorial(selectedPatient);
      fetchChatHistory(selectedPatient);
    };
    loadExp();
    return () => controller.abort();
  }, [selectedPatient, startChat, fetchHistorial, fetchChatHistory]);

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RiShieldLine className="text-6xl text-[var(--color-text-muted)] mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
        <p className="text-[var(--color-text-muted)]">Solo los doctores y administradores pueden acceder al Sistema IA.</p>
      </div>
    );
  }

  const handleAnalizar = async (sintomas: string) => {
    if (!patientInfo) { toast.error('Seleccioná un paciente primero'); return null; }
    return analizarSintomas(sintomas, patientInfo.id_expediente, patientInfo.id_paciente);
  };

  const handleAceptar = async () => {
    if (!resultado?.id_diagnostico_ia || !patientInfo || !userId) return;
    setConfirmModal({ type: 'aceptar' });
  };

  const handleRechazar = async () => {
    if (!resultado?.id_diagnostico_ia || !userId) return;
    setConfirmModal({ type: 'rechazar' });
  };

  const confirmAction = async () => {
    if (!confirmModal || !resultado?.id_diagnostico_ia || !userId) return;
    setActionLoading(true);
    try {
      if (confirmModal.type === 'aceptar' && patientInfo) {
        const ok = await aceptarDiagnostico(resultado.id_diagnostico_ia, patientInfo.id_expediente, userId);
        if (ok) toast.success('Diagnóstico aceptado y creado en el sistema');
        else toast.error('Error al aceptar diagnóstico');
      } else {
        const ok = await rechazarDiagnostico(resultado.id_diagnostico_ia, userId);
        if (ok) toast.success('Diagnóstico rechazado');
        else toast.error('Error al rechazar');
      }
    } finally {
      setActionLoading(false);
      setConfirmModal(null);
    }
  };

  const handleSendChat = async (msg: string) => {
    await sendMessage(msg, undefined, patientInfo?.id_paciente);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sistema IA"
        subtitle="Asistente de diagnóstico médico con Groq AI"
      />

      <Card className="p-4">
        <Select
          label="Seleccionar Paciente"
          options={patients}
          value={selectedPatient}
          onChange={e => setSelectedPatient(e.target.value)}
          placeholder="Elegí un paciente para comenzar"
        />
      </Card>

      {patientError && (
        <Alert variant="warning">{patientError}</Alert>
      )}

      {!selectedPatient ? (
        <EmptyState
          icon={RiBrainLine}
          title="Seleccioná un paciente"
          description="Elegí un paciente de la lista para iniciar el análisis con IA"
        />
      ) : (
        <Tabs defaultActiveTab="diagnostico">
          <Tabs.List>
            <Tabs.Tab value="diagnostico" label="Diagnóstico" icon={RiBrainLine} />
            <Tabs.Tab value="chat" label="Chat" icon={RiChat3Line} />
            {isAdmin && <Tabs.Tab value="historial" label="Historial" icon={RiHistoryLine} />}
          </Tabs.List>

          <Tabs.Panel value="diagnostico">
            {aiError && <Alert variant="danger">{aiError}</Alert>}
            <DiagnosticoPanel loading={aiLoading} onAnalizar={handleAnalizar} />
            {resultado && (
              <div className="mt-4">
                <ResultadoDiagnostico
                  resultado={resultado}
                  onAceptar={handleAceptar}
                  onRechazar={handleRechazar}
                  loading={aiLoading || actionLoading}
                />
              </div>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="chat">
            <ChatMedico messages={messages} loading={chatLoading} onSend={handleSendChat} error={chatError} />
          </Tabs.Panel>

          {isAdmin && (
            <Tabs.Panel value="historial">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Historial de Diagnósticos IA</h3>
                {historial.length === 0 ? (
                  <EmptyState title="Sin historial" description="No hay diagnósticos IA registrados para este paciente" />
                ) : (
                  <div className="space-y-3">
                    {historial.map(h => (
                      <div key={h.id_diagnostico_ia} className="p-4 bg-[var(--color-bg-secondary)] rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">Diagnóstico #{h.id_diagnostico_ia}</div>
                          <div className="text-xs text-[var(--color-text-muted)]">{new Date(h.fecha_generacion).toLocaleString('es-BO')}</div>
                        </div>
                        <Badge variant={
                          h.estado_validacion === 'ACEPTADO' ? 'success' :
                          h.estado_validacion === 'RECHAZADO' ? 'danger' :
                          h.estado_validacion === 'MODIFICADO' ? 'info' : 'warning'
                        }>
                          {h.estado_validacion}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Tabs.Panel>
          )}
        </Tabs>
      )}

      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)} title="Confirmar acción" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <RiQuestionLine className="text-4xl text-[var(--color-accent)]" />
            <p>
              {confirmModal?.type === 'aceptar'
                ? '¿Aceptar este diagnóstico y crear el diagnóstico oficial con receta?'
                : '¿Rechazar este diagnóstico IA?'}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmModal(null)} disabled={actionLoading}>Cancelar</Button>
            <Button onClick={confirmAction} disabled={actionLoading} variant={confirmModal?.type === 'rechazar' ? 'danger' : 'primary'}>
              {actionLoading ? 'Procesando...' : confirmModal?.type === 'aceptar' ? 'Aceptar' : 'Rechazar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
