import { useState } from 'react';
import { Textarea, Button, Card, Alert, Spinner } from '../../../components/ui';
import { RiBrainLine } from 'react-icons/ri';
import type { DiagnosticoResultado } from '../types/ai';

interface DiagnosticoPanelProps {
  loading: boolean;
  resultado: DiagnosticoResultado | null;
  onAnalizar: (sintomas: string) => Promise<DiagnosticoResultado | null>;
}

const URGENCY_VARIANT: Record<string, 'danger' | 'warning' | 'info' | 'success'> = {
  critica: 'danger',
  alta: 'warning',
  media: 'info',
  baja: 'success',
};

export default function DiagnosticoPanel({ loading, resultado, onAnalizar }: DiagnosticoPanelProps) {
  const [sintomas, setSintomas] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalizar = async () => {
    if (!sintomas.trim() || analyzing) return;
    setAnalyzing(true);
    try {
      await onAnalizar(sintomas);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RiBrainLine className="text-[var(--color-accent)]" />
          Análisis de Síntomas
        </h3>
        <Textarea
          label="Describa los síntomas del paciente"
          value={sintomas}
          onChange={e => setSintomas(e.target.value)}
          placeholder="Ej: Dolor de cabeza hace 3 días, fiebre 38.5°C, náuseas ocasionales..."
          rows={5}
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleAnalizar} disabled={loading || analyzing || !sintomas.trim()}>
            {loading ? <><Spinner size="sm" /> Analizando...</> : 'Analizar con IA'}
          </Button>
        </div>
      </Card>

      {resultado && (
        <Card className="p-6 space-y-4">
          <h4 className="font-semibold text-[var(--color-text)]">Diagnósticos Diferenciales</h4>
          {resultado.diagnosticos.length > 0 ? (
            resultado.diagnosticos.map((d, i) => (
              <div key={i} className="p-4 bg-[var(--color-bg-secondary)] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{d.nombre}</span>
                  <span className="text-sm px-2 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">{d.probabilidad}%</span>
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">CIE-10: {d.cie10}</div>
                <div className="text-sm">{d.descripcion}</div>
              </div>
            ))
          ) : (
            <Alert variant="warning">No se detectaron diagnósticos diferenciales</Alert>
          )}

          {resultado.estudios_sugeridos.length > 0 && (
            <div>
              <h5 className="font-medium mt-4">Estudios Sugeridos</h5>
              <ul className="list-disc list-inside text-sm text-[var(--color-text-muted)]">
                {resultado.estudios_sugeridos.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <Alert variant={URGENCY_VARIANT[resultado.urgencia] ?? 'info'}>
            Urgencia: <strong>{resultado.urgencia.toUpperCase()}</strong>
          </Alert>
        </Card>
      )}
    </div>
  );
}
