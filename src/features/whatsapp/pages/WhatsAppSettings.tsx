import { useState } from 'react';
import { Card, Input, Button, Alert } from '../../../components/ui';
import WhatsAppStatusBadge from '../components/WhatsAppStatusBadge';
import type { WhatsAppConfig, WhatsAppConfigFormData } from '../types/whatsapp';

interface WhatsAppSettingsProps {
  config: WhatsAppConfig | null;
  botStatus: string;
  error: string | null;
  onSave: (data: WhatsAppConfigFormData) => Promise<boolean>;
}

export default function WhatsAppSettings({ config, botStatus, error, onSave }: WhatsAppSettingsProps) {
  const [form, setForm] = useState<WhatsAppConfigFormData>({
    phone_number_id: config?.phone_number_id ?? '',
    token: config?.token ?? '',
    numero_display: config?.numero_display ?? '',
    activo: config?.activo ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    const ok = await onSave(form);
    setSaving(false);
    if (ok) setSaved(true);
    else setSaveError('Error al guardar');
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Configuración WhatsApp</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Estado del bot:</span>
          <WhatsAppStatusBadge estado={botStatus} />
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {saveError && <Alert variant="danger">{saveError}</Alert>}
      {saved && <Alert variant="success">Configuración guardada correctamente</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number ID"
          value={form.phone_number_id}
          onChange={e => setForm(prev => ({ ...prev, phone_number_id: e.target.value }))}
          placeholder="ID del número de WhatsApp Business"
        />
        <Input
          label="Número de visualización"
          value={form.numero_display}
          onChange={e => setForm(prev => ({ ...prev, numero_display: e.target.value }))}
          placeholder="+59171234567"
        />
      </div>

      <Input
        label="Token de acceso"
        type="password"
        value={form.token}
        onChange={e => setForm(prev => ({ ...prev, token: e.target.value }))}
        placeholder="Token de la API de WhatsApp"
      />

      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={e => setForm(prev => ({ ...prev, activo: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
        </label>
        <span className="text-sm font-medium">WhatsApp activo</span>
      </div>

      <div className="flex justify-end pt-4 border-t border-[var(--color-border-light)]">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </Button>
      </div>
    </Card>
  );
}
