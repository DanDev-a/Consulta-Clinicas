import { useState } from "react";
import {
  RiUserLine,
  RiFileListLine,
  RiSettingsLine,
  RiEditLine,
  RiDeleteBinLine,
  RiShareLine,
  RiDownloadLine,
  RiMoreLine,
  RiUserAddLine,
  RiHistoryLine,
  RiArchiveLine,
} from "react-icons/ri";
import Modal from "../../../components/ui/Modal";
import Dropdown from "../../../components/ui/Dropdown";
import Button from "../../../components/ui/Button";
import Tabs from "../../../components/ui/Tabs";
import SearchInput from "../../../components/ui/SearchInput";
import Pagination from "../../../components/ui/Pagination";
import Card from "../../../components/ui/Card";

export default function NavigationShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<"sm" | "md" | "lg">("md");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <section aria-label="Navegacion">
      {/* Modal */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Modal
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setModalSize("sm");
                setModalOpen(true);
              }}
            >
              Modal pequeno
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setModalSize("md");
                setModalOpen(true);
              }}
            >
              Modal mediano
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setModalSize("lg");
                setModalOpen(true);
              }}
            >
              Modal grande
            </Button>
          </div>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirmar accion"
            size={modalSize}
          >
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Esta es una demostracion del componente Modal. Se cierra con
              Escape o haciendo click afuera. El foco se atrapa dentro del modal
              para accesibilidad.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={() => setModalOpen(false)}>
                Confirmar
              </Button>
            </div>
          </Modal>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Tabs
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">
                Basicas
              </p>
              <Tabs defaultActiveTab="tab1">
                <Tabs.List>
                  <Tabs.Tab value="tab1" label="General" />
                  <Tabs.Tab value="tab2" label="Datos" />
                  <Tabs.Tab value="tab3" label="Notas" />
                </Tabs.List>
                <Tabs.Panel value="tab1">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Contenido de la pestana General.
                  </p>
                </Tabs.Panel>
                <Tabs.Panel value="tab2">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Contenido de la pestana Datos.
                  </p>
                </Tabs.Panel>
                <Tabs.Panel value="tab3">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Contenido de la pestana Notas.
                  </p>
                </Tabs.Panel>
              </Tabs>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">
                Con iconos
              </p>
              <Tabs defaultActiveTab="perfil">
                <Tabs.List>
                  <Tabs.Tab value="perfil" label="Perfil" icon={RiUserLine} />
                  <Tabs.Tab
                    value="archivos"
                    label="Archivos"
                    icon={RiFileListLine}
                  />
                  <Tabs.Tab
                    value="config"
                    label="Config"
                    icon={RiSettingsLine}
                  />
                </Tabs.List>
                <Tabs.Panel value="perfil">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Informacion del perfil del doctor.
                  </p>
                </Tabs.Panel>
                <Tabs.Panel value="archivos">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Archivos adjuntos del paciente.
                  </p>
                </Tabs.Panel>
                <Tabs.Panel value="config">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Configuracion de la cuenta.
                  </p>
                </Tabs.Panel>
              </Tabs>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Dropdown */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Dropdown</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Basico</p>
              <Dropdown>
                <Dropdown.Trigger showArrow>
                  <Button variant="outline" size="sm">Acciones</Button>
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Item icon={RiEditLine} onClick={() => console.log('Editar')}>Editar</Dropdown.Item>
                  <Dropdown.Item icon={RiShareLine} onClick={() => console.log('Compartir')}>Compartir</Dropdown.Item>
                  <Dropdown.Item icon={RiDownloadLine} onClick={() => console.log('Descargar')}>Descargar</Dropdown.Item>
                  <Dropdown.Separator />
                  <Dropdown.Item icon={RiDeleteBinLine} danger onClick={() => console.log('Eliminar')}>Eliminar</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Con icono en trigger</p>
              <Dropdown>
                <Dropdown.Trigger icon={RiMoreLine} showArrow>
                  <Button variant="ghost" size="sm">Opciones</Button>
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Label>Paciente</Dropdown.Label>
                  <Dropdown.Item icon={RiUserAddLine}>Agregar a lista</Dropdown.Item>
                  <Dropdown.Item icon={RiHistoryLine}>Ver historial</Dropdown.Item>
                  <Dropdown.Separator />
                  <Dropdown.Label>Administracion</Dropdown.Label>
                  <Dropdown.Item icon={RiArchiveLine}>Archivar</Dropdown.Item>
                  <Dropdown.Item icon={RiDeleteBinLine} danger>Eliminar registro</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Solo icono (trigger minimalista)</p>
              <Dropdown>
                <Dropdown.Trigger>
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] transition-colors cursor-pointer">
                    <RiMoreLine size={18} />
                  </span>
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Item icon={RiEditLine}>Editar</Dropdown.Item>
                  <Dropdown.Item icon={RiShareLine}>Compartir</Dropdown.Item>
                  <Dropdown.Item icon={RiDeleteBinLine} danger>Eliminar</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Alineado a la derecha</p>
              <div className="flex justify-end">
                <Dropdown>
                  <Dropdown.Trigger showArrow>
                    <Button variant="ghost" size="sm" icon={RiSettingsLine}>Config</Button>
                  </Dropdown.Trigger>
                  <Dropdown.Menu align="right">
                    <Dropdown.Item icon={RiEditLine}>Editar</Dropdown.Item>
                    <Dropdown.Item icon={RiShareLine}>Compartir</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-3">Item deshabilitado</p>
              <Dropdown>
                <Dropdown.Trigger showArrow>
                  <Button variant="outline" size="sm">Con opciones</Button>
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Item icon={RiEditLine}>Editar</Dropdown.Item>
                  <Dropdown.Item icon={RiArchiveLine} disabled>No disponible</Dropdown.Item>
                  <Dropdown.Item icon={RiDeleteBinLine} danger>Eliminar</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* SearchInput */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            SearchInput
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="max-w-md">
            <SearchInput
              placeholder="Buscar pacientes..."
              onSearch={(v) => console.log("Search:", v)}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Pagination */}
      <Card>
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Pagination
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            <Pagination
              currentPage={currentPage}
              totalPages={10}
              onPageChange={setCurrentPage}
            />
            <p className="text-xs text-[var(--color-text-subtle)]">
              Pagina actual: {currentPage}
            </p>
          </div>
        </Card.Body>
      </Card>
    </section>
  );
}
