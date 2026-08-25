# AppMedica — Documentación

## Tabla de contenidos

1. [Introducción](#introducción)
2. [Temas](#temas)
3. [Tokens de Color](#tokens-de-color)
4. [Componentes UI](#componentes-ui)
5. [Componentes de Navegación](#componentes-de-navegación)
6. [Componentes Web](#componentes-web)
7. [Layouts](#layouts)
8. [Hooks](#hooks)

---

## Introducción

AppMedica es una aplicación médica construida con:

- **React 19** + **TypeScript**
- **Tailwind CSS v4** (con `@theme` para tokens)
- **Vite 8** como bundler
- **React Router 7** para navegación
- **Supabase** como backend
- **react-icons** (Remix Icon set)
- **react-hot-toast** para notificaciones
- **Recharts** para gráficos

### Arquitectura de componentes

```
src/
├── components/
│   ├── ui/          → 27 componentes reutilizables (compound components)
│   ├── navigation/  → Header, Sidebar
│   └── web/         → Navbar, Footer, MobileMenu (landing)
├── features/        → Módulos por dominio (patients, appointments, etc.)
├── hooks/           → useTheme
├── layouts/         → AppLayout, AuthLayout, WebLayout
├── config/          → supabaseClient
└── router/          → rutas
```

Todos los componentes UI usan **CSS variables del tema** (`var(--color-*)`) en lugar de colores hardcodeados, lo que permite el cambio dinámico de temas sin recargar la app.

### Convenciones

- Componentes **compound components** (Card, Dropdown, Tabs, DataTable, Breadcrumb)
- Todos extienden sus nativos HTML (`ButtonHTMLAttributes`, `InputHTMLAttributes`, etc.)
- `forwardRef` en Input y Textarea para composición con librerías de formularios
- Iconos vía `react-icons` (componente `IconType`)
- Accesibilidad: `aria-*` attributes, `role`, focus management, keyboard navigation

---

## Temas

### Disponibles

| ID | Nombre UI | Tipo | Descripción |
|---|---|---|---|
| `catppuccin-mocha` | Moka Relajante | Dark | Tema por defecto. Tonos violeta/azul oscuro. |
| `catppuccin-latte` | Crema Suave | Light | Equivalente claro de Catppuccin. |
| `tailwind-dark` | Clinico Oscuro | Dark | Slate oscuro con acento azul. |
| `tailwind-light` | Clinico Claro | Light | Blanco puro con acento azul GitHub. |
| `nord` | Artico Quirúrgico | Dark | Azules polares, frío y profesional. |
| `gruvbox-light` | Calido Humano | Light | Tonos cálidos ámbar/marrón. |

### Cómo funciona el sistema de temas

1. Cada tema define un conjunto de **CSS variables** en `src/index.css` bajo selectores `[data-theme="..."]`
2. El hook `useTheme()` setea `data-theme` en `<html>` y persiste la elección en `localStorage`
3. Los componentes consumen las variables via clases Tailwind: `bg-[var(--color-surface)]`, `text-[var(--color-text)]`, etc.
4. La transición entre temas es suave gracias a `transition: background-color, border-color, text-color 300ms`

### Cambio de tema

```tsx
import { useTheme } from './hooks/useTheme';

function MiComponente() {
  const { theme, setTheme, toggleTheme, allThemes } = useTheme();

  // Toggle rápido entre Mocha ↔ Latte
  toggleTheme();

  // Seleccionar un tema específico
  setTheme('nord');

  // Iterar sobre todos los temas
  allThemes.map(t => <button key={t} onClick={() => setTheme(t)}>{t}</button>);
}
```

### ThemeToggle (botón visual)

```tsx
import { ThemeToggle } from './components/ui/ThemeToggle';

// Botón con icono de luna/sol + toast notification
<ThemeToggle />
```

Muestra un toast con el nombre del tema al cambiar. Alterna solo entre `catppuccin-mocha` ↔ `catppuccin-latte`.

### Persistencia

- **localStorage key:** `appmedica-theme`
- Si el valor guardado no es válido, vuelve al default (`catppuccin-mocha`)
- Soporte SSR: si `window` no existe, usa el default sin errores

---

## Tokens de Color

Cada tema define estas variables CSS. Todas se usan con `var(--color-*)` en clases Tailwind.

### Superficie

| Token | Descripción |
|---|---|
| `--color-bg` | Fondo principal de la página |
| `--color-surface` | Fondo de tarjetas, sidebar, header |
| `--color-surface-alt` | Fondo alternativo (hover, items secundarios) |
| `--color-surface-elevated` | Fondo elevado (modales, dropdowns, toasts) |

### Texto

| Token | Descripción |
|---|---|
| `--color-text` | Texto principal |
| `--color-text-muted` | Texto secundario / descriptivo |
| `--color-text-subtle` | Texto terciario / placeholders |
| `--color-text-inverse` | Texto sobre fondos de acento (botones) |

### Acento

| Token | Descripción |
|---|---|
| `--color-accent` | Color primario de la marca |
| `--color-accent-hover` | Variante hover del acento |
| `--color-accent-soft` | Fondo semitransparente del acento (badges, highlights) |

### Borde

| Token | Descripción |
|---|---|
| `--color-border` | Borde principal |
| `--color-border-light` | Borde sutil (separadores internos) |

### Input

| Token | Descripción |
|---|---|
| `--color-input-bg` | Fondo de inputs, selects, textareas |
| `--color-input-border` | Borde de inputs |

### Estados

| Token | Descripción |
|---|---|
| `--color-success` | Verde de éxito |
| `--color-success-soft` | Fondo semitransparente de éxito |
| `--color-danger` | Rojo de error/peligro |
| `--color-danger-soft` | Fondo semitransparente de error |
| `--color-warning` | Amarillo de advertencia |
| `--color-warning-soft` | Fondo semitransparente de advertencia |

### Valores por tema

| Token | Mocha | Latte | TW Dark | TW Light | Nord | Gruvbox |
|---|---|---|---|---|---|---|
| `bg` | `#1e1e2e` | `#eff1f5` | `#0f172a` | `#ffffff` | `#2e3440` | `#fbf1c7` |
| `surface` | `#313244` | `#e6e9ef` | `#1e293b` | `#f6f8fa` | `#3b4252` | `#ebdbb2` |
| `surface-alt` | `#45475a` | `#ccd0da` | `#334155` | `#eaeef2` | `#434c5e` | `#d5c4a1` |
| `text` | `#cdd6f4` | `#4c4f69` | `#f8fafc` | `#1f2328` | `#eceff4` | `#3c3836` |
| `accent` | `#89b4fa` | `#1e66f5` | `#3b82f6` | `#0969da` | `#88c0d0` | `#076678` |
| `border` | `#45475a` | `#dce0e8` | `#334155` | `#d0d7de` | `#434c5e` | `#d5c4a1` |
| `success` | `#a6e3a1` | `#40a02b` | `#22c55e` | `#1a7f37` | `#a3be8c` | `#79740e` |
| `danger` | `#f38ba8` | `#d20f39` | `#ef4444` | `#cf222e` | `#bf616a` | `#9d0006` |
| `warning` | `#f9e2af` | `#df8e1d` | `#eab308` | `#bf8700` | `#ebcb8b` | `#b57614` |

---

## Componentes UI

Todos se importan desde `src/components/ui/` o desde el barrel `./components/ui`.

```tsx
import { Button, Card, Modal } from './components/ui';
```

---

### Alert

Componente de notificación inline con 4 variantes visuales.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'success' \| 'danger' \| 'warning' \| 'info'` | `'info'` | Variante visual |
| `title` | `string` | — | Título opcional |
| `icon` | `IconType` | — | Icono de react-icons |
| `onClose` | `() => void` | — | Si se provee, muestra botón de cerrar |
| `children` | `ReactNode` | — | Contenido del alert |

**Ejemplo:**

```tsx
import { Alert } from './components/ui';
import { RiCheckLine } from 'react-icons/ri';

<Alert variant="success" title="Guardado" icon={RiCheckLine}>
  Paciente registrado correctamente.
</Alert>

<Alert variant="danger" onClose={() => setshow(false)}>
  Error al conectar con el servidor.
</Alert>
```

**Accesibilidad:** `role="alert"` automático.

---

### Avatar

Muestra imagen de perfil o iniciales generadas automáticamente.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `src` | `string` | — | URL de la imagen |
| `name` | `string` | — | Nombre completo (para iniciales) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del avatar |

**Ejemplo:**

```tsx
import { Avatar } from './components/ui';

// Con imagen
<Avatar src="/foto.jpg" name="Juan Pérez" size="lg" />

// Con iniciales (muestra "JP")
<Avatar name="Juan Pérez" />

// Tamaño pequeño
<Avatar name="María López" size="sm" />
```

**Lógica de iniciales:** Toma la primera letra de las primeras 2 palabras, las convierte a mayúsculas.

---

### Badge

Etiqueta de estado small con 5 variantes de color.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'success' \| 'danger' \| 'warning' \| 'info' \| 'neutral'` | `'neutral'` | Variante de color |
| `size` | `'sm' \| 'md'` | `'sm'` | Tamaño |
| `children` | `ReactNode` | — | Texto del badge |

**Ejemplo:**

```tsx
import { Badge } from './components/ui';

<Badge variant="success">Activo</Badge>
<Badge variant="danger" size="md">Urgente</Badge>
<Badge variant="info">En consulta</Badge>
```

**Accesibilidad:** `role="status"`.

---

### Breadcrumb

Navegación de migas de pan con soporte para links y estado actual.

**Compound components:** `Breadcrumb` (root) + `Breadcrumb.Item`

**Props de Breadcrumb:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `separator` | `ReactNode` | `→` (RiArrowRightSLine) | Separador entre items |
| `children` | `ReactNode` | — | Breadcrumb.Item elements |
| `className` | `string` | `''` | Clases extra |

**Props de Breadcrumb.Item:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `href` | `string` | — | URL (renderiza como `<a>`) |
| `current` | `boolean` | `false` | Marca como página actual |
| `children` | `ReactNode` | — | Texto del item |
| `className` | `string` | `''` | Clases extra |

**Ejemplo:**

```tsx
import { Breadcrumb } from './components/ui';

<Breadcrumb>
  <Breadcrumb.Item href="/app">Inicio</Breadcrumb.Item>
  <Breadcrumb.Item href="/app/patient">Pacientes</Breadcrumb.Item>
  <Breadcrumb.Item current>Juan Pérez</Breadcrumb.Item>
</Breadcrumb>
```

**Accesibilidad:** `<nav aria-label="Breadcrumb">`, `aria-current="page"` en el item actual.

---

### Button

Botón con 5 variantes, 3 tamaños, soporte de icono y estado de carga.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost' \| 'outline'` | `'primary'` | Variante visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño |
| `icon` | `IconType` | — | Icono de react-icons |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Posición del icono |
| `loading` | `boolean` | `false` | Muestra spinner, desactiva el botón |
| `fullWidth` | `boolean` | `false` | Ancho completo |
| `disabled` | `boolean` | `false` | Desactivado |
| `className` | `string` | `''` | Clases extra |
| `children` | `ReactNode` | — | Texto del botón |

Plus todas las props nativas de `HTMLButtonElement`.

**Ejemplo:**

```tsx
import { Button } from './components/ui';
import { RiSaveLine, RiDeleteBinLine } from 'react-icons/ri';

<Button variant="primary" icon={RiSaveLine}>Guardar</Button>

<Button variant="danger" icon={RiDeleteBinLine} iconPosition="right">
  Eliminar
</Button>

<Button variant="secondary" loading={isSaving} fullWidth>
  Guardando...
</Button>

<Button variant="ghost" size="sm">Cancelar</Button>
```

**Variantes:**

| Variante | Estilo |
|---|---|
| `primary` | Fondo acento, texto inverso |
| `secondary` | Fondo surface-alt, borde, texto normal |
| `danger` | Fondo rojo, texto inverso |
| `ghost` | Transparente, hover surface-alt |
| `outline` | Transparente, borde, hover surface-alt |

**Accesibilidad:** `aria-busy` cuando `loading=true`, `disabled` automático.

---

### Card

Tarjeta compuesta con Header, Body y Footer.

**Compound components:** `Card` (root) + `Card.Header` + `Card.Body` + `Card.Footer`

**Props (todos los sub-componentes):**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | `ReactNode` | — | Contenido |
| `className` | `string` | `''` | Clases extra |

Plus todas las props nativas de su elemento HTML (`<article>`, `<header>`, `<div>`, `<footer>`).

**Ejemplo:**

```tsx
import { Card } from './components/ui';

<Card>
  <Card.Header>
    <h3>Datos del paciente</h3>
  </Card.Header>
  <Card.Body>
    <p>Nombre: Juan Pérez</p>
    <p>DNI: 12345678</p>
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">Editar</Button>
  </Card.Footer>
</Card>
```

---

### Checkbox

Checkbox con label integrado y soporte de error.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | — | Texto del label |
| `error` | `string` | — | Mensaje de error |
| `id` | `string` | — | ID custom (auto-generado del label si se omite) |
| `className` | `string` | `''` | Clases extra |

Plus todas las props nativas de `HTMLInputElement` (excepto `type`).

**Ejemplo:**

```tsx
import { Checkbox } from './components/ui';

<Checkbox label="Acepto los términos" checked={accepted} onChange={...} />

<Checkbox
  label="Notificaciones"
  error="Debes aceptar para continuar"
/>
```

**Accesibilidad:** `aria-describedby` y `aria-invalid` automáticos cuando hay error.

---

### DataTable

Tabla de datos con sorting, selección múltiple, estados de carga y vacío.

**Compound components:** `DataTable` (root) + `DataTable.Column`

**Props de DataTable:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `data` | `T[]` | — | Array de datos |
| `keyField` | `string` | `'id'` | Campo clave de cada fila |
| `loading` | `boolean` | `false` | Estado de carga (muestra skeleton) |
| `emptyTitle` | `string` | `'Sin resultados'` | Título del estado vacío |
| `emptyDescription` | `string` | — | Descripción del estado vacío |
| `onRowClick` | `(row: T) => void` | — | Callback al hacer click en fila |
| `selectable` | `boolean` | `false` | Habilita selección múltiple |
| `selectedRows` | `string[]` | — | Filas seleccionadas (controlado) |
| `onSelectionChange` | `(ids: string[]) => void` | — | Callback de selección |
| `pagination` | `ReactNode` | — | Componente de paginación |
| `children` | `ReactNode` | — | `DataTable.Column` elements |
| `className` | `string` | `''` | Clases extra |

**Props de DataTable.Column:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `header` | `string` | — | Texto del encabezado |
| `sortKey` | `string` | — | Clave para sorting (habilita click en header) |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alineación |
| `children` | `(row: T) => ReactNode` | — | Render function de la celda |

**Ejemplo:**

```tsx
import { DataTable, Badge } from './components/ui';

interface Paciente {
  id: string;
  nombre: string;
  dni: string;
  estado: 'activo' | 'inactivo';
}

const pacientes: Paciente[] = [...];

<DataTable
  data={pacientes}
  selectable
  onRowClick={(p) => navigate(`/app/patient/${p.id}`)}
  pagination={<Pagination currentPage={1} totalPages={5} onPageChange={...} />}
>
  <DataTable.Column header="Nombre" sortKey="nombre">
    {(row) => row.nombre}
  </DataTable.Column>
  <DataTable.Column header="DNI" sortKey="dni">
    {(row) => row.dni}
  </DataTable.Column>
  <DataTable.Column header="Estado">
    {(row) => (
      <Badge variant={row.estado === 'activo' ? 'success' : 'neutral'}>
        {row.estado}
      </Badge>
    )}
  </DataTable.Column>
</DataTable>
```

**Comportamiento:**
- Sorting: click en header para alternar asc/desc
- Selección: checkbox individual + checkbox "seleccionar todo" en header
- Loading: muestra 5 filas skeleton
- Vacío: muestra `EmptyState` con título personalizado

---

### DatePicker

Input de fecha nativo con icono de calendario y soporte de error.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | — | Texto del label |
| `error` | `string` | — | Mensaje de error |
| `id` | `string` | — | ID custom |
| `className` | `string` | `''` | Clases extra |

Plus todas las props nativas de `HTMLInputElement` (excepto `type`).

**Ejemplo:**

```tsx
import { DatePicker } from './components/ui';

<DatePicker
  label="Fecha de nacimiento"
  value={birthDate}
  onChange={(e) => setBirthDate(e.target.value)}
/>

<DatePicker label="Fecha de cita" error="La fecha es obligatoria" />
```

**Accesibilidad:** `aria-describedby` y `aria-invalid` automáticos.

---

### Dropdown

Menú desplegable con navegación por teclado completa.

**Compound components:** `Dropdown` (root) + `Dropdown.Trigger` + `Dropdown.Menu` + `Dropdown.Item` + `Dropdown.Separator` + `Dropdown.Label`

**Props de Dropdown:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | `ReactNode` | — | Sub-componentes |
| `className` | `string` | `''` | Clases extra |

**Props de Dropdown.Trigger:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | `ReactNode` | — | Elemento trigger (se le clonan event handlers) |
| `icon` | `IconType` | — | Icono antes del trigger |
| `showArrow` | `boolean` | `false` | Muestra flecha de expansión |
| `className` | `string` | `''` | Clases extra |

**Props de Dropdown.Menu:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | `ReactNode` | — | Items del menú |
| `align` | `'left' \| 'right'` | `'left'` | Alineación del menú |
| `width` | `'auto' \| 'trigger' \| number` | `'auto'` | Ancho del menú |
| `className` | `string` | `''` | Clases extra |

**Props de Dropdown.Item:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `children` | `ReactNode` | — | Texto del item |
| `icon` | `IconType` | — | Icono del item |
| `danger` | `boolean` | `false` | Estilo rojo (eliminar, etc.) |
| `disabled` | `boolean` | `false` | Deshabilitado |
| `onClick` | `() => void` | — | Callback al seleccionar |
| `className` | `string` | `''` | Clases extra |

**Ejemplo:**

```tsx
import { Dropdown, Button } from './components/ui';
import { RiMoreLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri';

<Dropdown>
  <Dropdown.Trigger showArrow>
    <Button variant="ghost" size="sm">Acciones</Button>
  </Dropdown.Trigger>
  <Dropdown.Menu align="right" width="trigger">
    <Dropdown.Label>Opciones</Dropdown.Label>
    <Dropdown.Item icon={RiEditLine} onClick={handleEdit}>Editar</Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item icon={RiDeleteBinLine} danger onClick={handleDelete}>
      Eliminar
    </Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>
```

**Accesibilidad:** Navegación con flechas (↑↓), Home/End, Escape para cerrar, `role="menu"` y `role="menuitem"`, focus trap.

---

### EmptyState

Estado vacío con icono, título, descripción y acción opcional.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `icon` | `IconType` | `RiInboxLine` | Icono principal |
| `title` | `string` | — | Título |
| `description` | `string` | — | Descripción |
| `action` | `ReactNode` | — | Botón o link de acción |

**Ejemplo:**

```tsx
import { EmptyState, Button } from './components/ui';
import { RiUserLine } from 'react-icons/ri';

<EmptyState
  icon={RiUserLine}
  title="Sin pacientes"
  description="Aún no se registró ningún paciente."
  action={<Button variant="primary">Agregar paciente</Button>}
/>
```

---

### FileUpload

Dropzone de archivos con drag & drop, validación de tipo y tamaño, y lista de archivos.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `accept` | `string[]` | `['application/pdf', 'image/png', 'image/jpeg']` | MIME types permitidos |
| `maxSizeMB` | `number` | `10` | Tamaño máximo en MB |
| `onUpload` | `(file: File) => void \| Promise<void>` | — | Callback al subir archivo |
| `onRemove` | `(file: File) => void` | — | Callback al eliminar archivo |
| `multiple` | `boolean` | `false` | Permitir múltiples archivos |
| `label` | `string` | `'Arrastrá un archivo...'` | Texto del dropzone |
| `error` | `string` | — | Mensaje de error externo |
| `disabled` | `boolean` | `false` | Deshabilitado |
| `className` | `string` | `''` | Clases extra |

**Ejemplo:**

```tsx
import { FileUpload } from './components/ui';

<FileUpload
  accept={['application/pdf', 'image/png']}
  maxSizeMB={5}
  onUpload={async (file) => {
    const { error } = await supabase.storage.from('docs').upload(file.name, file);
    if (error) setError(error.message);
  }}
  onRemove={(file) => console.log('Eliminado:', file.name)}
/>

<FileUpload multiple label="Subir estudios" />
```

**Comportamiento:**
- Drag & drop visual con highlight del borde
- Validación de tipo MIME y tamaño
- Lista de archivos con nombre, tamaño y botón de eliminar
- Icono diferente para imágenes vs. otros archivos

---

### Input

Input de texto con label y soporte de error.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | — | Texto del label |
| `error` | `string` | — | Mensaje de error |
| `id` | `string` | — | ID custom |
| `className` | `string` | `''` | Clases extra |

Plus todas las props nativas de `HTMLInputElement`. Soporta `ref` via `forwardRef`.

**Ejemplo:**

```tsx
import { Input } from './components/ui';

<Input label="Nombre" value={nombre} onChange={...} />

<Input
  label="Email"
  type="email"
  placeholder="juan@ejemplo.com"
  error="El email es obligatorio"
/>

<Input label="Teléfono" disabled />
```

**Accesibilidad:** Label asociado via `htmlFor`/`id`, `aria-describedby` y `aria-invalid` automáticos.

---

### Modal

Diálogo modal con portal, trap de foco, y cierre con Escape.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `isOpen` | `boolean` | — | Controla visibilidad |
| `onClose` | `() => void` | — | Callback de cierre |
| `title` | `string` | — | Título del modal |
| `children` | `ReactNode` | — | Contenido del modal |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Ancho máximo |

**Ejemplo:**

```tsx
import { Modal, Button } from './components/ui';

const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Abrir modal</Button>

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nuevo paciente">
  <form onSubmit={handleSubmit}>
    <Input label="Nombre" value={nombre} onChange={...} />
    <div className="mt-4 flex justify-end gap-2">
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
      <Button variant="primary" type="submit">Guardar</Button>
    </div>
  </form>
</Modal>
```

**Comportamiento:**
- Renderiza via `createPortal` al `document.body`
- Bloquea scroll del body mientras está abierto
- Trap de foco: Tab循环 dentro del modal
- Restaura foco al elemento que lo abrió al cerrar
- Click en overlay cierra el modal
- Escape cierra el modal

**Accesibilidad:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`.

---

### PageHeader

Encabezado de página con título, subtítulo y área de acciones.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | — | Título principal |
| `subtitle` | `string` | — | Subtítulo |
| `actions` | `ReactNode` | — | Botones o acciones |

**Ejemplo:**

```tsx
import { PageHeader, Button } from './components/ui';
import { RiAddLine } from 'react-icons/ri';

<PageHeader
  title="Pacientes"
  subtitle="Gestión de pacientes registrados"
  actions={<Button icon={RiAddLine}>Nuevo paciente</Button>}
/>
```

---

### Pagination

Paginación con elipsis para muchas páginas.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `currentPage` | `number` | — | Página actual |
| `totalPages` | `number` | — | Total de páginas |
| `onPageChange` | `(page: number) => void` | — | Callback al cambiar página |

**Ejemplo:**

```tsx
import { Pagination } from './components/ui';

<Pagination currentPage={3} totalPages={10} onPageChange={setPage} />
```

**Comportamiento:**
- Si `totalPages <= 1`, no se renderiza
- Muestra elipsis (`...`) cuando hay más de 7 páginas
- Botones anterior/siguiente deshabilitados en extremos

---

### SearchInput

Input de búsqueda con icono de lupa y debounce configurable.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `onSearch` | `(value: string) => void` | — | Callback con el valor (debounced) |
| `debounceMs` | `number` | `300` | Milisegundos de debounce |
| `placeholder` | `string` | `'Buscar...'` | Placeholder |
| `value` | `string` | — | Valor controlado |
| `className` | `string` | `''` | Clases extra |

Plus todas las props nativas de `HTMLInputElement` (excepto `onChange`).

**Ejemplo:**

```tsx
import { SearchInput } from './components/ui';

<SearchInput onSearch={handleSearch} placeholder="Buscar pacientes..." />

// Controlado
<SearchInput value={query} onSearch={handleSearch} debounceMs={500} />
```

---

### Select

Select nativo estilizado con label, opciones, placeholder y error.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | — | Texto del label |
| `options` | `SelectOption[]` | — | Array de `{ value, label, disabled? }` |
| `error` | `string` | — | Mensaje de error |
| `placeholder` | `string` | — | Opción placeholder (deshabilitada) |
| `id` | `string` | — | ID custom |
| `className` | `string` | `''` | Clases extra |

Plus todas las props nativas de `HTMLSelectElement`.

**Ejemplo:**

```tsx
import { Select } from './components/ui';

<Select
  label="Especialidad"
  placeholder="Seleccionar..."
  options={[
    { value: 'clinica', label: 'Clínica General' },
    { value: 'pediatria', label: 'Pediatría' },
    { value: 'cardio', label: 'Cardiología' },
  ]}
  value={especialidad}
  onChange={(e) => setEspecialidad(e.target.value)}
/>

<Select
  label="Obra social"
  options={[...]}
  error="Seleccioná una obra social"
/>
```

**Accesibilidad:** `aria-describedby` y `aria-invalid` automáticos.

---

### Separator

Línea separadora horizontal o vertical.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Orientación |
| `className` | `string` | `''` | Clases extra |

**Ejemplo:**

```tsx
import { Separator } from './components/ui';

<Separator />

<Separator orientation="vertical" className="h-6" />
```

---

### Skeleton

Placeholder de carga con 3 variantes.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `lines` | `number` | `3` | Cantidad de líneas (variante text) |
| `variant` | `'text' \| 'rectangular' \| 'circular'` | `'text'` | Variante visual |
| `className` | `string` | `''` | Clases extra |

**Ejemplo:**

```tsx
import { Skeleton } from './components/ui';

// Texto (3 líneas por defecto)
<Skeleton />

// Texto con 5 líneas
<Skeleton lines={5} />

// Rectángulo (card placeholder)
<Skeleton variant="rectangular" className="h-48" />

// Círculo (avatar placeholder)
<Skeleton variant="circular" className="h-10 w-10" />
```

**Accesibilidad:** `aria-busy="true"`, `aria-label="Cargando contenido"`.

---

### Spinner

Indicador de carga circular animado.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño |
| `className` | `string` | `''` | Clases extra |

**Ejemplo:**

```tsx
import { Spinner } from './components/ui';

<Spinner size="sm" />   {/* 16px - para botones */}
<Spinner size="md" />   {/* 24px - default */}
<Spinner size="lg" />   {/* 32px - para pages */}
```

**Accesibilidad:** `role="status"`, `aria-label="Cargando"`.

---

### Tabs

Sistema de pestañas con navegación por teclado.

**Compound components:** `Tabs` (root) + `Tabs.List` + `Tabs.Tab` + `Tabs.Panel`

**Props de Tabs:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `defaultActiveTab` | `string` | — | Tab activa por defecto |
| `onChange` | `(value: string) => void` | — | Callback al cambiar tab |
| `children` | `ReactNode` | — | Sub-componentes |

**Props de Tabs.Tab:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `string` | — | Identificador de la tab |
| `label` | `string` | — | Texto de la tab |
| `icon` | `IconType` | — | Icono opcional |
| `disabled` | `boolean` | `false` | Deshabilitada |

**Props de Tabs.Panel:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `string` | — | Debe coincidir con el tab |
| `children` | `ReactNode` | — | Contenido |
| `className` | `string` | `''` | Clases extra |

**Ejemplo:**

```tsx
import { Tabs } from './components/ui';
import { RiUserLine, RiCalendarLine } from 'react-icons/ri';

<Tabs defaultActiveTab="datos" onChange={(v) => console.log(v)}>
  <Tabs.List>
    <Tabs.Tab value="datos" label="Datos" icon={RiUserLine} />
    <Tabs.Tab value="citas" label="Citas" icon={RiCalendarLine} />
  </Tabs.List>

  <Tabs.Panel value="datos">
    <p>Formulario de datos del paciente</p>
  </Tabs.Panel>
  <Tabs.Panel value="citas">
    <p>Historial de citas</p>
  </Tabs.Panel>
</Tabs>
```

**Accesibilidad:** `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`.

---

### Textarea

Textarea con label y soporte de error.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | — | Texto del label |
| `error` | `string` | — | Mensaje de error |
| `rows` | `number` | `4` | Filas visibles |
| `id` | `string` | — | ID custom |
| `className` | `string` | `''` | Clases extra |

Plus todas las props nativas de `HTMLTextAreaElement`. Soporta `ref` via `forwardRef`.

**Ejemplo:**

```tsx
import { Textarea } from './components/ui';

<Textarea label="Observaciones" value={notes} onChange={...} />

<Textarea
  label="Diagnóstico"
  rows={6}
  placeholder="Describir diagnóstico..."
  error="El diagnóstico es obligatorio"
/>
```

---

### ThemeToggle

Botón que alterna entre temas con notificación toast.

**Props:** Ninguna.

**Ejemplo:**

```tsx
import { ThemeToggle } from './components/ui';

<ThemeToggle />
```

**Comportamiento:**
- Alterna solo entre `catppuccin-mocha` ↔ `catppuccin-latte`
- Muestra toast con el nombre del tema cambiado
- Icono: luna (dark) / sol (light)

---

### Toggle

Switch on/off con label.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | — | Texto del label |
| `checked` | `boolean` | — | Estado actual |
| `onChange` | `(checked: boolean) => void` | — | Callback al cambiar |
| `disabled` | `boolean` | `false` | Deshabilitado |
| `error` | `string` | — | Mensaje de error |
| `id` | `string` | — | ID custom |

**Ejemplo:**

```tsx
import { Toggle } from './components/ui';

<Toggle
  label="Notificaciones por email"
  checked={notifications}
  onChange={setNotifications}
/>

<Toggle label="Modo oscuro" checked={dark} onChange={setDark} disabled />
```

**Accesibilidad:** `role="switch"`, `aria-checked`, `aria-describedby`, `aria-invalid`.

---

### Tooltip

Tooltip positioned con delay configurable.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `content` | `ReactNode` | — | Contenido del tooltip |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Posición |
| `delayMs` | `number` | `300` | Milisegundos de delay |
| `children` | `ReactNode` | — | Elemento trigger |

**Ejemplo:**

```tsx
import { Tooltip, Button } from './components/ui';

<Tooltip content="Guardar cambios" placement="bottom">
  <Button variant="primary" icon={RiSaveLine} />
</Tooltip>

<Tooltip content="Eliminar registro" placement="right" delayMs={500}>
  <Button variant="danger" size="sm" icon={RiDeleteBinLine} />
</Tooltip>
```

**Accesibilidad:** `role="tooltip"`, `aria-describedby` en el trigger, soporte de focus (onFocus/onBlur).

---

## Componentes de Navegación

### Header

Barra superior fija con título y acciones.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | — | Título del header |
| `children` | `ReactNode` | — | Acciones (iconos, botones) |
| `className` | `string` | `''` | Clases extra |

**Ejemplo:**

```tsx
import Header from './components/navigation/Header';
import { ThemeToggle } from './components/ui';

<Header title="Mi App">
  <ThemeToggle />
  <span>👤</span>
</Header>
```

---

### Sidebar

Barra lateral de navegación con menú dinámico. Responsive: horizontal en móvil (bottom bar), vertical en desktop.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `className` | `string` | `''` | Clases extra |

**Items de navegación (hardcoded):**

| Ruta | Label | Icono |
|---|---|---|
| `/app` | Dashboard | RiDashboardLine |
| `/app/patient` | Pacientes | RiUserHeartLine |
| `/app/appointment` | Citas | RiCalendarEventLine |
| `/app/ai-system` | Sistema IA | RiRobot2Line |
| `/app/setting` | Configuración | RiSettingsLine |

**Comportamiento:**
- Móvil: barra horizontal fija abajo (h-16), solo iconos
- Desktop: barra vertical fija a la izquierda (w-64), iconos + labels
- Resalta la ruta activa con `bg-accent-soft text-accent`
- Configuración aparece como último item en desktop, como icono separado en móvil

---

## Componentes Web

Componentes para la landing page pública.

### Navbar

Barra de navegación de la landing con links de anclaje y CTA.

**Props:** Ninguna (configurada internamente).

**Links de navegación:**
- Inicio (`#inicio`)
- Especialidades (`#especialidades`)
- Equipo (`#equipo`)
- Contacto (`#contacto`)

**Comportamiento:**
- Fija arriba con `backdrop-blur`
- Botón "Sacar turno" que lleva a `/auth/register`
- Móvil: botón hamburguesa que abre `MobileMenu`
- Logo: "N" + "Clínica Nova"

---

### Footer

Footer de la landing con información de contacto y links.

**Props:** Ninguna (configurada internamente).

**Secciones:**
- Info de la clínica (dirección, teléfono, email, horarios)
- Especialidades
- Clínica (links internos)
- Legal

---

### MobileMenu

Menú móvil expandible para la landing.

**Props:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `open` | `boolean` | — | Controla visibilidad |
| `onClose` | `() => void` | — | Callback de cierre |
| `links` | `{ label: string; href: string }[]` | — | Links de navegación |

**Ejemplo:**

```tsx
import MobileMenu from './components/web/MobileMenu';

<MobileMenu
  open={isOpen}
  onClose={() => setIsOpen(false)}
  links={[
    { label: 'Inicio', href: '#inicio' },
    { label: 'Especialidades', href: '#especialidades' },
  ]}
/>
```

---

## Layouts

### AppLayout

Layout principal de la aplicación autenticada. Grid con sidebar + header + contenido.

**Estructura:**

```
┌──────────────────────────────────────┐
│  Sidebar (mobile: bottom bar)       │
│  ┌──────────┬───────────────────────┐│
│  │          │  Header               ││
│  │  Sidebar │───────────────────────││
│  │  (desk)  │  <Outlet />           ││
│  │          │  (contenido)          ││
│  └──────────┴───────────────────────┘│
└──────────────────────────────────────┘
```

- Móvil: Sidebar como barra inferior, header arriba
- Desktop: Sidebar fijo a la izquierda (16rem), header arriba, contenido con `<Outlet />`
- Incluye `ThemeToggle` en el header

---

### AuthLayout

Layout para páginas de autenticación (login, register). Centrado con tarjeta.

**Estructura:**

```
┌──────────────────────────────┐
│                              │
│     ┌──────────────────┐     │
│     │   🩺 Clínica Nova │     │
│     │                  │     │
│     │   ┌──────────┐   │     │
│     │   │ <Outlet/>│   │     │
│     │   └──────────┘   │     │
│     │                  │     │
│     │   © 2026 ...     │     │
│     └──────────────────┘     │
│                              │
└──────────────────────────────┘
```

- Centrado vertical y horizontal
- Logo de estetoscopio + nombre
- Tarjeta con `surface` background
- Footer con copyright

---

### WebLayout

Layout para la landing page pública. Navbar + contenido + Footer.

**Estructura:**

```
┌──────────────────────────────┐
│  Navbar (fija arriba)        │
├──────────────────────────────┤
│  <Outlet />                  │
│  (contenido landing)         │
├──────────────────────────────┤
│  Footer                     │
└──────────────────────────────┘
```

- Navbar fija con `backdrop-blur`
- Contenido con `pt-14` para compensar la navbar
- Footer al final

---

## Hooks

### useTheme

Hook para gestionar el tema de la aplicación.

**Retorno:**

| Prop | Tipo | Descripción |
|---|---|---|
| `theme` | `MedicalTheme` | Tema actual |
| `setTheme` | `(theme: MedicalTheme) => void` | Establecer tema |
| `toggleTheme` | `() => void` | Alternar Mocha ↔ Latte |
| `allThemes` | `readonly MedicalTheme[]` | Lista de todos los temas |

**Tipo `MedicalTheme`:**

```ts
type MedicalTheme =
  | 'catppuccin-mocha'
  | 'catppuccin-latte'
  | 'tailwind-dark'
  | 'tailwind-light'
  | 'nord'
  | 'gruvbox-light';
```

**Uso básico:**

```tsx
import { useTheme } from './hooks/useTheme';

function App() {
  const { theme, setTheme, toggleTheme, allThemes } = useTheme();

  return (
    <div>
      <p>Tema actual: {theme}</p>
      <button onClick={toggleTheme}>Cambiar tema</button>
      <select value={theme} onChange={(e) => setTheme(e.target.value as MedicalTheme)}>
        {allThemes.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
}
```

**Persistencia:** Guarda en `localStorage` con key `appmedica-theme`. Se inicializa en el lazy initializer de `useState` para evitar flashes.

**Notas:**
- El `toggleTheme()` solo alterna entre `catppuccin-mocha` y `catppuccin-latte`
- Para acceder a los otros 4 temas, usá `setTheme()` directamente
- El tipo `MedicalTheme` se actualiza automáticamente al agregar temas al array `THEMES`
