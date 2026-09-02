# TODO App - Aplicación de Gestión de Tareas

🌐 **Demostración en Producción**: [https://todo-app-m4-28t8.vercel.app]

Una aplicación web moderna, ágil y reactiva para la gestión de tareas personales, desarrollada con **React**, **TypeScript** y **Vite**, e integrada con **Firebase** para la autenticación de usuarios y persistencia en tiempo real con **Cloud Firestore**.

---

## 🚀 Características Principales

- 🔐 **Sistema de Autenticación y Protección de Rutas**:
  - Registro e inicio de sesión con correo electrónico y contraseña.
  - Inicio de sesión rápido mediante el proveedor de **Google**.
  - Control de sesiones activas y protección de rutas (`<ProtectedRoute>`).
  - Cierre de sesión seguro y manejo preciso de errores de autenticación.

- 📋 **Persistencia y Gestión de Tareas en Firestore (CRUD)**:
  - Crear nuevas tareas especificando título y descripción.
  - Sincronización en tiempo real (`onSnapshot`) vinculada por `userId`.
  - Alternar el estado de cada tarea (Pendiente / Completada).
  - Visualizar la fecha y hora de creación formateada.
  - Eliminar tareas no deseadas.

- 📱 **Diseño Responsivo Mobile-First**:
  - Construido utilizando la metodología **Mobile-First** con media queries basadas en `min-width`.
  - Adaptabilidad fluida desde smartphones hasta pantallas de escritorio de gran resolución.

- 🛡️ **Tipado Seguro y Manejo de Errores (TypeScript)**:
  - Manejo seguro de excepciones utilizando `unknown` y funciones de extracción de errores de Firebase en bloques `catch`.

- 🧪 **Pruebas Automatizadas**:
  - Cobertura de pruebas unitarias y de integración para páginas y componentes principales (`Home`, `TaskCard`, `TaskForm`, `TaskList`, `ProtectedRoute`).

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Backend / BaaS**: [Firebase](https://firebase.google.com/) (Authentication & Cloud Firestore Database)
- **Navegación**: [React Router v7](https://reactrouter.com/)
- **Testing**: [Vitest](https://vitest.dev/) y [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Estilos**: Vanilla CSS modular (Mobile-First)

---

## 📁 Estructura del Proyecto

```text
src/
├── components/      # Componentes reutilizables (TaskCard, TaskForm, TaskList, ProtectedRoute)
├── pages/           # Vistas principales (Login, Register, Home)
├── services/        # Configuración de Firebase, taskService (Firestore) y errorUtils
├── types/           # Definición de tipos e interfaces TypeScript
└── __tests__/       # Pruebas unitarias e integración con Vitest
```

---

## ⚙️ Configuración e Instalación Local

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone <https://github.com/dburbanoh-dev/TODO-App---M4.git>
cd "PI M4 TODO App"
pnpm install # o npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

---

## 📜 Scripts Disponibles

En el proyecto puedes ejecutar los siguientes comandos:

| Comando | Descripción |
| :--- | :--- |
| `pnpm dev` | Inicia el servidor de desarrollo local con HMR. |
| `pnpm build` | Compila TypeScript y genera el build optimizado para producción en `dist/`. |
| `pnpm preview` | Previsualiza localmente el build de producción. |
| `pnpm test` | Ejecuta la suite de pruebas unitarias e integración con Vitest. |
| `pnpm lint` | Ejecuta el linter (ESLint) para verificar el código. |

---

## 🌐 Deploy en Producción

- 🔗 **URL de la Aplicación Desplegada**: [https://todo-app-m4-28t8.vercel.app](https://todo-app-m4-28t8.vercel.app)

### Pasos para Desplegar en Vercel / Firebase Hosting:

1. **Configuración de Variables de Entorno en Producción**:
   - En el panel del proveedor de hosting (ej. Vercel), agrega las variables definidas en tu `.env`:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

2. **Autorización de Dominio en Firebase Console**:
   - Accede a la [Consola de Firebase](https://console.firebase.google.com/).
   - Ve a **Authentication** > **Settings** > **Authorized Domains**.
   - Añade el dominio generado por tu hosting (ejemplo: `tu-app.vercel.app`).

3. **Comando de Build y Directorio de Salida**:
   - **Build Command**: `pnpm build` (o `npm run build`)
   - **Output Directory**: `dist`
   - **Single Page Application Rewrite**: En Vercel se incluye `vercel.json` configurado con `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`.

---

## 🤖 Uso Crítico y Responsable de Inteligencia Artificial

Durante el proceso de desarrollo y refactorización técnica de este proyecto, se emplearon herramientas de Inteligencia Artificial (IA) generativa como asistentes de programación. A continuación se documenta el enfoque de uso responsable, la metodología de revisión y las salvaguardas aplicadas:

### 1. Ámbitos de Aplicación de la IA
- **Estructuración y Refactorización**: Asistencia en la transición del almacenamiento local a la arquitectura en tiempo real con Firestore (`taskService.ts`) y la implementación del componente de protección de rutas (`<ProtectedRoute>`).
- **Garantía de Tipado Seguro**: Identificación de tipados implícitos o inseguros (`catch (err: any)`) y diseño de funciones auxiliares con `unknown` y validación de tipos mediante `FirebaseError`.
- **Diseño de Pruebas Automatizadas**: Apoyo en la creación de mocks para Vitest y React Testing Library para simular de forma fiel el comportamiento de Firestore en entornos de integración.

### 2. Análisis y Validación Humana Crítica
- **Revisión de Código**: Todo snippet o solución sugerida por la IA fue auditado manualmente para garantizar que cumpliera estrictamente con los requisitos de la rúbrica (enfoque Mobile-First, separación modular de responsabilidades y contratos de API).

### 3. Aspectos Éticos, Seguridad y Privacidad
- **Protección de Credenciales**: Nunca se introdujeron claves de API, tokens ni información sensible en los prompts. Las variables de entorno permanecieron aisladas en archivos `.env` no subidos al control de versiones.
- **Autonomía y Aprendizaje**: La IA se utilizó como un catalizador de productividad y herramienta de consulta técnica, asegurando que las decisiones de diseño y la comprensión conceptual de la arquitectura pertenezcan íntegramente al desarrollador.

---
