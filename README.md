# LogiCore Front — Interfaz de gestión de logística

## Descripción
- **Propósito**: Interfaz web moderna para la plataforma LogiCore, complemento visual del backend. Proyecto de aprendizaje en Next.js con buenas prácticas de frontend.
- **Qué hace**: Proporciona una UI para gestionar conductores, vehículos, ubicaciones, paquetes y envíos, con formularios reactivos, validación de entrada y consumo de la [API LogiCore](https://github.com/LucasCttr/LogiCoreBack).
- **Backend**: [.NET API: https://github.com/LucasCttr/LogiCoreBack]

## Arquitectura
- **Patrón**: Modular component-based — separa responsabilidades en `components`, `hooks`, `api`, `pages` y `types`.
- **Organización**: 
  - `app/`: rutas de Next.js (App Router) y layouts
  - `components/`: componentes reutilizables (formularios, listas, filtros, modales)
  - `hooks/`: custom hooks para lógica de datos y estado
  - `api/`: cliente HTTP y servicios para consumir la API backend
  - `schemas/`: validación con Zod
  - `types/`: tipos TypeScript compartidos

## Stack tecnológico
- **Lenguaje**: `TypeScript`
- **Framework**: `Next.js 15+` (App Router)
- **Styling**: `Tailwind CSS`
- **Validación**: `Zod` + `React Hook Form`
- **HTTP Client**: `Axios`
- **Estado**: `React Hooks` (useState, useContext)
- **Linters**: `ESLint`

## Librerías y herramientas principales
- **Next.js**: framework React con SSR, SSG, API routes y optimizaciones automáticas.
- **Tailwind CSS**: framework de utilidades CSS para estilado rápido y consistente.
- **TypeScript**: tranquilidad de tipos estática y mejor DX.
- **Axios**: cliente HTTP con interceptores para autorización y manejo de errores.
- **React Hook Form**: gestión eficiente de formularios reactivos.
- **Zod**: validación de esquemas en tiempo de compilación y ejecución.
- **ESLint**: linting de código para mantener calidad y consistencia.

## Estructura del repositorio (resumen)
- **src/app/**: rutas de la aplicación, layout raíz y páginas principales (drivers, locations, packages, shipments, vehicles).
- **src/components/**: componentes reutilizables (listas, formularios, filtros, modales, header, sidebar).
- **src/hooks/**: custom hooks para fetchear datos, gestionar estado local y validar lógica.
- **src/api/**: configuración de Axios, servicios para endpoints (drivers, vehicles, locations, packages, shipments).
- **src/schemas/**: esquemas de validación Zod para formularios y entrada de datos.
- **src/types/**: tipos compartidos de TypeScript para DTOs y modelo de dominio.
- **public/**: assets estáticos.

## Buenas prácticas y convenciones aplicadas
- **Separación de concerns**: componentes (presentación), hooks (lógica), api (comunicación).
- **Componentes reutilizables**: listas, formularios, filtros y modales genéricos para evitar duplicación.
- **Custom hooks**: encapsulan lógica de datos y estado (ej. `useDrivers`, `useVehicles`, `usePackages`).
- **Validación en capas**: Zod para esquemas y React Hook Form para UX reactiva.
- **Typed API client**: Axios configurado con tipos TypeScript para seguridad en llamadas HTTP.
- **Autenticación**: interceptores en el cliente HTTP para gestionar tokens (JWT).
- **Responsive design**: Tailwind CSS con breakpoints para múltiples tamaños de pantalla.
- **Error handling**: captura centralizada de errores y notificación al usuario.
- **Loading states**: UI feedback mientras se cargan datos (spinners, skeletons).
- **Modales y formularios dinámicos**: componentes controlados para crear, actualizar y eliminar recursos.

## Patrones implementados
A continuación se detallan los patrones de frontend aplicados en el proyecto:

- **Custom Hooks Pattern**: encapsulación de lógica de datos (fetching, estado, errores) en hooks reutilizables. Ejemplos: `useDrivers`, `useVehicles`, `usePackages`, `useShipments`, `useLocations`.

- **Component Composition**: componentes estándar (Form, List, Filter, Modal) compuestos para crear vistas específicas. Ejemplo: `DriverList`, `VehicleForm`, `PackageDetail`.

- **API Client Pattern**: centralización del cliente HTTP en `api/axiosClient.ts` con interceptores para autorización, tipo de contenido y manejo de errores global.

- **Schema Validation Pattern**: validación declarativa con Zod en `schemas/` y vinculación a formularios con React Hook Form.

- **Context API**: estado global opcional para autenticación y temas (si se implementa AuthGuard y providers).

- **Middleware / Interceptors**: Axios interceptors para inyectar tokens JWT y manejo de errores 401/403.

- **Controlled Components**: formularios React controlados con `react-hook-form` para validación en tiempo real.

- **Responsive Layout**: Sidebar + Main Content con Tailwind CSS; adapta breakpoints para mobile/tablet/desktop.

- **Loading & Error States**: componentes condicionales para feedback visual durante carga, éxito y error.

## Cómo ejecutar localmente
1. Asegúrate de tener instalado `Node.js 18+` y `npm` o `pnpm`.
2. Clona el repositorio y navega a la carpeta:

```bash
cd logicore-front
```

3. Instala dependencias:

```bash
npm install
# o
pnpm install
```

4. Copia/ajusta la URL base de la API en `src/api/axiosClient.ts` (suele ser `http://localhost:5000` en desarrollo).

5. Ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
pnpm dev
```

6. Abre en el navegador:

```
http://localhost:3000
```

## Variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto si es necesario:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Asegúrate de que el backend esté corriendo en la URL especificada.

## Build para producción
```bash
npm run build
npm run start
```

## Linting y testing
```bash
npm run lint      # Ejecuta ESLint
npm run dev       # Desarrollo con hot-reload
```

## Despliegue
- Compatible con plataformas que soporten Next.js: Vercel, Netlify, Railway, AWS Amplify, etc.
- Suele ser suficiente conectar el repo a Vercel para despliegue automático en cada push a main.

## Próximos pasos
- Finalizar todas las vistas y validaciones.
- Agregar pruebas unitarias (Jest + React Testing Library).
- Integrar WebSocket para actualizaciones en tiempo real de envíos.
