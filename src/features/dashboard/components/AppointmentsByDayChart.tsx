import Chart from './Chart';
import type { AppointmentByDay } from '../types/dashboard';

interface Props {
  data: AppointmentByDay[];
}

export default function AppointmentsByDayChart({ data }: Props) {
  return (
    <Chart
      type="bar"
      data={data}
      dataKey="citas"
      xAxisKey="name"
      title="Citas por dia de la semana"
      height={260}
    />
  );
}
