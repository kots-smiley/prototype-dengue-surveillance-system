# Full-Stack Project Standards

> **For the agent:** This document is the single source of truth for how every full-stack project must be structured, built, and maintained. Before generating any file, folder, or code, read this document in full. Every decision — folder placement, naming, where logic lives, how validation is done — must follow these rules exactly. Do not deviate from this structure unless explicitly instructed by the user.

This project follows a **Scalable Layered Architecture** emphasizing **Separation of Concerns**. Business logic is strictly decoupled from the UI layer (Frontend) and the HTTP/Data layers (Backend) to ensure long-term maintainability and testability.

---

## Required Technical Stack

> **Node.js requirement:** Use **Node.js v20 LTS** across both frontend and backend. Prisma and several ESM packages have known issues on older versions. Run `node -v` before starting and use `nvm` to switch if needed.

---

### Overview

| Layer | Technology | Why |
| :--- | :--- | :--- |
| **Frontend UI** | React 18 + TypeScript | Component-based UI with full type safety |
| **Styling** | Tailwind CSS v3 | Utility-first CSS — no custom stylesheets needed |
| **Build Tool** | Vite | Fast dev server and optimized production builds for React + TS |
| **API Communication** | Fetch API only | Native, no extra dependency — Axios is **prohibited** unless explicitly justified in writing |
| **Routing** | React Router v6 | Client-side routing with route guards |
| **Backend** | Express.js + TypeScript | Lightweight, flexible Node.js framework |
| **ORM** | Prisma v5 | Type-safe database client with schema modeling |
| **Database** | MongoDB | Document-based NoSQL — used via Prisma's MongoDB connector |
| **Validation** | Zod v3 | Runtime schema validation for all inputs on both frontend and backend |
| **Auth** | JSON Web Tokens (jsonwebtoken) | Stateless auth — pairs with auth middleware on the backend |
| **Hosting** | Firebase Hosting | Frontend static file hosting and CDN delivery |
| **Code Quality** | ESLint + Prettier | Enforces the naming conventions and coding standards in this spec |

---

### Frontend Dependencies

#### `dependencies` — shipped to production

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` | `^18.3.0` | Core UI library |
| `react-dom` | `^18.3.0` | DOM rendering for React |
| `react-router-dom` | `^6.26.0` | Client-side routing and route guards |
| `zod` | `^3.23.0` | Frontend form and input validation |

#### `devDependencies` — local development only

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `typescript` | `^5.5.0` | TypeScript compiler |
| `vite` | `^5.4.0` | Build tool and local dev server |
| `@vitejs/plugin-react` | `^4.3.0` | Vite plugin for React Fast Refresh |
| `tailwindcss` | `^3.4.0` | Utility-first CSS framework |
| `postcss` | `^8.4.0` | Required by Tailwind for CSS processing |
| `autoprefixer` | `^10.4.0` | Required by Tailwind for vendor prefixing |
| `@types/react` | `^18.3.0` | TypeScript types for React |
| `@types/react-dom` | `^18.3.0` | TypeScript types for React DOM |
| `eslint` | `^9.9.0` | Linting |
| `prettier` | `^3.3.0` | Code formatting |
| `firebase-tools` | `^13.0.0` | Firebase CLI for deployment |

#### Recommended `package.json` (Frontend)

```json
{
  "name": "project-frontend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write ."
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.9.0",
    "firebase-tools": "^13.0.0",
    "postcss": "^8.4.0",
    "prettier": "^3.3.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

---

### Backend Dependencies

#### `dependencies` — shipped to production

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `express` | `^4.19.0` | HTTP server and routing framework |
| `@prisma/client` | `^5.17.0` | Auto-generated Prisma database client |
| `zod` | `^3.23.0` | Runtime input validation on all routes |
| `jsonwebtoken` | `^9.0.0` | JWT creation and verification for auth |
| `cors` | `^2.8.5` | Enable cross-origin requests from the frontend |
| `helmet` | `^7.1.0` | Sets secure HTTP headers — basic hardening |
| `dotenv` | `^16.4.0` | Loads `.env` variables into `process.env` |

#### `devDependencies` — local development only

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `typescript` | `^5.5.0` | TypeScript compiler |
| `tsx` | `^4.16.0` | Run TypeScript files directly without pre-compiling |
| `nodemon` | `^3.1.0` | Auto-restarts the server on file changes during development |
| `prisma` | `^5.17.0` | Prisma CLI for migrations and schema management |
| `@types/express` | `^4.17.0` | TypeScript types for Express |
| `@types/jsonwebtoken` | `^9.0.0` | TypeScript types for jsonwebtoken |
| `@types/cors` | `^2.8.0` | TypeScript types for cors |
| `@types/node` | `^20.0.0` | TypeScript types for Node.js built-ins |
| `eslint` | `^9.9.0` | Linting |
| `prettier` | `^3.3.0` | Code formatting |

#### Recommended `package.json` (Backend)

```json
{
  "name": "project-backend",
  "private": true,
  "scripts": {
    "dev": "nodemon --exec tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint . --ext ts",
    "format": "prettier --write .",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.17.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.19.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.0",
    "@types/express": "^4.17.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/node": "^20.0.0",
    "eslint": "^9.9.0",
    "nodemon": "^3.1.0",
    "prettier": "^3.3.0",
    "prisma": "^5.17.0",
    "tsx": "^4.16.0",
    "typescript": "^5.5.0"
  }
}
```

---

### Environment Variables

Both apps require a `.env` file at their root. **Never commit `.env` to version control.** Add it to `.gitignore` immediately.

#### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> Vite only exposes variables prefixed with `VITE_` to the client. Access them via `import.meta.env.VITE_API_BASE_URL`.

#### Backend (`.env`)

```env
PORT=5000
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/mydb"
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

> Access via `process.env.VARIABLE_NAME`. Load with `dotenv` at the very top of `index.ts` before any other imports.

---

### Quick Setup Commands

#### Frontend

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom zod
npm install -D tailwindcss postcss autoprefixer prettier eslint firebase-tools
npx tailwindcss init -p
```

#### Backend

```bash
mkdir backend && cd backend
npm init -y
npm install express @prisma/client zod jsonwebtoken cors helmet dotenv
npm install -D typescript tsx nodemon prisma @types/express @types/node @types/jsonwebtoken @types/cors prettier eslint
npx tsc --init
npx prisma init
```

---

## Frontend Task (React + TypeScript + Tailwind)

### Folder Structure

```
app/
│
├── assets/
│   ├── images/
│   ├── files/
│   └── json/
│
├── components/
│   ├── ui/         # Small, "dumb" presentational components (Button, Input, Modal)
│   ├── common/     # Shared layouts across the app (Header, Footer, Layout)
│   ├── domain/     # Business-specific UI (UserCard, ProductItem)
│   └── module/     # Complex, feature-based components (AuthModule, DashboardModule)
│
├── pages/          # Page-level orchestration components (HomePage, LoginPage)
│
├── configuration/  # Env mapping, constants, and API config
│
├── hooks/          # Custom hooks for business logic and state (useAuth, useFetch, useDebounce)
│
├── routes/         # Route definitions and guards
│
├── services/       # Centralized pure Fetch API logic
│
├── utils/          # Helpers (formatters, validators, api-client)
│
├── types/          # Global TypeScript interfaces and types
│
├── index.tsx
├── routes.ts
└── app.css
```

### Responsibilities Checklist

**Setup**
- [ ] Initialize React with TypeScript
- [ ] Configure Tailwind CSS properly
- [ ] Setup Firebase Hosting
- [ ] Setup environment config (`API_BASE_URL` and other constants in `/configuration`)

**Component Architecture**
- [ ] Use atomic structure mindset
- [ ] UI components must be **dumb/presentational only** — zero business logic inside them
- [ ] Pages should only orchestrate modules, not contain logic
- [ ] Modules compose domain and UI components into feature-complete units

**API Integration**
- [ ] Use Fetch API **only**
- [ ] Centralize all API calls in `/services` using a standard Fetch wrapper (see `api-client` in `/utils`)
- [ ] Handle loading state, error handling, and response parsing consistently in every call
- [ ] All responses must follow the standard format: `{ success: boolean, message: string, data: any }`

**State Management**
- [ ] Use React state and hooks properly
- [ ] Avoid prop drilling — use hooks or context where needed
- [ ] No unnecessary global state

**UI/UX**
- [ ] Follow consistent spacing using Tailwind scale
- [ ] Mobile responsive layout
- [ ] Accessible — use labels, semantic HTML, and proper button roles

**Code Quality**
- [ ] No inline styles (unless the value is dynamic/computed)
- [ ] No hardcoded values — use constants or config files
- [ ] Reusable components across pages and modules

---

## Backend Task (Express + Prisma + MongoDB)

### Folder Structure

```
app/
│
├── modules/                    # Feature-based domain folders
│   └── [feature]/              # e.g., user/
│       ├── [feature].router.ts     # Endpoint definitions only
│       ├── [feature].controller.ts # Request/Response handling ONLY
│       ├── [feature].service.ts    # ALL business logic lives here
│       ├── [feature].repository.ts # Database queries via Prisma
│       ├── [feature].schema.ts     # Zod validation schemas for inputs
│       └── [feature].types.ts      # Local, feature-specific types
│
├── assets/
│   ├── images/
│   ├── files/
│   └── json/
│
├── configuration/              # Database and environment configuration
│
├── middleware/                 # Auth, global error handler, logging, validation
│
├── helper/                     # General utility functions
│
├── prisma/                     # Prisma schema and client configuration
│
├── types/                      # Global TypeScript types/interfaces
│
├── index.ts                    # App entry point
├── server.ts                   # Server bootstrap
└── .env
```

### Responsibilities Checklist

**Setup**
- [ ] Initialize Express with TypeScript
- [ ] Setup Prisma with MongoDB
- [ ] Configure environment variables in `.env` and `/configuration`
- [ ] Setup global error handler middleware

**Layered Architecture — MANDATORY**

Every request must strictly follow this pipeline:

```
Route → Zod Validation → Controller → Service → Repository → Database
```

| Layer | File | Responsibility |
| :--- | :--- | :--- |
| **Router** | `*.router.ts` | Define endpoints and attach middleware |
| **Validation** | `*.schema.ts` | Validate and parse all incoming input via Zod |
| **Controller** | `*.controller.ts` | Parse request, call service, send response — nothing else |
| **Service** | `*.service.ts` | ALL business logic lives here and only here |
| **Repository** | `*.repository.ts` | All Prisma/database queries — no logic |
| **Database** | Prisma + MongoDB | Persist and retrieve data |

**Middleware**
- [ ] Global error handling middleware (catches all unhandled errors)
- [ ] Auth middleware (JWT verification, applied per-route or globally)
- [ ] Logging middleware (request logging for debugging)
- [ ] Validation middleware (apply Zod schemas before controller execution)

**Business Logic**
- [ ] All logic must reside in the **service layer only**
- [ ] No logic inside controllers — parsing and response delivery only
- [ ] No logic inside repositories — queries only

**Database**
- [ ] Use Prisma properly — no raw queries unless absolutely necessary
- [ ] Use schema modeling correctly in `prisma/schema.prisma`

**Code Quality**
- [ ] Use `async/await` exclusively — no callbacks
- [ ] Proper error handling in every service and controller
- [ ] Always validate all inputs on every route before reaching the controller

---

## Naming Conventions

### Frontend

| Type | Format | Example |
| :--- | :--- | :--- |
| Components | PascalCase | `UserCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Files | kebab-case or PascalCase | `user-service.ts` |
| Variables | camelCase | `userData` |
| Constants / Env | UPPER_SNAKE_CASE | `API_BASE_URL` |

### Backend

| Type | Format | Example |
| :--- | :--- | :--- |
| Files | kebab-case with dot notation | `user.controller.ts` |
| Classes | PascalCase | `UserService` |
| Functions | camelCase | `getUserById` |
| Variables | camelCase | `userData` |
| ENV Variables | UPPER_SNAKE_CASE | `DATABASE_URL` |

---

## Coding Standards

### General

- **One component or responsibility per file** — no mixing concerns
- **Max 200–300 lines per file** — split into smaller files if exceeded
- **Use `async/await` exclusively** — no callback patterns
- **No `console.log` in production code** — use a proper logging utility

### Frontend-Specific

- Extract all business logic into hooks — never inside components or JSX
- Avoid nested ternaries and deeply nested logic inside JSX
- Use early returns to reduce nesting depth
- No prop drilling — use hooks or React Context when state needs to be shared

### Backend-Specific

- No duplicate logic — extract shared utilities into `/helper`
- Always use interfaces or types for function parameters and return values
- Keep controllers thin — one job: receive, call service, respond
- All Prisma calls must go through the repository — never call Prisma directly from a service

---

## Core Principles

### Separation of Concerns

Each layer owns exactly one responsibility. Never let concerns bleed across layers.

| Layer | Responsibility |
| :--- | :--- |
| UI Components | Display only |
| Hooks | Logic reuse and state management |
| Services (FE) | Centralized API calls via Fetch wrapper |
| Controller (BE) | HTTP request/response handling |
| Service (BE) | All business logic |
| Repository (BE) | Data access via Prisma |

### DRY (Don't Repeat Yourself)

Reuse helpers, hooks, and services. If logic appears more than once, extract it.

### Scalability

Code must support adding new features without breaking the existing structure. Each module is self-contained — adding a new feature means adding a new module folder, not modifying others.

### Clean Code

Readable over clever. Short, focused functions. Clear, intention-revealing names. A new developer should understand any function within 30 seconds of reading it.

---

## Standard API Response Format

All API responses — success or error — must follow this structure:

```json
{
  "success": boolean,
  "message": string,
  "data": any
}
```

**Examples:**

```json
// Success
{
  "success": true,
  "message": "User retrieved successfully",
  "data": { "id": "abc123", "name": "John Doe" }
}

// Error
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

---

## Fetch API Wrapper Pattern

All frontend API calls must go through a centralized wrapper in `/utils/api-client.ts`. Direct `fetch()` calls in services are not allowed.

```typescript
// utils/api-client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}
```

Services then use this wrapper:

```typescript
// services/user-service.ts
import { apiClient } from '@/utils/api-client';

export const getUser = (id: string) =>
  apiClient<User>(`/users/${id}`);
```

---

## Zod Validation Pattern (Backend)

Every route must validate its input using a Zod schema before reaching the controller. The schema lives in `*.schema.ts` and is applied via middleware.

```typescript
// user/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

---

## Bonus Tasks (Optional Enhancements)

These are not required but improve the overall quality of the project:

- [ ] JWT-based authentication with Auth middleware
- [ ] Role-based access control (admin, user, etc.)
- [ ] Pagination and filtering on list endpoints
- [ ] Form validation on both frontend (hook-level) and backend (Zod)
- [ ] Structured logging system (e.g., using `winston` or `pino`)

---

## Agent Verification Checklist

> Before considering any project scaffold or feature complete, verify every item below. If any item is unchecked, fix it before proceeding.

- [ ] Clean folder structure following the defined hierarchy (frontend and backend)
- [ ] Mandatory layered flow strictly implemented: Route → Zod → Controller → Service → Repository → DB
- [ ] All business logic residing only in Services (BE) or Hooks (FE)
- [ ] Input validation active on all backend routes via Zod schemas
- [ ] Standard API response format `{ success, message, data }` used on every endpoint
- [ ] Fetch API wrapper centralized in `/utils/api-client.ts` — no raw `fetch()` calls in services
- [ ] No `console.log` statements anywhere in the codebase
- [ ] Code is readable, modular, and properly error-handled
- [ ] Proper error handling implemented on both frontend and backend
- [ ] `.env` is gitignored and all secrets are externalized
- [ ] Naming conventions match the tables defined in this spec