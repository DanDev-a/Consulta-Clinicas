import { useState, useEffect } from 'react';
import { Tabs, PageHeader } from '../../../components/ui';
import { RiWhatsappLine } from 'react-icons/ri';
import { useWhatsApp } from '../hooks/useWhatsApp';
import WhatsAppSettings from './WhatsAppSettings';
import WhatsAppLogs from './WhatsAppLogs';

export default function WhatsAppRouter() {
  const {
    config, logs, totalLogs, logPage, LOG_PAGE_SIZE,
    loading, error, logFilters,
    setLogFilters, setLogPage, saveConfig,
  } = useWhatsApp();

  const [botStatus, setBotStatus] = useState('DISCONNECTED');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/health');
        if (res.ok) {
          const data = await res.json();
          setBotStatus(data.status ?? 'DISCONNECTED');
        }
      } catch {
        setBotStatus('DISCONNECTED');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp CRM"
        subtitle="Gestión de mensajes WhatsApp y recordatorios"
      />

      <Tabs defaultActiveTab="settings">
        <Tabs.List>
          <Tabs.Tab value="settings" label="Configuración" icon={RiWhatsappLine} />
          <Tabs.Tab value="logs" label="Log de Mensajes" icon={RiWhatsappLine} />
        </Tabs.List>

        <Tabs.Panel value="settings">
          <WhatsAppSettings
            config={config}
            botStatus={botStatus}
            error={error}
            onSave={saveConfig}
          />
        </Tabs.Panel>

        <Tabs.Panel value="logs">
          <WhatsAppLogs
            logs={logs}
            totalLogs={totalLogs}
            logPage={logPage}
            pageSize={LOG_PAGE_SIZE}
            filters={logFilters}
            loading={loading}
            onFilterChange={setLogFilters}
            onPageChange={setLogPage}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
