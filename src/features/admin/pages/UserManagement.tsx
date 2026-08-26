import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiUserAddLine, RiLink, RiCheckboxCircleLine, RiCheckboxBlankCircleLine } from 'react-icons/ri';
import { useUserManagement } from '../hooks/useUserManagement';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Spinner from '../../../components/ui/Spinner';

export default function UserManagement() {
  const {
    usuarios,
    invites,
    loading,
    needsSetup,
    setupSystem,
    crearInvite,
    generarLink,
  } = useUserManagement();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<'DOCTOR' | 'RECEPCIONISTA'>('DOCTOR');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [settingUp, setSettingUp] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Cargando usuarios">
        <Spinner size="lg" />
        <span className="sr-only">Cargando usuarios...</span>
      </div>
    );
  }

  const handleSetup = async () => {
    setSettingUp(true);
    const ok = await setupSystem();
    setSettingUp(false);
    if (ok) {
      toast.success('Sistema de invitaciones inicializado');
    } else {
      toast.error('Error al inicializar. Revisa consola.');
    }
  };

  const handleInvite = async () => {
    if (!email) {
      toast.error('El email es obligatorio');
      return;
    }
    const token = await crearInvite(email, rol);
    if (token) {
      const link = generarLink(token, rol);
      setGeneratedLink(link);
      setStep(2);
      toast.success('Invitacion creada');
    } else {
      toast.error('Error al crear la invitacion');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success('Link copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setStep(1);
    setEmail('');
    setRol('DOCTOR');
    setGeneratedLink('');
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion de Usuarios"
        subtitle="Invita doctores y recepcionistas con un link de registro"
        actions={
          <Button onClick={() => setShowModal(true)}>
            <RiUserAddLine className="inline mr-2" />
            Invitar usuario
          </Button>
        }
      />

      {/* Setup banner */}
      {needsSetup && (
        <Card>
          <Card.Body className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text)]">
                Sistema de invitaciones no inicializado
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Hace clic en el boton para crear las tablas necesarias.
              </p>
            </div>
            <Button onClick={handleSetup} disabled={settingUp}>
              {settingUp ? 'Inicializando...' : 'Inicializar sistema'}
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Usuarios activos */}
      <Card>
        <Card.Header>Usuarios activos</Card.Header>
        <Card.Body className="p-0">
          {usuarios.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] p-6">No hay usuarios registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-light)]">
                    <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Nombre</th>
                    <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Email</th>
                    <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Rol</th>
                    <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id_usuario} className="border-b border-[var(--color-border-light)] last:border-0">
                      <td className="px-6 py-3 text-[var(--color-text)]">
                        {u.nombre} {u.apellido}
                      </td>
                      <td className="px-6 py-3 text-[var(--color-text-muted)]">{u.email}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-[var(--color-text-muted)]">
                        {new Date(u.fecha_creacion).toLocaleDateString('es-BO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Invites pendientes */}
      {invites.length > 0 && (
        <Card>
          <Card.Header>Invitaciones pendientes</Card.Header>
          <Card.Body className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-light)]">
                    <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Email</th>
                    <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Rol</th>
                    <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Fecha</th>
                    <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Estado</th>
                    <th className="text-left px-6 py-3 font-medium text-[var(--color-text-muted)]">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((inv) => (
                    <tr key={inv.token} className="border-b border-[var(--color-border-light)] last:border-0">
                      <td className="px-6 py-3 text-[var(--color-text)]">{inv.email}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                          {inv.rol}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-[var(--color-text-muted)]">
                        {new Date(inv.created_at).toLocaleDateString('es-BO')}
                      </td>
                      <td className="px-6 py-3">
                        {inv.used ? (
                          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-success)]">
                            <RiCheckboxCircleLine /> Registrado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-warning)]">
                            <RiCheckboxBlankCircleLine /> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {!inv.used && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generarLink(inv.token, inv.rol));
                              toast.success('Link copiado');
                            }}
                            className="text-[var(--color-accent)] hover:underline text-xs inline-flex items-center gap-1"
                          >
                            <RiLink /> Copiar link
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal de invitacion */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] w-full max-w-lg mx-4 shadow-xl">
            <div className="px-6 py-4 border-b border-[var(--color-border-light)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {step === 1 ? 'Invitar usuario' : 'Link de registro generado'}
              </h2>
            </div>

            <div className="px-6 py-4">
              {step === 1 && (
                <div className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@clinica.com"
                  />
                  <Select
                    label="Rol"
                    value={rol}
                    onChange={(e) => setRol(e.target.value as 'DOCTOR' | 'RECEPCIONISTA')}
                    options={[
                      { value: 'DOCTOR', label: 'Doctor' },
                      { value: 'RECEPCIONISTA', label: 'Recepcionista' },
                    ]}
                  />
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Se generara un link de registro con el rol seleccionado.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Comparti este link con la persona para que se registre como <strong>{rol}</strong>:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={generatedLink}
                      className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] text-[var(--color-text)] text-sm font-mono"
                    />
                    <Button onClick={handleCopyLink} variant="secondary">
                      {copied ? 'Copiado ✓' : 'Copiar'}
                    </Button>
                  </div>
                  <p className="text-xs text-[var(--color-text-subtle)]">
                    La persona al hacer clic en el link vera el formulario de registro con el rol pre-seleccionado.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[var(--color-border-light)] flex justify-end gap-3">
              {step === 1 ? (
                <>
                  <Button variant="ghost" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button onClick={handleInvite} disabled={!email}>
                    Generar link
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={handleCloseModal}>
                    Cerrar
                  </Button>
                  <Button onClick={handleCopyLink}>
                    {copied ? 'Copiado ✓' : 'Copiar link'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
