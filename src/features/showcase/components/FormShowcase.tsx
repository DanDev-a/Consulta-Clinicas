import { useState } from "react";
import {
  RiDownloadLine,
  RiDeleteBinLine,
  RiAddLine,
  RiSettingsLine,
} from "react-icons/ri";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import Checkbox from "../../../components/ui/Checkbox";
import Toggle from "../../../components/ui/Toggle";
import DatePicker from "../../../components/ui/DatePicker";
import FileUpload from "../../../components/ui/FileUpload";
import Card from "../../../components/ui/Card";

export default function FormShowcase() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [checkboxA, setCheckboxA] = useState(true);
  const [checkboxB, setCheckboxB] = useState(false);
  const [toggleA, setToggleA] = useState(true);
  const [toggleB, setToggleB] = useState(false);
  const [dateValue, setDateValue] = useState("");

  const [inputError, setInputError] = useState("");
  const [selectError, setSelectError] = useState("");

  const toggleInputError = () => {
    setInputError(inputError ? "" : "Este campo es obligatorio");
  };

  const toggleSelectError = () => {
    setSelectError(selectError ? "" : "Seleccioná una opción");
  };

  return (
    <section aria-label="Formularios">
      {/* ─── Buttons ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Button
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            {/* Variantes */}
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Variantes
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>

            {/* Tamaños */}
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Tamaños
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* Con iconos */}
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Con Iconos
              </p>
              <div className="flex flex-wrap gap-2">
                <Button icon={RiDownloadLine}>Descargar</Button>
                <Button icon={RiDeleteBinLine} variant="danger">
                  Eliminar
                </Button>
                <Button icon={RiAddLine} variant="secondary">
                  Agregar
                </Button>
                <Button icon={RiSettingsLine} variant="ghost">
                  Config
                </Button>
                <Button icon={RiDownloadLine} iconPosition="right">
                  Descargar
                </Button>
              </div>
            </div>

            {/* Loading */}
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Loading States
              </p>
              <div className="flex flex-wrap gap-2">
                <Button loading>Cargando...</Button>
                <Button loading variant="secondary">
                  Cargando...
                </Button>
                <Button loading variant="danger">
                  Cargando...
                </Button>
              </div>
            </div>

            {/* Disabled */}
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Disabled
              </p>
              <div className="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <Button disabled variant="secondary">
                  Disabled
                </Button>
              </div>
            </div>

            {/* Full width */}
            <div>
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Full Width
              </p>
              <Button fullWidth icon={RiDownloadLine}>
                Botón de ancho completo
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ─── Inputs ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Input & DatePicker
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Con error"
              placeholder="Este campo tiene error"
              value={inputError}
              onChange={(e) => setInputError(e.target.value)}
              error="Este campo es obligatorio"
            />
            <Input
              label="Deshabilitado"
              placeholder="No podés escribir"
              disabled
            />
            <DatePicker
              label="Fecha de nacimiento"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
            />
            <DatePicker label="Fecha con error" error="Fecha inválida" />
          </div>
          <div className="mt-3">
            <Button size="sm" variant="ghost" onClick={toggleInputError}>
              Toggle error state
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ─── Select & Textarea ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Select & Textarea
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Especialidad"
              placeholder="Seleccionar..."
              options={[
                { value: "clinica", label: "Clínica General" },
                { value: "pediatria", label: "Pediatría" },
                { value: "cardiologia", label: "Cardiología" },
                { value: "derma", label: "Dermatología" },
              ]}
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
            />
            <Select
              label="Select con error"
              placeholder="Elegí una opción"
              options={[
                { value: "a", label: "Opción A" },
                { value: "b", label: "Opción B" },
              ]}
              error={selectError || undefined}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Observaciones"
                placeholder="Escribí las observaciones del paciente..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Textarea con error"
                placeholder="Error state..."
                error="Máximo 500 caracteres"
              />
            </div>
          </div>
          <div className="mt-3">
            <Button size="sm" variant="ghost" onClick={toggleSelectError}>
              Toggle select error
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ─── Checkbox & Toggle ─── */}
      <Card className="mb-6">
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Checkbox & Toggle
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">
                Checkboxes
              </p>
              <Checkbox
                label="Notificaciones por email"
                checked={checkboxA}
                onChange={(e) => setCheckboxA(e.target.checked)}
              />
              <Checkbox
                label="Notificaciones por WhatsApp"
                checked={checkboxB}
                onChange={(e) => setCheckboxB(e.target.checked)}
              />
              <Checkbox label="Deshabilitado" disabled />
              <Checkbox label="Con error" error="Requerido" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">
                Toggles
              </p>
              <Toggle
                label="Modo oscuro"
                checked={toggleA}
                onChange={setToggleA}
              />
              <Toggle
                label="Modo claro"
                checked={toggleB}
                onChange={setToggleB}
              />
              <Toggle
                label="Deshabilitado"
                checked={false}
                onChange={() => {}}
                disabled
              />
              <Toggle
                label="Con error"
                checked={false}
                onChange={() => {}}
                error="Error"
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ─── FileUpload ─── */}
      <Card>
        <Card.Header>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            FileUpload
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            <FileUpload
              onUpload={(file) => console.log("Upload:", file.name)}
              onRemove={(file) => console.log("Remove:", file.name)}
              multiple
            />
            <FileUpload
              accept={["application/pdf"]}
              maxSizeMB={5}
              label="Subir documento PDF"
              onUpload={(file) => console.log("PDF:", file.name)}
            />
          </div>
        </Card.Body>
      </Card>
    </section>
  );
}
