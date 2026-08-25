# APP MEDICA (CONSULTAS MEDICAS) CON AI AGENTS - FRONTEND


## METODOLOGIA DE DESARROLLO (OOWS / Object-Oriented Web Solutions)
Es una metodología de desarrollo de de software orientada a la ingenieria web.

## VERTICAL SLICE ARCHITECTURE (ARQUITECTURA DE CORTES VERTICALES)
Se eligio porque es un enfoque de diseño de software que organiza el código por funcionalidades (o casos de uso) en lugar de por capas técnicas. Cada "corte" contiene lo necesario para que esa característica funcione, desde la interfaz de usuario hasta la base de datos.

```bash

[ FRONTEND: React + Tailwind ] ── (Modelo de Navegacional / Presentación)
       │                ▲
       │ (CRUD Directo) │ (Datos en tiempo real / Suscripciones al Modelo Dinámico)
       ▼                │
[ CORE: Supabase (DB + RLS + Auth + Índices de Clientes) ] ── (Modelo de Objetos)
       │
       │ (Webhooks por Evento de Clase: Insert / Update / Delete)
       ▼
[ MICROSERVICIO: FastAPI (CRM & IA) ] ── (Modelo Funcional)
       │
       ▼
[ Agentes IA / WhatsApp API ]
```

### Estructura de Carpetas
Nos ayudara a estructurar y mantener limpios nuestros repositorios.

### FRONTEND (REACT + TAILWINDCSS)
Aplicamos el principio de "Cortes Verticales" encapsulando la lógica de Supabase dentro de Hooks
personalizados por característica.

```
src/
├── components/          
│   ├── ui/              # Button, Input, Modal, Select, Card
│   └── navigation/      # Sidebar, Header
├── config/              # supabaseClient.ts (Inicialización del SDK)
├── router/              # routes.ts (configuración v7)
├── layouts/             
│   ├── AuthLayout.tsx   # Layout limpio (login/register)
│   └── AppLayout.tsx    # Layout con sidebar (app autenticada)
└── features/            # <--- CORTES VERTICALES
    ├── patients/        
    │   ├── components/  
    │   └── hooks/       
    ├── cie10/           
    │   ├── components/  
    │   └── hooks/       
    └── reminders/       
        ├── components/  
        └── hooks/       
```

### BACKEND (FASTAPI COMO MICROSERVICIO CRM)
FastAPI no manejara la base de datos principal, lo estructuraremos como un procesador de servicios externos guiado por eventos.

```
app/
├── core/                # Configuración de variables de entorno (OpenAI, Twilio, etc.)
├── services/            # Los "Cerebros" aislados
│   ├── ai_agent.py      # Agente de IA (recibe CIE-10 + medicamento y redacta)
│   └── messenger.py     # Integración con proveedor de mensajería (WhatsApp/SMS)
└── routers/             # Endpoints que escuchan a Supabase
    ├── webhooks.py      # Escucha cuando se inserta un recordatorio en Supabase
    └── crm_actions.py   # Triggers manuales lanzados desde tu panel de React

```

### RULES

## Integración

camelCase: React/TypeScript, Clases de Pydantic. Para variables, funciones y propiedades de objetos.

``` tsx
// Interfaces en PascalCase
interface Patient {
  patientId: string;       // propiedad en camelCase
  firstName: string;       // propiedad en camelCase
  cie10Code: string;       // propiedad en camelCase
}

export const usePatients = () => {
  // Estado en camelCase
  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  // Función en camelCase
  const savePatient = async (newPatientData: Patient) => {
    // Aquí se enviaría a Supabase (haciendo la conversión que veremos abajo)
    console.log(newPatientData);
  };

  return { activePatient, savePatient };
};
```

PascalCase: Componentes, Tipos, Interfaces.

```Python
from pydantic import BaseModel

# Clase en PascalCase
class PatientWebhookPayload(BaseModel):
    # Atributos en snake_case (coinciden nativamente con Supabase)
    patient_id: str
    first_name: str
    cie10_code: str
```

snake_case: FastAPI/Python, TablasSQL, Funciones de Postgres, Politicas RSL.

``` Supabase
-- Nombre de tabla en snake_case
create table patients (
  patient_id uuid default gen_random_uuid() primary key, -- snake_case
  first_name text not null,                              -- snake_case
  cie10_code text not null                               -- snake_case
);

-- Política RLS en snake_case
create policy allow_read_patients on patients 
  for select using (auth.uid() = user_id);
```


| Tecnología / Capa | Estilo de Caso | Elementos | Ejemplo |
| :--- | :--- | :--- | :--- |
| **React / TypeScript** | `camelCase` | Variables, funciones, hooks, props | `patientId`, `savePatient()` |
| **Frontend / Backend** | `PascalCase` | Componentes, interfaces, tipos, clases Pydantic | `PatientCard`, `interface Patient` |
| **FastAPI / Python** | `snake_case` | Atributos, funciones, métodos, variables | `patient_id`, `def get_patient():` |
| **Supabase / Postgres** | `snake_case` | Tablas, columnas, funciones SQL, políticas RLS | `patients`, `cie10_code` |

## Indentación

2 espacios: React / TypeScript / CSS.

```tsx
const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <aside>
      <button onClick={toggle}>Menú</button>
    </aside>
  );
};
```

4 espacios: FastAPI / Python.

```Python
def process_reminder(reminder_id: str) -> dict:
    """
    Procesa un recordatorio y devuelve su estado.
    """
    reminder = get_reminder(reminder_id)
    if reminder is None:
        raise HTTPException(status_code=404, detail="Not found")
    return {"id": reminder_id, "status": "processed"}
```

2 espacios: SQL (Postgres / Supabase).

```SQL
select
  patient_id,
  first_name,
  cie10_code
from patients
where created_at >= now() - interval '7 days'
order by last_name asc;
```

## TOOLS
You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# React + TypeScript + Vite + Tailwindcss
