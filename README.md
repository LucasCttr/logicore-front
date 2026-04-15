# LogiCore Front — Logistics Management Interface

## Description
- **Purpose**: Modern web interface for the LogiCore platform, visual complement to the backend. Learning project in Next.js with frontend best practices.
- **What it does**: Provides a dual-role UI for managing drivers, vehicles, locations, packages and shipments, with reactive forms, input validation and consumption of the [LogiCore API](https://github.com/LucasCttr/LogiCoreBack).
  - **Admin Interface**: Full CRUD for drivers, vehicles, locations, packages, shipments, users
  - **Driver Interface**: Mobile-optimized scanner for package collection, my shipments view, profile & license management
  - **Package Scanner**: Barcode-based workflow with state-aware actions (collect, drop at depot, deliver)
- **Backend**: [.NET API: https://github.com/LucasCttr/LogiCoreBack]

## Architecture
- **Pattern**: Modular component-based — separates responsibilities across `components`, `hooks`, `api`, `pages` and `types`.
- **Organization**: 
  - `app/`: Next.js routes (App Router) and layouts
  - `components/`: reusable components (forms, lists, filters, modals)
  - `hooks/`: custom hooks for data logic and state
  - `api/`: HTTP client and services to consume backend API
  - `schemas/`: validation with Zod
  - `types/`: shared TypeScript types

## Tech Stack
- **Language**: `TypeScript`
- **Framework**: `Next.js 15+` (App Router)
- **Styling**: `Tailwind CSS`
- **Validation**: `Zod` + `React Hook Form`
- **HTTP Client**: `Axios`
- **State**: `React Hooks` (useState, useContext)
- **Linters**: `ESLint`

## Main Libraries and Tools
- **Next.js**: React framework with SSR, SSG, API routes and automatic optimizations.
- **Tailwind CSS**: CSS utility framework for fast and consistent styling.
- **TypeScript**: static type safety and better DX.
- **Axios**: HTTP client with interceptors for authorization and error handling.
- **React Hook Form**: efficient management of reactive forms.
- **Zod**: schema validation at compile-time and runtime.
- **ESLint**: code linting to maintain quality and consistency.

## Repository Structure (Summary)
- **src/app/**: application routes, root layout and main pages (drivers, locations, packages, shipments, vehicles).
  - **app/driver/**: role-protected driver routes with AuthGuard (`/driver/shipments`, `/driver/scanner`, `/driver/profile`)
  - **app/shipments/[id]**: dynamic shipment detail page with timeline and package list
- **src/components/**: reusable components (lists, forms, filters, modals, header, sidebar).
  - `DepotIngressScanner.tsx`: barcode scanner with package collection workflow, smart action buttons
  - `AuthGuard.tsx`: role-based route protection (Admin / Driver)
  - `SectionHeader.tsx`: dynamic page titles based on route
- **src/hooks/**: custom hooks for fetching data, managing local state and validating logic.
- **src/api/**: Axios configuration, services for endpoints (drivers, vehicles, locations, packages, shipments).
- **src/schemas/**: Zod validation schemas for forms and data input.
- **src/types/**: shared TypeScript types for DTOs and domain model.
  - `scanner.ts`: PackageForScannerDto type
- **public/**: static assets.

## Best Practices and Conventions Applied
- **Separation of Concerns**: components (presentation), hooks (logic), api (communication).
- **Reusable Components**: generic lists, forms, filters and modals to avoid duplication.
- **Custom Hooks**: encapsulate data logic and state (e.g. `useDrivers`, `useVehicles`, `usePackages`).
- **Layered Validation**: Zod for schemas and React Hook Form for reactive UX.
- **Typed API Client**: Axios configured with TypeScript types for HTTP call safety.
- **Authentication**: HTTP client interceptors to manage JWT tokens; JWT token parsed for role extraction.
- **Role-Based Access Control**: AuthGuard component protects routes based on JWT audience claim (Admin / Driver roles).
- **Responsive Design**: Tailwind CSS with breakpoints for multiple screen sizes; mobile-optimized scanner UI.
- **Error Handling**: centralized error capture and user notification.
- **Loading States**: UI feedback while loading data (spinners, skeletons).
- **Dynamic Modals and Forms**: controlled components for creating, updating and deleting resources.
- **State-Aware UI**: Scanner and actions adapt based on package status and shipment type.

## Implemented Patterns
Below are the frontend patterns applied in the project:

- **Custom Hooks Pattern**: encapsulation of data logic (fetching, state, errors) in reusable hooks. Examples: `useDrivers`, `useVehicles`, `usePackages`, `useShipments`, `useLocations`.

- **Component Composition**: standard components (Form, List, Filter, Modal) composed to create specific views. Example: `DriverList`, `VehicleForm`, `PackageDetail`.

- **API Client Pattern**: centralization of HTTP client in `api/axiosClient.ts` with interceptors for authorization, content type and global error handling.

- **Schema Validation Pattern**: declarative validation with Zod in `schemas/` and binding to forms with React Hook Form.

- **Role-Based Routing**: JWT token parsing to extract user roles (Admin / Driver); `AuthGuard` component protects routes and conditionally renders UI based on role.

- **Context API**: optional global state for authentication and themes (if AuthGuard and providers are implemented).

- **Middleware / Interceptors**: Axios interceptors to inject JWT tokens and handle 401/403 errors.

- **Controlled Components**: React forms controlled with `react-hook-form` for real-time validation.

- **Responsive Layout**: Sidebar + Main Content with Tailwind CSS; adapts breakpoints for mobile/tablet/desktop; mobile-optimized scanner for field operations.

- **Loading & Error States**: conditional components for visual feedback during loading, success and error.

- **Scanner State Machine**: `DepotIngressScanner` implements state-aware actions based on package status:
  - Pending → Collect | Skip
  - InTransit → Drop at Depot
  - AtDepot → Customer Pickup (LastMile only)
  - Smart validation for shipment type before showing actions

- **Shipment Management UI**: 
  - Tab-based filtering (In Progress / Completed / All)
  - Dynamic column visibility based on shipment status
  - Timeline visualization for package delivery progress
  - Modal-based shipment selection for legacy assignment workflows

## How to Run Locally
1. Ensure you have `Node.js 18+` and `npm` or `pnpm` installed.
2. Clone the repository and navigate to the folder:

```bash
cd logicore-front
```

3. Install dependencies:

```bash
npm install
# or
pnpm install
```

4. Copy/adjust the API base URL in `src/api/axiosClient.ts` (usually `http://localhost:5000` in development).

5. Run the development server:

```bash
npm run dev
# or
pnpm dev
```

6. Open in your browser:

```
http://localhost:3000
```

## Environment Variables
Create a `.env.local` file in the project root if necessary:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Make sure the backend is running at the specified URL.

## Production Build
```bash
npm run build
npm run start
```

## Linting and Testing
```bash
npm run lint      # Run ESLint
npm run dev       # Development with hot-reload
```

## Deployment
- Compatible with platforms that support Next.js: Vercel, Netlify, Railway, AWS Amplify, etc.
- Simply connect the repo to Vercel for automatic deployment on each push to main.

## Next Steps
- Add unit tests (Jest + React Testing Library).
- Integrate WebSocket for real-time shipment updates.
- Optimize scanner performance for field operations (offline mode, batch updates).
- Add driver location tracking for better fleet visibility.
