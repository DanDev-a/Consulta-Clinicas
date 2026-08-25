import Chart from '../../dashboard/components/Chart';
import Card from '../../../components/ui/Card';

const appointmentsData = [
  { name: 'Lun', citas: 12 },
  { name: 'Mar', citas: 19 },
  { name: 'Mie', citas: 15 },
  { name: 'Jue', citas: 22 },
  { name: 'Vie', citas: 18 },
  { name: 'Sab', citas: 8 },
];

const patientsBySpecialty = [
  { name: 'Clinica', value: 150 },
  { name: 'Pediatria', value: 85 },
  { name: 'Cardiologia', value: 60 },
  { name: 'Dermatologia', value: 45 },
  { name: 'Ginecologia', value: 70 },
];

const monthlyTrend = [
  { name: 'Ene', pacientes: 45 },
  { name: 'Feb', pacientes: 52 },
  { name: 'Mar', pacientes: 61 },
  { name: 'Abr', pacientes: 55 },
  { name: 'May', pacientes: 67 },
  { name: 'Jun', pacientes: 73 },
  { name: 'Jul', pacientes: 68 },
];

export default function ChartShowcase() {
  return (
    <section aria-label="Charts">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <Card.Header>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Line Chart</h3>
          </Card.Header>
          <Card.Body>
            <Chart type="line" data={monthlyTrend} dataKey="pacientes" xAxisKey="name" title="Tendencia mensual de pacientes" height={250} />
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Bar Chart</h3>
          </Card.Header>
          <Card.Body>
            <Chart type="bar" data={appointmentsData} dataKey="citas" xAxisKey="name" title="Citas por dia de la semana" height={250} />
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Area Chart</h3>
          </Card.Header>
          <Card.Body>
            <Chart type="area" data={monthlyTrend} dataKey="pacientes" xAxisKey="name" title="Pacientes acumulados" height={250} />
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Pie Chart</h3>
          </Card.Header>
          <Card.Body>
            <Chart type="pie" data={patientsBySpecialty} dataKey="value" xAxisKey="name" title="Pacientes por especialidad" height={250} />
          </Card.Body>
        </Card>
      </div>
    </section>
  );
}
