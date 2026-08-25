import { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabaseClient';
import PageHeader from '../../../components/ui/PageHeader';
import Skeleton from '../../../components/ui/Skeleton';
import { useDashboard } from '../hooks/useDashboard';

import StatCard from '../components/StatCard';
import SectionCard from '../components/SectionCard';
import RecentPatients from '../components/RecentPatients';
import UpcomingAppointments from '../components/UpcomingAppointments';
import AppointmentsByDayChart from '../components/AppointmentsByDayChart';
import AppointmentsByStatusChart from '../components/AppointmentsByStatusChart';
import SpecialtyDistribution from '../components/SpecialtyDistribution';
import AiActivitySummary from '../components/AiActivitySummary';
import AppointmentReport from '../components/AppointmentReport';
import ProductivityReport from '../components/ProductivityReport';
import DemographicReport from '../components/DemographicReport';
import EpidemiologicReport from '../components/EpidemiologicReport';
import ExportButton from '../components/ExportButton';
import PatientHealthInfo from '../components/PatientHealthInfo';

interface TabDef {
  id: string;
  label: string;
}

export default function Dashboard() {
  const [userId, setUserId] = useState<string | undefined>();
  const [userRole, setUserRole] = useState<string | undefined>();
  const [userName, setUserName] = useState<string>('');
  const [activeTab, setActiveTab] = useState('general');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const rol = session.user.user_metadata?.rol ?? 'PACIENTE';
        setUserRole(rol);
        const nombre = session.user.user_metadata?.nombre ?? session.user.email?.split('@')[0] ?? '';
        setUserName(nombre);
      }
      setAuthChecked(true);
    };
    loadUser();
  }, []);

  const dashboard = useDashboard(userId, userRole);

  const isAdmin = userRole === 'ADMIN';
  const isDoctor = userRole === 'DOCTOR';
  const isRecepcionista = userRole === 'RECEPCIONISTA';
  const isPaciente = userRole === 'PACIENTE';
  const showReports = isAdmin || isRecepcionista || isDoctor;
  const showDemographic = isAdmin || isRecepcionista;
  const showEpidemiologic = isAdmin || isDoctor;
  const showProductivity = isAdmin;
  const showAi = isAdmin || isDoctor;
  const showRecentPatients = isAdmin || isRecepcionista;

  const tabs: TabDef[] = [
    { id: 'general', label: 'General' },
    ...(showReports ? [{ id: 'reportes', label: 'Reportes' }] : []),
    ...(showDemographic ? [{ id: 'demografico', label: 'Demografico' }] : []),
    ...(showEpidemiologic ? [{ id: 'epidemiologico', label: 'Epidemiologico' }] : []),
    ...(showProductivity ? [{ id: 'productividad', label: 'Productividad' }] : []),
  ];

  if (!authChecked || dashboard.loading || !userRole) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bienvenido, ${userName}`}
        subtitle={new Date().toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      />

      <div role="tablist" className="flex gap-1 border-b border-[var(--color-border-light)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer',
              activeTab === tab.id
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {dashboard.stats.map((stat, i) => (
              <StatCard key={i} data={stat} />
            ))}
          </div>

          {isPaciente && userId && (
            <PatientHealthInfo userId={userId} />
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Citas por dia" subtitle="Ultimos 7 dias">
              <AppointmentsByDayChart data={dashboard.appointmentsByDay} />
            </SectionCard>
            <SectionCard title="Citas por estado">
              <AppointmentsByStatusChart data={dashboard.appointmentsByStatus} />
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {showRecentPatients && (
              <SectionCard title="Pacientes recientes" subtitle="Ultimos 5 registros">
                <RecentPatients patients={dashboard.recentPatients} />
              </SectionCard>
            )}
            <SectionCard title="Proximas citas">
              <UpcomingAppointments appointments={dashboard.upcomingAppointments} />
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Distribucion por especialidad">
              <SpecialtyDistribution data={dashboard.specialtyData} />
            </SectionCard>
            {showAi && (
              <SectionCard title="Actividad del sistema IA">
                <AiActivitySummary data={dashboard.aiActivity} />
              </SectionCard>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reportes' && showReports && (
        <div className="space-y-6">
          <SectionCard
            title="Reporte de citas"
            subtitle="Resumen diario del mes actual"
            actions={<ExportButton data={dashboard.appointmentReport} filename="reporte_citas" />}
          >
            <AppointmentReport data={dashboard.appointmentReport} />
          </SectionCard>
        </div>
      )}

      {activeTab === 'demografico' && showDemographic && (
        <div className="space-y-6">
          <SectionCard
            title="Reporte demografico"
            subtitle="Distribucion de pacientes por sexo, edad y grupo sanguineo"
            actions={<ExportButton data={dashboard.demographics?.porSexo ?? []} filename="demografico" />}
          >
            <DemographicReport data={dashboard.demographics} />
          </SectionCard>
        </div>
      )}

      {activeTab === 'epidemiologico' && showEpidemiologic && (
        <div className="space-y-6">
          <SectionCard
            title="Reporte epidemiologico"
            subtitle="Top 10 diagnosticos CIE-10 mas frecuentes"
            actions={<ExportButton data={dashboard.epidemiologic} filename="epidemiologico" />}
          >
            <EpidemiologicReport data={dashboard.epidemiologic} />
          </SectionCard>
        </div>
      )}

      {activeTab === 'productividad' && showProductivity && (
        <div className="space-y-6">
          <SectionCard
            title="Reporte de productividad"
            subtitle="Rendimiento de doctores en el mes actual"
            actions={<ExportButton data={dashboard.productivity} filename="productividad" />}
          >
            <ProductivityReport data={dashboard.productivity} />
          </SectionCard>
        </div>
      )}
    </div>
  );
}
