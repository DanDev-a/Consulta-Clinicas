import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import Separator from '../../../components/ui/Separator';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import Button from '../../../components/ui/Button';

export default function LayoutShowcase() {
  return (
    <section aria-label="Layout">
      {/* ─── PageHeader ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">PageHeader</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">
                Simple
              </p>
              <PageHeader title="Pacientes" subtitle="Gestión de pacientes del sistema" />
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">
                Con acciones
              </p>
              <PageHeader
                title="Citas médicas"
                subtitle="Próximas citas programadas"
                actions={
                  <>
                    <Button variant="outline" size="sm">Exportar</Button>
                    <Button size="sm">Nueva cita</Button>
                  </>
                }
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ─── Card ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Card</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">
                Card completa (Header + Body + Footer)
              </p>
              <Card>
                <Card.Header>
                  <h4 className="text-sm font-semibold text-[var(--color-text)]">Dr. Alejandro Ruiz</h4>
                </Card.Header>
                <Card.Body>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Cardiología · CMP 12345 · 20 años de experiencia
                  </p>
                </Card.Body>
                <Card.Footer>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">Ver perfil</Button>
                    <Button size="sm">Agendar cita</Button>
                  </div>
                </Card.Footer>
              </Card>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">
                Solo body
              </p>
              <Card>
                <Card.Body>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Esta card no tiene header ni footer. Solo contenido.
                  </p>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ─── Separator ─── */}
      <Card>
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Separator</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">Contenido arriba</p>
            <Separator />
            <p className="text-sm text-[var(--color-text-muted)]">Contenido abajo</p>
            <div className="flex items-center gap-4 h-16">
              <span className="text-sm text-[var(--color-text-muted)]">Izquierda</span>
              <Separator orientation="vertical" />
              <span className="text-sm text-[var(--color-text-muted)]">Derecha</span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ─── Breadcrumb ─── */}
      <Card>
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Breadcrumb</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Basico</p>
              <Breadcrumb>
                <Breadcrumb.Item href="/app">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item href="/app/patient">Pacientes</Breadcrumb.Item>
                <Breadcrumb.Item current>Juan Perez</Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Con separador custom</p>
              <Breadcrumb separator="/">
                <Breadcrumb.Item href="/app">Inicio</Breadcrumb.Item>
                <Breadcrumb.Item href="/app/appointment">Citas</Breadcrumb.Item>
                <Breadcrumb.Item current>2024-01-15</Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
        </Card.Body>
      </Card>
    </section>
  );
}
