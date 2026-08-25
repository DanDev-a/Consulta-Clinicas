import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  RiPaletteLine,
  RiNotificationLine,
  RiStethoscopeLine,
  RiCalendarLine,
  RiSettings3Line,
} from 'react-icons/ri';
import { useSettings } from '../hooks/useSettings';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Toggle from '../../../components/ui/Toggle';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { isDarkTheme, getFamily, getThemeForFamily, type ThemeFamily } from '../../../hooks/useTheme';

const FAMILY_LABELS: Record<ThemeFamily, string> = {
  catppuccin: 'Catppuccin',
  tailwind: 'Tailwind',
  nord: 'Nord',
};

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const TABS: Tab[] = [
  { id: 'appearance', label: 'Apariencia', icon: RiPaletteLine },
  { id: 'notifications', label: 'Notificaciones', icon: RiNotificationLine },
  { id: 'doctor', label: 'Mi agenda', icon: RiStethoscopeLine, roles: ['DOCTOR'] },
  { id: 'receptionist', label: 'Citas', icon: RiCalendarLine, roles: ['RECEPCIONISTA'] },
  { id: 'system', label: 'Sistema', icon: RiSettings3Line, roles: ['ADMIN'] },
];

export default function Setting() {
  const {
    settings,
    role,
    loading,
    saving,
    update,
    updateNotification,
    updateDoctor,
    updateRecepcionista,
    updateAdmin,
    save,
  } = useSettings();

  const [activeTab, setActiveTab] = useState('appearance');
  const [saved, setSaved] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Cargando configuracion">
        <Spinner size="lg" />
        <span className="sr-only">Cargando configuracion...</span>
      </div>
    );
  }

  const handleSave = async () => {
    const ok = await save();
    if (ok) {
      toast.success('Configuracion guardada');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error('Error al guardar — revisa consola (F12)');
    }
  };

  const visibleTabs = TABS.filter((tab) => !tab.roles || tab.roles.includes(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Configuracion" subtitle="Personaliza tu experiencia" />

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)]" role="tablist" aria-label="Configuracion">
        <div className="flex gap-1 -mb-px">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                  'border-b-2 -mb-px',
                  isActive
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]',
                ].join(' ')}
              >
                <Icon className="text-base" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel content */}
      <div className="max-w-2xl">
        {/* === APARIENCIA === */}
        {activeTab === 'appearance' && (
          <div id="panel-appearance" role="tabpanel" aria-labelledby="tab-appearance" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">Apariencia</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Personaliza el aspecto visual de la aplicacion.
              </p>
              <Card>
                <Card.Body className="space-y-5">
                  <Toggle
                    label="Modo oscuro"
                    checked={isDarkTheme(settings.theme)}
                    onChange={(checked) => {
                      const family = getFamily(settings.theme);
                      update('theme', getThemeForFamily(family, checked));
                    }}
                    description="Activa el tema oscuro para reducir fatiga visual."
                  />
                  <Select
                    label="Familia de temas"
                    value={getFamily(settings.theme)}
                    onChange={(e) => {
                      const family = e.target.value as ThemeFamily;
                      const dark = isDarkTheme(settings.theme);
                      update('theme', getThemeForFamily(family, dark));
                    }}
                    options={Object.entries(FAMILY_LABELS).map(([value, label]) => ({ value, label }))}
                  />
                  <Select
                    label="Idioma"
                    value={settings.language}
                    onChange={(e) => update('language', e.target.value as 'es' | 'en')}
                    options={[
                      { value: 'es', label: 'Espanol' },
                      { value: 'en', label: 'English' },
                    ]}
                  />
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

        {/* === NOTIFICACIONES === */}
        {activeTab === 'notifications' && (
          <div id="panel-notifications" role="tabpanel" aria-labelledby="tab-notifications" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">Notificaciones</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Elige como queres recibir las notificaciones.
              </p>
              <Card>
                <Card.Body className="space-y-5">
                  <Toggle
                    label="WhatsApp"
                    checked={settings.notifications.whatsapp}
                    onChange={(checked) => updateNotification('whatsapp', checked)}
                    description="Recibe recordatorios y confirmaciones por WhatsApp."
                  />
                  <Toggle
                    label="Notificaciones in-app"
                    checked={settings.notifications.in_app}
                    onChange={(checked) => updateNotification('in_app', checked)}
                    description="Notificaciones dentro de la aplicacion en tiempo real."
                  />
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

        {/* === DOCTOR: AGENDA === */}
        {activeTab === 'doctor' && role === 'DOCTOR' && settings.doctor && (
          <div id="panel-doctor" role="tabpanel" aria-labelledby="tab-doctor" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">Mi agenda</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Configura tu vista de agenda y horarios de trabajo.
              </p>
              <Card>
                <Card.Body className="space-y-5">
                  <Select
                    label="Vista por defecto"
                    value={settings.doctor.default_view}
                    onChange={(e) => updateDoctor('default_view', e.target.value)}
                    options={[
                      { value: 'week', label: 'Semanal' },
                      { value: 'day', label: 'Diaria' },
                      { value: 'agenda', label: 'Agenda (lista)' },
                    ]}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Inicio jornada"
                      type="time"
                      value={settings.doctor.work_start}
                      onChange={(e) => updateDoctor('work_start', e.target.value)}
                    />
                    <Input
                      label="Fin jornada"
                      type="time"
                      value={settings.doctor.work_end}
                      onChange={(e) => updateDoctor('work_end', e.target.value)}
                    />
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

        {/* === RECEPCIONISTA: CITAS === */}
        {activeTab === 'receptionist' && role === 'RECEPCIONISTA' && settings.recepcionista && (
          <div id="panel-receptionist" role="tabpanel" aria-labelledby="tab-receptionist" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">Citas</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Configura la gestion de citas y recordatorios.
              </p>
              <Card>
                <Card.Body className="space-y-5">
                  <Select
                    label="Vista por defecto"
                    value={settings.recepcionista.default_view}
                    onChange={(e) => updateRecepcionista('default_view', e.target.value)}
                    options={[
                      { value: 'week', label: 'Semanal' },
                      { value: 'day', label: 'Diaria' },
                      { value: 'agenda', label: 'Agenda (lista)' },
                    ]}
                  />
                  <Toggle
                    label="Recordatorios automaticos"
                    checked={settings.recepcionista.auto_reminders}
                    onChange={(checked) => updateRecepcionista('auto_reminders', checked)}
                    description="Envia recordatorios automaticos por WhatsApp 24h antes de cada cita."
                  />
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

        {/* === ADMIN: SISTEMA === */}
        {activeTab === 'system' && role === 'ADMIN' && settings.admin && (
          <div id="panel-system" role="tabpanel" aria-labelledby="tab-system" className="space-y-6">
            {/* Notificaciones del sistema */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">Notificaciones del Sistema</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Controla las alertas administrativas del sistema.
              </p>
              <Card>
                <Card.Body>
                  <Toggle
                    label="Notificaciones del sistema"
                    checked={settings.admin.system_notifications}
                    onChange={(checked) => updateAdmin('system_notifications', checked)}
                    description="Recibe alertas de seguridad, actualizaciones del sistema y errores criticos."
                  />
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Guardar */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving || saved}>
          {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar configuracion'}
        </Button>
      </div>
    </div>
  );
}
