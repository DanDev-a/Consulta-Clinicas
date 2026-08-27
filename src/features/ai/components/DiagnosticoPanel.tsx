import { useState } from 'react';
import { Textarea, Button, Card, Spinner } from '../../../components/ui';
import { RiBrainLine } from 'react-icons/ri';
import type { DiagnosticoResultado } from '../types/ai';

interface DiagnosticoPanelProps {
  loading: boolean;
  onAnalizar: (sintomas: string) => Promise<DiagnosticoResultado | null>;
}

export default function DiagnosticoPanel({ loading, onAnalizar }: DiagnosticoPanelProps) {
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
    </div>
  );
}
