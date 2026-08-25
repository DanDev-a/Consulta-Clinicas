import Chart from './Chart';
import type { SpecialtyData } from '../types/dashboard';

interface Props {
  data: SpecialtyData[];
}

export default function SpecialtyDistribution({ data }: Props) {
  return (
    <Chart
      type="pie"
      data={data}
      dataKey="value"
      xAxisKey="name"
      title="Distribucion por especialidad"
      height={260}
    />
  );
}
