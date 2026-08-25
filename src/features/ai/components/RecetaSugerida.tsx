import { Card, Badge, Button } from '../../../components/ui';
import { RiMedicineBottleLine } from 'react-icons/ri';
import type { RecetaSugerida as RecetaType } from '../types/ai';

interface RecetaSugeridaProps {
  receta: RecetaType;
  onCrearReceta?: () => void;
  loading?: boolean;
}

export default function RecetaSugerida({ receta, onCrearReceta, loading }: RecetaSugeridaProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <RiMedicineBottleLine className="text-[var(--color-accent)]" />
          Receta Sugerida
        </h3>
        <Badge variant="info">Sugerencia IA</Badge>
      </div>

      <div className="space-y-3">
        {receta.medicamentos?.map((med, i) => (
          <div key={i} className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
            <div className="font-medium">{med.nombre}</div>
            <div className="text-sm text-[var(--color-text-muted)] grid grid-cols-3 gap-2 mt-1">
              <span>Dosis: {med.dosis}</span>
              <span>Frecuencia: {med.frecuencia}</span>
              <span>Duración: {med.duracion}</span>
            </div>
          </div>
        ))}
      </div>

      {receta.indicaciones && (
        <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
          <span className="text-sm font-medium">Indicaciones: </span>
          <span className="text-sm text-[var(--color-text-muted)]">{receta.indicaciones}</span>
        </div>
      )}

      {onCrearReceta && (
        <div className="flex justify-end pt-4 border-t border-[var(--color-border-light)]">
          <Button onClick={onCrearReceta} disabled={loading}>
            Crear Receta Real
          </Button>
        </div>
      )}
    </Card>
  );
}
