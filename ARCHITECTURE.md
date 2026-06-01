# Architecture & Standards Compliance

This document explains how HealthWatch maps to the rules in `Structure.md` and records the few intentional, documented deviations.

## Backend — Layered Module Architecture

Every request flows through the mandated pipeline:

```
Route → Zod Validation → Controller → Service → Repository → Database
```

```
backend/src/
├── configuration/      # env, prisma client, constants
├── helper/             # api-response, app-error, async-handler, logger, pagination
├── middleware/         # auth, validate, error, logging, audit
├── modules/
│   ├── auth/           # auth.router · auth.controller · auth.service · auth.repository · auth.schema
│   ├── user/
│   ├── barangay/
│   ├── disease/
│   ├── case/
│   ├── risk-report/
│   ├── alert/
│   ├── dashboard/
│   ├── export/
│   ├── early-warning/  # shared rule-based service + repository
│   └── public/
├── types/              # global types
├── routes.ts           # aggregates module routers under /api
├── server.ts           # app assembly (cors, helmet, middleware, routes)
└── index.ts            # entry point (loads env, then boots server)
```

Layer responsibilities (enforced):
- **Router** — endpoint definitions + middleware only.
- **Schema** — Zod validation, applied by `validate()` middleware before the controller.
- **Controller** — parse request, call service, send the standard response. No business logic.
- **Service** — all business logic. No direct Prisma calls.
- **Repository** — all Prisma/database access. No logic.

Other Structure.md rules honored:
- Standard response envelope `{ success, message, data }` on every endpoint (via `helper/api-response.ts`).
- `helmet` enabled, JWT auth middleware, role-based authorization.
- `async/await` throughout; centralized error handling; structured logger instead of `console.log`.
- `.env` is gitignored; all secrets externalized and validated at startup with Zod.

## Frontend — Layered Component Architecture

```
frontend/src/
├── configuration/   # API base URL, constants, dropdown option sets
├── components/
│   ├── ui/          # dumb presentational components (Button, Input, Modal, ...)
│   ├── common/      # shared layouts (Layout, PageHeader, ProtectedRoute)
│   └── domain/      # business-specific UI (StatCard, DiseaseFilter)
├── hooks/           # useAuth, useApiResource, useDebounce
├── pages/           # page-level orchestration
├── routes/          # route definitions + guards
├── services/        # one file per domain; all calls go through the Fetch wrapper
├── types/           # global TypeScript types
└── utils/           # api-client (Fetch wrapper), formatters
```

Rules honored:
- **Fetch API only** — Axios removed. All calls go through `utils/api-client.ts`.
- Business logic lives in hooks/services, not in JSX.
- Consistent loading/error handling via `useApiResource` and the api-client.
- No inline styles; Tailwind utility classes; constants/options centralized in `configuration/`.

## Intentional Deviations (documented)

1. **React Router v7** instead of v6.
   Structure.md specifies React Router v6. The original project already used v7 and the team chose to keep it. The routing API used here (`Routes`, `Route`, `Navigate`, `Outlet`, guards) is equivalent across v6/v7, so this does not change the architecture.

2. **`src/` as the source root** instead of a top-level `app/` folder.
   Structure.md illustrates an `app/` root with `index.tsx`. Vite and Prisma conventionally expect `src/` plus `prisma/schema.prisma` at the package root, and the build tooling depends on it. The **internal** organization (layers, naming, separation of concerns) follows Structure.md exactly; only the root folder name differs.

3. **Hosting: Vercel + Render** instead of Firebase Hosting.
   Per the team's deployment choice. Firebase only hosts static frontend assets; the Express backend needs a Node host (Render) regardless.

All other Structure.md rules are followed as written.
