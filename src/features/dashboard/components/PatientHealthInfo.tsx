import { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabaseClient';
import SectionCard from './SectionCard';

interface Alergia {
  nombre: string;
  observacion: string | null;
}

interface Medicamento {
  nombre: string;
  dosis: string | null;
  indicacion: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
}

interface PatientHealthInfoProps {
  userId: string;
}

export default function PatientHealthInfo({ userId }: PatientHealthInfoProps) {
  const [alergias, setAlergias] = useState<Alergia[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthData = async () => {
      setLoading(true);

      const { data: alergiasData } = await supabase
        .from('paciente_alergia')
        .select('alergia:alergia(nombre), observacion')
        .eq('id_paciente', userId);

      setAlergias(
        (alergiasData ?? []).map((a: Record<string, unknown>) => {
          const alergia = a.alergia as Record<string, string> | null;
          return {
            nombre: alergia?.nombre ?? '',
            observacion: a.observacion as string | null,
          };
        })
      );

      const { data: medsData } = await supabase
        .from('paciente_medicamento')
        .select('medicamento:medicamento(nombre), dosis, indicacion, fecha_inicio, fecha_fin')
        .eq('id_paciente', userId)
        .or('fecha_fin.is.null,fecha_fin.gte.' + new Date().toISOString().split('T')[0]);

      setMedicamentos(
        (medsData ?? []).map((m: Record<string, unknown>) => {
          const med = m.medicamento as Record<string, string> | null;
          return {
            nombre: med?.nombre ?? '',
            dosis: m.dosis as string | null,
            indicacion: m.indicacion as string | null,
            fecha_inicio: m.fecha_inicio as string,
            fecha_fin: m.fecha_fin as string | null,
          };
        })
      );

      setLoading(false);
    };

    fetchHealthData();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Mis Alergias">
          <div className="animate-pulse space-y-2">
            {[1, 2].map(i => <div key={i} className="h-8 bg-[var(--color-bg-secondary)] rounded" />)}
          </div>
        </SectionCard>
        <SectionCard title="Mis Medicamentos">
          <div className="animate-pulse space-y-2">
            {[1, 2].map(i => <div key={i} className="h-8 bg-[var(--color-bg-secondary)] rounded" />)}
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Mis Alergias" subtitle={`${alergias.length} registrada(s)`}>
        {alergias.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">No tiene alergias registradas</p>
        ) : (
          <ul className="space-y-2">
            {alergias.map((a, i) => (
              <li key={i} className="flex items-center gap-2 p-2 bg-[var(--color-bg-secondary)] rounded-lg">
                <span className="text-[var(--color-danger)]">⚠️</span>
                <div>
                  <span className="font-medium">{a.nombre}</span>
                  {a.observacion && (
                    <span className="text-[var(--color-text-muted)] text-sm ml-2">- {a.observacion}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Mis Medicamentos Activos" subtitle={`${medicamentos.length} activo(s)`}>
        {medicamentos.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">No tiene medicamentos activos</p>
        ) : (
          <ul className="space-y-2">
            {medicamentos.map((m, i) => (
              <li key={i} className="p-2 bg-[var(--color-bg-secondary)] rounded-lg">
                <div className="font-medium">{m.nombre}</div>
                {m.dosis && <div className="text-sm text-[var(--color-text-muted)]">Dosis: {m.dosis}</div>}
                {m.indicacion && <div className="text-sm text-[var(--color-text-muted)]">{m.indicacion}</div>}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
