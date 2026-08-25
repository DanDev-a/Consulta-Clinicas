import Chart from './Chart';
import type { AppointmentByStatus } from '../types/dashboard';

interface Props {
  data: AppointmentByStatus[];
}

export default function AppointmentsByStatusChart({ data }: Props) {
  return (
    <Chart
      type="pie"
      data={data}
      dataKey="value"
      xAxisKey="name"
      title="Citas por estado"
      height={260}
    />
  );
}
