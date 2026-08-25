import { useState } from "react";
import {
  RiAlertLine,
  RiInformationLine,
  RiCheckLine,
  RiCloseLine,
} from "react-icons/ri";
import Badge from "../../../components/ui/Badge";
import Alert from "../../../components/ui/Alert";
import Avatar from "../../../components/ui/Avatar";
import Tooltip from "../../../components/ui/Tooltip";
import Spinner from "../../../components/ui/Spinner";
import Skeleton from "../../../components/ui/Skeleton";
import EmptyState from "../../../components/ui/EmptyState";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

export default function FeedbackShowcase() {
  const [alertVisible, setAlertVisible] = useState(true);

  return (
    <section aria-label="Feedback">
      {/* ─── Badges ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Badge
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Variantes
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Confirmada</Badge>
                <Badge variant="danger">Cancelada</Badge>
                <Badge variant="warning">Pendiente</Badge>
                <Badge variant="info">En análisis</Badge>
                <Badge variant="neutral">Neutra</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Tamaños
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info" size="sm">
                  Pequeño
                </Badge>
                <Badge variant="info" size="md">
                  Mediano
                </Badge>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ─── Alerts ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Alert
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-3">
            <Alert variant="info" title="Información" icon={RiInformationLine}>
              Esta es una alerta informativa. Mostrá datos relevantes al
              usuario.
            </Alert>
            <Alert variant="success" title="Éxito" icon={RiCheckLine}>
              La cita se confirmó correctamente. El paciente será notificado por
              WhatsApp.
            </Alert>
            <Alert variant="warning" title="Atención" icon={RiAlertLine}>
              El paciente tiene alergias registradas. Verificá antes de recetar.
            </Alert>
            <Alert variant="danger" title="Error" icon={RiCloseLine}>
              No se pudo conectar con el servidor. Intentá nuevamente.
            </Alert>
            {alertVisible && (
              <Alert
                variant="info"
                title="Cerrable"
                onClose={() => setAlertVisible(false)}
              >
                Hacé click en la X para cerrar esta alerta.
              </Alert>
            )}
            {!alertVisible && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAlertVisible(true)}
              >
                Mostrar alerta cerrable
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* ─── Avatars ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Avatar
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Con imagen
              </p>
              <div className="flex items-center gap-3">
                <Avatar
                  src="https://i.pravatar.cc/150?img=1"
                  name="Dr. Ruiz"
                  size="sm"
                />
                <Avatar
                  src="https://i.pravatar.cc/150?img=1"
                  name="Dr. Ruiz"
                  size="md"
                />
                <Avatar
                  src="https://i.pravatar.cc/150?img=1"
                  name="Dr. Ruiz"
                  size="lg"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Fallback (iniciales)
              </p>
              <div className="flex items-center gap-3">
                <Avatar name="Alejandro Ruiz" size="sm" />
                <Avatar name="Sofía Peralta" size="md" />
                <Avatar name="Lucas Benítez" size="lg" />
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ─── Spinners ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Spinner
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="flex items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </Card.Body>
      </Card>

      {/* ─── Skeletons ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Skeleton
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Text (3 líneas)
              </p>
              <Skeleton lines={3} />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Text (5 líneas)
              </p>
              <Skeleton lines={5} />
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                  Circular
                </p>
                <Skeleton variant="circular" className="h-12 w-12" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                  Rectangular
                </p>
                <Skeleton variant="rectangular" className="h-24 w-full" />
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ─── EmptyState ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            EmptyState
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-6">
            <EmptyState
              title="No hay pacientes"
              description="Aún no se registraron pacientes en el sistema."
              action={<Button size="sm">Agregar paciente</Button>}
            />
            <EmptyState
              title="Sin resultados"
              description="No se encontraron resultados para tu búsqueda."
            />
          </div>
        </Card.Body>
      </Card>

      {/* Tooltips */}
      <Card>
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Tooltip
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-wrap gap-6">
            <Tooltip content="Arriba" placement="top">
              <span className="underline decoration-dotted cursor-pointer text-[var(--color-accent)]">
                Top
              </span>
            </Tooltip>
            <Tooltip content="Abajo" placement="bottom">
              <span className="underline decoration-dotted cursor-pointer text-[var(--color-accent)]">
                Bottom
              </span>
            </Tooltip>
            <Tooltip content="Izquierda" placement="left">
              <span className="underline decoration-dotted cursor-pointer text-[var(--color-accent)]">
                Left
              </span>
            </Tooltip>
            <Tooltip content="Derecha" placement="right">
              <span className="underline decoration-dotted cursor-pointer text-[var(--color-accent)]">
                Right
              </span>
            </Tooltip>
          </div>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Ejemplo médico:{" "}
            <Tooltip content="Enfermedad isquémica del corazón (I25.1)">
              <span className="underline decoration-dotted cursor-pointer text-[var(--color-accent)]">
                I25.1
              </span>
            </Tooltip>
          </p>
        </Card.Body>
      </Card>
    </section>
  );
}
