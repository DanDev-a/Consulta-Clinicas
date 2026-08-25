import { Card, Badge, Button, Alert } from '../../../components/ui';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';
import type { DiagnosticoResultado } from '../types/ai';

interface ResultadoDiagnosticoProps {
  resultado: DiagnosticoResultado;
  onAceptar: () => void;
  onRechazar: () => void;
  loading?: boolean;
}

const URGENCY_VARIANT: Record<string, 'danger' | 'warning' | 'info' | 'success'> = {
  critica: 'danger',
  alta: 'warning',
  media: 'info',
  baja: 'success',
};

export default function ResultadoDiagnostico({ resultado, onAceptar, onRechazar, loading }: ResultadoDiagnosticoProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Resultado del Análisis IA</h3>
        <Badge variant={URGENCY_VARIANT[resultado.urgencia] ?? 'info'}>
          Urgencia: {resultado.urgencia}
        </Badge>
      </div>

      {resultado.diagnosticos.length > 0 ? (
        <div className="space-y-3">
          {resultado.diagnosticos.map((d, i) => (
            <div key={i} className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{d.nombre}</span>
                <span className="text-sm font-mono px-2 py-1 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)]">{d.cie10}</span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-2">{d.descripcion}</p>
              <div className="w-full bg-[var(--color-border-light)] rounded-full h-2">
                <div className="bg-[var(--color-accent)] h-2 rounded-full transition-all" style={{ width: `${d.probabilidad}%` }} />
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">{d.probabilidad}% de probabilidad</span>
            </div>
          ))}
        </div>
      ) : (
        <Alert variant="warning">No se detectaron diagnósticos diferenciales</Alert>
      )}

      {resultado.tratamiento_sugerido && (
        <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl">
          <h4 className="font-medium mb-2">Tratamiento Sugerido</h4>
          {resultado.tratamiento_sugerido.medicamentos?.map((m, i) => (
            <div key={i} className="text-sm">
              <strong>{m.nombre}</strong> — {m.dosis}, {m.frecuencia}, {m.duracion}
            </div>
          ))}
          {resultado.tratamiento_sugerido.indicaciones && (
            <p className="text-sm text-[var(--color-text-muted)] mt-2">{resultado.tratamiento_sugerido.indicaciones}</p>
          )}
        </div>
      )}

      {resultado.estudios_sugeridos.length > 0 && (
        <div>
          <h4 className="font-medium mb-1">Estudios Sugeridos</h4>
          <ul className="list-disc list-inside text-sm text-[var(--color-text-muted)]">
            {resultado.estudios_sugeridos.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <Alert variant="warning">
        Este diagnóstico es una sugerencia de IA. El doctor debe revisar y aceptar o rechazar antes de crear el diagnóstico oficial.
      </Alert>

      <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border-light)]">
        <Button variant="ghost" onClick={onRechazar} disabled={loading}>
          <RiCloseLine className="mr-1" />Rechazar
        </Button>
        <Button onClick={onAceptar} disabled={loading}>
          <RiCheckLine className="mr-1" />Aceptar y Crear Diagnóstico
        </Button>
      </div>
    </Card>
  );
}
