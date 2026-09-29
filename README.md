# TODO App - Aplicación de Gestión de Tareas

🌐 **Demostración en Producción**: https://todo-app-m4-6inh.vercel.app

Una aplicación web moderna, ágil y reactiva para la gestión de tareas personales, desarrollada con **React 19**, **TypeScript** y **Vite**, e integrada con **Firebase** para la autenticación de usuarios y persistencia en tiempo real con **Cloud Firestore**, y **Amazon SES (AWS SDK)** mediante **Vercel Serverless Functions** para el envío de notificaciones y resúmenes por correo electrónico.

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

- ✉️ **Envío de Resúmenes por Correo con AWS SES & Vercel Serverless**:
  - Botón interactivo de envío de resumen (`<EmailSummaryButton />`) renderizado en la interfaz mediante **React Portal**.
  - Generación dinámica de reportes en formato **HTML** y texto plano con métricas de tareas pendientes y completadas.
  - API Serverless en la nube (`api/send-email.ts`) integrada con **Amazon Simple Email Service (AWS SES)** mediante `@aws-sdk/client-ses`.
  - Middleware de desarrollo local en `vite.config.ts` para probar peticiones a la API localmente durante `pnpm dev`.

- 🎨 **Filtros Avanzados y Personalización Visual**:
  - Buscador en tiempo real por título y descripción.
  - Filtrado por estado: *Todas*, *Pendientes* y *Completadas*.
  - Ordenamiento por tareas más recientes, más antiguas y alfabéticamente.
  - Alternador de tema en tiempo real (**Modo Oscuro** / **Modo Claro**).
  - Selector de color de acento de cliente (*Azul Eléctrico*, *Verde Esmeralda*, *Púrpura Neón*, *Ámbar Dorado*, *Rojo Carmesí*).

- 📱 **Diseño Responsivo Mobile-First**:
  - Construido utilizando la metodología **Mobile-First** con media queries basadas en `min-width`.
  - Adaptabilidad fluida desde smartphones hasta pantallas de escritorio de gran resolución.

- 🛡️ **Tipado Seguro y Manejo de Errores (TypeScript)**:
  - Manejo seguro de excepciones utilizando `unknown` y funciones de extracción de errores en bloques `catch`.

- 🧪 **Pruebas Automatizadas**:
  - Cobertura de pruebas unitarias y de integración para páginas y componentes principales (`Home`, `TaskCard`, `TaskForm`, `TaskList`, `ProtectedRoute`).

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Backend / BaaS**: [Firebase](https://firebase.google.com/) (Authentication & Cloud Firestore Database)
- **Email Serverless Engine**: [AWS SES (Amazon Simple Email Service)](https://aws.amazon.com/ses/) & [@aws-sdk/client-ses](https://www.npmjs.com/package/@aws-sdk/client-ses)
- **Deployment & Serverless Functions**: [Vercel](https://vercel.com/) (Serverless Node.js Engine)
- **Navegación**: [React Router v7](https://reactrouter.com/)
- **Testing**: [Vitest](https://vitest.dev/) y [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Estilos**: Vanilla CSS modular (Mobile-First)

---

## 📁 Estructura del Proyecto

```text
PI M4 TODO App/
├── api/
│   └── send-email.ts        # Ruta Serverless Function para enviar correos vía AWS SES en Vercel
├── src/
│   ├── components/          # Componentes (TaskCard, TaskForm, TaskList, ProtectedRoute, EmailSummaryButton)
│   ├── pages/               # Vistas principales (Login, Register, Home)
│   ├── services/            # Configuración de Firebase, taskService (Firestore) y errorUtils
│   ├── types/               # Definición de tipos e interfaces TypeScript
│   └── __tests__/           # Pruebas unitarias e integración con Vitest
├── vercel.json              # Configuración de rewrites para SPA y Serverless API
├── vite.config.ts           # Configuración de Vite, Vitest y middleware API local
└── package.json
```

---

## ⚙️ Configuración e Instalación Local

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/dburbanoh-dev/TODO-App---M4.git
cd "PI M4 TODO App"
pnpm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
# Configuración de Firebase
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Configuración de AWS SES
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=tu_aws_access_key_id
AWS_SECRET_ACCESS_KEY=tu_aws_secret_access_key
AWS_SES_SENDER_EMAIL=tu_correo_verificado_en_aws_ses@dominio.com
```

---

## 📜 Scripts Disponibles

En el proyecto puedes ejecutar los siguientes comandos:

| Comando | Descripción |
| :--- | :--- |
| `pnpm dev` | Inicia el servidor de desarrollo local con HMR y soporte local para la API `/api/send-email`. |
| `pnpm build` | Compila TypeScript y genera el build optimizado para producción en `dist/`. |
| `pnpm preview` | Previsualiza localmente el build de producción. |
| `pnpm test` | Ejecuta la suite de pruebas unitarias e integración con Vitest. |
| `pnpm lint` | Ejecuta el linter (ESLint) para verificar el código. |

---

## 🌐 Deploy en Producción

- 🔗 **URL de la Aplicación Desplegada**: [https://todo-app-m4-6inh.vercel.app](https://todo-app-m4-6inh.vercel.app)

### Pasos para Desplegar en Vercel:

1. **Configuración de Variables de Entorno en Vercel**:
   - En el panel de Vercel (**Settings** > **Environment Variables**), agrega todas las variables definidas en tu `.env` (Firebase y AWS SES):
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `AWS_REGION` (`us-east-2`)
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_SES_SENDER_EMAIL`

2. **Autorización de Dominio en Firebase Console**:
   - Accede a la [Consola de Firebase](https://console.firebase.google.com/).
   - Ve a **Authentication** > **Settings** > **Authorized Domains**.
   - Añade el dominio generado por Vercel (ejemplo: `todo-app-m4-6inh.vercel.app`).

3. **Comando de Build y Directorio de Salida**:
   - **Build Command**: `pnpm build` (o `npm run build`)
   - **Output Directory**: `dist`
   - **Rewrites**: En `vercel.json` se incluye la preservación de `/api/(.*)` para funciones serverless y la regla SPA `/(.*)` a `/index.html`.

---

## 🤖 Uso Crítico y Responsable de Inteligencia Artificial

Durante el proceso de desarrollo, refactorización e integración tecnológica de este proyecto, se emplearon herramientas de Inteligencia Artificial (IA) generativa como asistentes de programación. A continuación se documenta el enfoque de uso responsable, la metodología de revisión y las salvaguardas aplicadas:

### 1. Ámbitos de Aplicación de la IA
- **Integración Serverless y AWS SES**: Asistencia en el diseño de la ruta Serverless Function (`api/send-email.ts`) utilizando la versión v3 del SDK de AWS (`@aws-sdk/client-ses`) y el middleware de simulación API local para Vite en `vite.config.ts`.
- **Estructuración y Refactorización UI**: Implementación del componente `<EmailSummaryButton />` haciendo uso de **React Portal** para evitar trampas de contexto de apilamiento (*stacking context*) causadas por `backdrop-filter`.
- **Garantía de Tipado Seguro**: Identificación de tipados implícitos o inseguros (`catch (err: any)`) y diseño de funciones auxiliares con `unknown` y validación de tipos mediante `FirebaseError`.
- **Diseño de Pruebas Automatizadas**: Apoyo en la creación de mocks para Vitest y React Testing Library para simular de forma fiel el comportamiento de Firestore en entornos de integración.

### 2. Análisis y Validación Humana Crítica
- **Revisión de Código**: Todo snippet o solución sugerida por la IA fue auditado manualmente para garantizar que cumpliera estrictamente con los requisitos de la rúbrica (enfoque Mobile-First, separación modular de responsabilidades y contratos de API).

### 3. Aspectos Éticos, Seguridad y Privacidad
- **Protección de Credenciales y Push Protection**: Se aseguraron las claves de AWS y Firebase aislándolas estrictamente en variables de entorno `.env` y protegiendo el historial de Git mediante `.gitignore` para evitar filtraciones de secretos en repositorios públicos.
- **Autonomía y Aprendizaje**: La IA se utilizó como un catalizador de productividad y herramienta de consulta técnica, asegurando que las decisiones de diseño y la comprensión conceptual de la arquitectura pertenezcan íntegramente al desarrollador.
