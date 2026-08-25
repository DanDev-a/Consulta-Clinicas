import Chart from './Chart';
import type { DemographicData } from '../types/dashboard';

interface Props {
  data: DemographicData | null;
}

export default function DemographicReport({ data }: Props) {
  if (!data) {
    return <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">Sin datos demographicos.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div>
        <Chart
          type="pie"
          data={data.porSexo}
          dataKey="value"
          xAxisKey="name"
          title="Por sexo"
          height={200}
        />
      </div>
      <div>
        <Chart
          type="bar"
          data={data.porEdad}
          dataKey="value"
          xAxisKey="name"
          title="Por rango de edad"
          height={200}
        />
      </div>
      <div>
        <Chart
          type="bar"
          data={data.porGrupoSanguineo}
          dataKey="value"
          xAxisKey="name"
          title="Por grupo sanguineo"
          height={200}
        />
      </div>
    </div>
  );
}
