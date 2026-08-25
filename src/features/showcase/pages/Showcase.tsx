import Tabs from '../../../components/ui/Tabs';
import PageHeader from '../../../components/ui/PageHeader';
import FormShowcase from '../components/FormShowcase';
import FeedbackShowcase from '../components/FeedbackShowcase';
import LayoutShowcase from '../components/LayoutShowcase';
import NavigationShowcase from '../components/NavigationShowcase';
import TableShowcase from '../components/TableShowcase';
import ChartShowcase from '../components/ChartShowcase';

export default function Showcase() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="UI Components Showcase"
        subtitle="Catalogo visual de todos los componentes del sistema de diseno"
      />

      <Tabs defaultActiveTab="forms">
        <Tabs.List>
          <Tabs.Tab value="forms" label="Formularios" />
          <Tabs.Tab value="feedback" label="Feedback" />
          <Tabs.Tab value="layout" label="Layout" />
          <Tabs.Tab value="navigation" label="Navegacion" />
          <Tabs.Tab value="data" label="Data" />
          <Tabs.Tab value="charts" label="Graficos" />
        </Tabs.List>

        <Tabs.Panel value="forms">
          <FormShowcase />
        </Tabs.Panel>
        <Tabs.Panel value="feedback">
          <FeedbackShowcase />
        </Tabs.Panel>
        <Tabs.Panel value="layout">
          <LayoutShowcase />
        </Tabs.Panel>
        <Tabs.Panel value="navigation">
          <NavigationShowcase />
        </Tabs.Panel>
        <Tabs.Panel value="data">
          <TableShowcase />
        </Tabs.Panel>
        <Tabs.Panel value="charts">
          <ChartShowcase />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
