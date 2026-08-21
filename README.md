# TODO App - Aplicación de Gestión de Tareas

Una aplicación web moderna, ágil y reactiva para la gestión de tareas personales, desarrollada con **React 19**, **TypeScript** y **Vite**, e integrada con **Firebase** para la autenticación de usuarios y persistencia de datos en la nube.

---

## 🚀 Características Principales

- 🔐 **Sistema de Autenticación**:
  - Registro e inicio de sesión con correo electrónico y contraseña.
  - Inicio de sesión rápido mediante el proveedor de **Google**.
  - Control de sesiones activas y cierre de sesión seguro.

- 📋 **Gestión de Tareas (CRUD)**:
  - Crear nuevas tareas especificando título y descripción.
  - Alternar el estado de cada tarea (Pendiente / Completada).
  - Visualizar la fecha y hora de creación formateada.
  - Eliminar tareas no deseadas.
  - Asociación de tareas al perfil y `userId` del usuario autenticado.

- 🧪 **Pruebas Automatizadas**:
  - Cobertura de pruebas unitarias y de integración para páginas y componentes principales (`Home`, `TaskCard`, `TaskForm`, `TaskList`).

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Backend / BaaS**: [Firebase](https://firebase.google.com/) (Authentication & Firestore Database)
- **Navegación**: [React Router v7](https://reactrouter.com/)
- **Testing**: [Vitest](https://vitest.dev/) y [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Estilos**: Vanilla CSS modular y limpio

---

## 📁 Estructura del Proyecto

```text
src/
├── components/      # Componentes reutilizables (TaskCard, TaskForm, TaskList)
├── pages/           # Vistas principales (Login, Register, Home)
├── services/        # Configuración e inicialización de Firebase
├── types/           # Definición de tipos e interfaces TypeScript
└── __tests__/       # Pruebas unitarias e integración con Vitest
```

---

## ⚙️ Configuración e Instalación

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone <URL_DEL_REPOSITORIO>
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
| `pnpm build` | Compila TypeScript y genera el build optimizado para producción. |
| `pnpm preview` | Previsualiza localmente el build de producción. |
| `pnpm test` | Ejecuta la suite de pruebas unitarias con Vitest. |
| `pnpm lint` | Ejecuta el linter (ESLint) para verificar el código. |

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
