# Azure Group CRM — Comprehensive Technical Analysis and Implementation Plan

Date: 2025-10-06

This report analyzes the current CRM frontend, proposes a complete backend and data architecture, and lays out a concrete roadmap to deliver a production-ready application. It serves as the project’s technical specification, implementation guide, and development plan.

---

## 1) Executive Summary

### Current State Assessment

- Frontend
  - Stack: Vite + React 18 + TypeScript + TailwindCSS + shadcn/ui + Radix + TanStack Query + React Router.
  - Structure: Clear separation of `pages`, `components` (layout, forms, ui primitives), `hooks`, `contexts`, `lib`, and `schemas`.
  - Auth: Context with token storage in localStorage and placeholders for `/auth/login` and `/auth/me` endpoints. Route guards for protected and admin routes exist.
  - UI/UX: Well-designed, responsive layouts for Dashboard, Leads, Contacts, Organizations, Activities, Quotes, Products, Profile, Settings, and Admin pages. Most pages render empty states and filter/search UIs awaiting data.
  - Forms: Add dialogs for Lead, Contact, Organization, Product, Activity, and Quote with Zod validation. Currently log to console; no API integration yet.
  - Server state: TanStack Query is set up but not yet leveraged with actual queries/mutations.

- Backend
  - Not implemented. Frontend expects a REST API at `/api` with JWT authentication (login + me). No API schemas, endpoints, or data models are provided yet.

- Data Models
  - Initial Zod schemas exist for auth (login), lead, contact, organization, product, quote, and activity. These provide a strong foundation for backend validation parity.

### Critical Gaps

- No backend, database, or APIs; no real data flows.
- Auth token stored in localStorage (security risk). No refresh token, no session hardening, no RBAC enforcement server-side.
- Missing core features: CRUD wiring, data tables with pagination/sorting/filtering backed by server queries, file uploads, import/export, notifications, audit logs.
- No DevOps: No Docker, CI/CD, environment config, or deployment scripts.
- No tests (unit, integration, E2E) and no API documentation.

### Recommended Path Forward

1. Backend foundation with Django 5 + Django REST Framework (DRF) + PostgreSQL, auth via httpOnly JWT cookies (drf-simplejwt) or session auth, RBAC using Groups/Permissions, and OpenAPI docs via drf-spectacular.
2. Implement core entities and CRUD endpoints with DRF ModelViewSets. Add search, filter (django-filter), pagination, and sorting; mirror frontend Zod validation in DRF serializers.
3. Integrate frontend with TanStack Query hooks and the `apiClient` (cookie-based auth and `credentials: 'include'`); add optimistic updates where applicable.
4. Add DevOps: Docker Compose, GitHub Actions, environment config; deploy on Azure App Service (Linux) + Azure Database for PostgreSQL; Azure Blob for files via django-storages.
5. Implement advanced features: analytics, reporting, import/export, email/calendar integrations, notifications (Django Channels), and audit trails.

---

## 2) Technical Deep Dive

### 2.1 Frontend Architecture Analysis

- Component Inventory (high-level)
  - Layout: `components/layout/{Layout,Header,Sidebar,QuickAccessButton}`
  - Route Guards: `components/{ProtectedRoute,AdminRoute}`
  - Dashboard: `components/dashboard/KPICard`, page `pages/Dashboard`
  - Pages: `Leads`, `Contacts`, `Organizations`, `Activities`, `Quotes`, `Products`, `Profile`, `Settings`, admin pages: `admin/{Dashboard,Users,Roles,Pipelines,Sources,Types}`
  - Forms: `components/forms/{AddLeadDialog,AddContactDialog,AddOrganizationDialog,AddProductDialog,AddActivityDialog,AddQuoteDialog}`
  - UI kit: `components/ui/*` (shadcn primitives) and Tailwind utility classes in `index.css` with a defined theme
  - Contexts/Hooks: `contexts/AuthContext`, `hooks/{useAuth,use-toast,use-mobile}`
  - Lib: `lib/{api.ts,utils.ts}`; `schemas/*` define Zod validation for forms

- Component Hierarchy and Data Flow
  - App
    - QueryClientProvider
      - AuthProvider
        - Tooltip + Toasters
          - Router
            - `/login` (public)
            - `/` (ProtectedRoute -> Layout)
              - Layout -> Header + Sidebar + Outlet
                - Routed pages
  - State flows:
    - Auth state via Context (user, token) and route guards.
    - Form state via React Hook Form + Zod validation.
    - Data fetching to be implemented via TanStack Query; `apiClient` wraps fetch.

- Styling
  - TailwindCSS with custom design tokens and component classes in `index.css`.
  - shadcn/ui components (Radix-based) for consistent accessible primitives.

- UI/UX Status
  - Pages are visually complete but data-less; tables/cards show empty states.
  - Responsive layout present via Tailwind grid/flex; needs verification on mobile.
  - Accessibility generally good due to Radix/shadcn; labels/inputs wired. Should add aria-attributes for dialog triggers and ensure color contrast on custom classes.

- Frontend Dependencies Review
  - React 18, Vite 5, TypeScript 5 — modern and compatible.
  - shadcn/ui, Radix, lucide-react — standard and up-to-date.
  - TanStack Query v5 — latest; ideal for server state.
  - React Router v6 — latest.
  - Form stack: react-hook-form + zodResolver + zod.
  - Tailwind 3.4 + tailwindcss-animate — fine.
  - Note: No known deprecations in listed versions. Security scan not run; plan to run `npm audit` in CI.

### 2.2 Missing Frontend Elements

- Incomplete Features
  - All CRUD integrations: none of the list pages call APIs yet.
  - Actions (Add, Edit, Delete) not wired to backend.
  - Pagination/sorting on tables are only mocked client-side.
  - File uploads for documents/attachments not implemented.
  - Auth UI is login-only: no register, forgot/reset password, email verification.
  - Notifications and activity feeds are placeholders.
  - Admin pages (Users, Roles, Pipelines, Sources, Types) are shells.

- Required UI Components
  - Reusable DataTable component with server-side pagination/sorting/filtering.
  - Modal confirmation dialogs (delete, bulk actions).
  - Upload widget for documents (to Azure Blob or S3-like provider).
  - Date/time pickers integrated with RHF for activities scheduling.
  - Charts for analytics (Recharts already present) with responsive containers.
  - Toast and inline error components (already partially present via `use-toast`).

- Design System Needs
  - Document color usage and states (hover/active/disabled) in a brief DS README.
  - Define spacing/typography scale and responsive breakpoints.
  - Accessible focus states; verify contrast with custom colors.

### 2.3 Backend Architecture Requirements (Django)

- Technology Stack Recommendation
  - Framework: Django 5 (ASGI-ready) with Django REST Framework (DRF) for robust API development.
  - Database: PostgreSQL for relational data and complex queries (deals, activities, audit logs).
  - ORM: Django ORM with built-in migrations; add constraints and indexes via Meta.indexes and UniqueConstraint.
  - Auth: httpOnly JWT cookies using drf-simplejwt (short-lived access ~15m, rotating refresh 7–30d) or SessionAuthentication for same-origin. RBAC via Groups/Permissions; object-level permissions via django-guardian if needed.
  - File storage: Azure Blob Storage using django-storages with azure-storage-blob backend; use SAS for direct client uploads when required.
  - Real-time: Django Channels (ASGI + Redis) for WebSocket/SSE notifications.
  - Background jobs: Celery with Redis (or Azure Service Bus) for async tasks (emails, exports, audit processing).
  - API Docs: drf-spectacular to generate OpenAPI/Swagger and Redoc.

- Database Schema Design (ERD in Mermaid)

```mermaid
erDiagram
  User ||--o{ Session : has
  User ||--o{ AuditLog : performs
  User ||--o{ Activity : creates
  User ||--o{ Task : owns
  User ||--o{ Note : writes
  Role ||--o{ User : includes

  Organization ||--o{ Contact : has
  Organization ||--o{ Lead : owns
  Organization ||--o{ Opportunity : owns

  Contact ||--o{ Lead : mayRefer
  Contact ||--o{ Activity : target

  Lead ||--o{ Activity : linked
  Lead ||--o{ Opportunity : canConvert
  Lead ||--o{ Note : has
  Lead ||--o{ Tag : tagged

  Opportunity ||--o{ Activity : linked
  Opportunity ||--o{ Quote : proposes
  Opportunity ||--o{ Note : has

  Product ||--o{ QuoteItem : usedIn
  Quote ||--o{ QuoteItem : has

  File ||--o{ Lead : attaches
  File ||--o{ Opportunity : attaches
  File ||--o{ Organization : attaches

  User {
    uuid id PK
    string email UK
    string passwordHash
    string firstName
    string lastName
    string role  // admin|user
    datetime createdAt
    datetime updatedAt
    boolean isActive
  }
  Role {
    uuid id PK
    string name UK
    jsonb permissions
  }
  Session {
    uuid id PK
    uuid userId FK
    string refreshTokenHash
    datetime expiresAt
    datetime createdAt
  }
  Organization {
    uuid id PK
    string name
    string industry
    string website
    string phone
    string email
    string address
    jsonb metadata
    datetime createdAt
    datetime updatedAt
    string status // active|prospect|inactive
    string type // Enterprise|Mid-Market|SMB
  }
  Contact {
    uuid id PK
    uuid organizationId FK
    string firstName
    string lastName
    string email
    string phone
    string role
    string status // active|lead|inactive
    datetime createdAt
    datetime updatedAt
  }
  Lead {
    uuid id PK
    uuid organizationId FK
    uuid contactId FK
    string title
    numeric value
    string priority // high|medium|low
    string stage // new|followUp|prospect|negotiation|won|lost
    text notes
    datetime createdAt
    datetime updatedAt
    uuid ownerId FK // User
    string source
  }
  Opportunity {
    uuid id PK
    uuid leadId FK
    string name
    numeric amount
    string stage // discovery|proposal|negotiation|won|lost
    datetime closeDate
    uuid ownerId FK
    datetime createdAt
    datetime updatedAt
  }
  Activity {
    uuid id PK
    uuid leadId FK
    uuid contactId FK
    uuid organizationId FK
    uuid createdBy FK // User
    string type // call|email|meeting|task|note
    boolean isDone
    text comment
    datetime scheduleFrom
    datetime scheduleTo
    datetime createdAt
  }
  Task {
    uuid id PK
    uuid ownerId FK
    string title
    text description
    datetime dueDate
    string status // open|in_progress|done
    datetime createdAt
    datetime updatedAt
  }
  Note {
    uuid id PK
    uuid authorId FK
    string entityType // lead|opportunity|organization
    uuid entityId
    text body
    datetime createdAt
  }
  Product {
    uuid id PK
    string sku UK
    string name
    string category
    numeric price
    numeric cost
    int inStock
    int allocated
    text description
    datetime createdAt
    datetime updatedAt
  }
  Quote {
    uuid id PK
    string quoteNumber UK
    uuid opportunityId FK
    string clientName
    string clientEmail
    numeric subtotal
    numeric tax
    numeric discount
    numeric total
    date expiryDate
    string status // draft|sent|accepted|rejected
    text notes
    datetime createdAt
    datetime updatedAt
  }
  QuoteItem {
    uuid id PK
    uuid quoteId FK
    uuid productId FK
    int quantity
    numeric unitPrice
    numeric lineTotal
  }
  Tag {
    uuid id PK
    string name UK
    string color
  }
  AuditLog {
    uuid id PK
    uuid userId FK
    string action
    string entityType
    uuid entityId
    jsonb diff
    string ip
    string userAgent
    datetime createdAt
  }
  File {
    uuid id PK
    string fileName
    string contentType
    string storageKey // Azure Blob path
    int size
    uuid uploadedBy FK
    datetime createdAt
  }
```

- Indexing
  - Unique indexes: user email, product SKU, quoteNumber.
  - Foreign key indexes for joins (e.g., lead.organizationId, lead.ownerId).
  - Composite indexes for activity queries: (leadId, createdAt), (organizationId, createdAt), (type, isDone).

- Data Validation Rules
  - Mirror Zod schemas in DRF serializers and Django model validators. Enforce enum values using Field.choices, positive numeric constraints via PositiveIntegerField/validators, and date ranges (scheduleFrom <= scheduleTo) in serializer.validate or model.clean. Use UniqueConstraint for natural keys.

- API Architecture
  - REST with versioning: `/api/v1` using DRF routers and ModelViewSets.
  - OpenAPI via drf-spectacular; Swagger/Redoc UIs.
  - Error format: `{ error: { code, message, details? } }` standardized via a custom DRF exception handler.
  - Auth: `/auth/login` (obtain token pair to cookies), `/auth/me`, `/auth/refresh` (rotate refresh), `/auth/logout` (clear cookies).
  - Users/RBAC: Admin CRUD for users and roles (Groups). Enforce permissions via DRF permission classes and object-level perms as needed.
  - Entities CRUD: contacts, organizations, leads, opportunities, activities, tasks, notes, products, quotes, files, tags, audit logs via ViewSets.
  - Features: search (`q`), filtering via django-filter, pagination (`page`, `page_size`), ordering (`ordering=field|-field`), bulk operations (custom actions), import/export.

Example Endpoint Spec (abridged)

- Auth
  - POST `/api/v1/auth/login` { email, password } -> set httpOnly cookies; returns user
  - GET `/api/v1/auth/me` -> user
  - POST `/api/v1/auth/refresh` -> rotates tokens
  - POST `/api/v1/auth/logout` -> clears cookies
- Leads
  - GET `/api/v1/leads` -> `{ items, total, page, pageSize }` with q, stage, priority, ownerId, orgId filters
  - POST `/api/v1/leads`
  - GET `/api/v1/leads/:id`
  - PATCH `/api/v1/leads/:id`
  - DELETE `/api/v1/leads/:id`
  - POST `/api/v1/leads/:id/convert` -> creates Opportunity
  - POST `/api/v1/leads/bulk` -> bulk create/update
  - POST `/api/v1/leads/import` (CSV) / GET `/api/v1/leads/export` (CSV)
- Activities
  - GET `/api/v1/activities` with type, isDone, date range
  - POST `/api/v1/activities`
  - PATCH `/api/v1/activities/:id` (toggle done)
- Quotes/Products
  - Standard CRUD + `/api/v1/quotes/:id/items`
- Files
  - POST `/api/v1/files/sign` -> signed URL for Azure Blob; PUT upload from client; POST link to entity

- Rate Limiting & Security
  - Throttling: DRF throttling (Anon/User) with stricter rates on login; optionally django-axes or django-ratelimit for login lockouts.
  - Security headers: Django SecurityMiddleware + django-csp for CSP; enable HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy.
  - CORS: django-cors-headers restricted to frontend origin; allow credentials and necessary headers.
  - CSRF: For JWT cookies, implement double-submit CSRF (`csrftoken` cookie + `X-CSRFToken` header). For session auth, Django CSRF applies.
  - Password hashing: Django’s PBKDF2 (or Argon2). Cookies: httpOnly, Secure, SameSite=Lax/None.
  - Input validation with DRF serializers; auditing via middleware/signals.

### 2.4 Integration Requirements

- Email: Azure Communication Services Email or SendGrid for transactional emails (invite, password reset, notifications).
- Calendar: Microsoft Graph (Outlook) and Google Calendar optional for meeting sync.
- File storage: Azure Blob Storage with SAS tokens.
- Analytics: PostHog or Google Analytics (for product usage; avoid PII).
- Auth Providers: Azure AD / Microsoft Entra ID and Google (OAuth2) as optional SSO.
- SMS/WhatsApp: Twilio if needed for messaging.
- Export: CSV and PDF (using pdfmake or server-side Puppeteer for PDFs).

### 2.5 Security Implementation

- Authentication: JWT access + refresh in httpOnly cookies; token rotation and logout revocation via session table.
- Authorization: Role guard (admin/user) and resource-level checks (owner/team-based access for leads/opportunities).
- Data encryption: TLS enforced in transit. At-rest: database managed encryption; secret management in Azure Key Vault.
- CORS: Restrict to frontend hosts; allow credentials.
- XSS/CSRF: Sanitize inputs, use Django SecurityMiddleware and django-csp; built-in CSRF for session auth or double-submit CSRF for JWT cookies.
- SQL Injection: Mitigated by Django ORM parameterized queries; avoid raw SQL or use params safely.
- Rate limiting: Per-IP + per-user; captcha after repeated login failures.
- Env management: `.env` with schema validation (zod/envsafe) and CI secrets; do not commit secrets.
- Security headers: HSTS, X-Content-Type-Options, X-Frame-Options (deny), Referrer-Policy, Content-Security-Policy (strict; allow only required sources).
- Auditing: AuditLog records sensitive mutations with actor and IP.

### 2.6 State Management & Data Flow

- Frontend
  - Keep Auth in Context (migrate away from localStorage to cookie-based session; store only user in memory).
  - Server state with TanStack Query for all collections/entities. Create typed hooks: `useLeadsQuery`, `useCreateLead`, etc. Use query keys and optimistic updates.
  - WebSockets (Socket.IO or SSE) for notifications/real-time updates of activities and pipeline changes.
  - Caching: TanStack Query defaults with fine-grained stale times (e.g., 30s for list, 5m for reference data like roles/types).
  - Offline: Optional; can leverage background sync later.

### 2.7 DevOps & Deployment

- Development Setup
  - Docker Compose: services for web (frontend), api (Django), db (Postgres), cache/broker (Redis for Channels/Celery), optional Azurite for local blob.
  - Env files: `.env` for backend (`DATABASE_URL` or DB vars, `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `COOKIE_DOMAIN`, `SIMPLEJWT_*`, `AZURE_*`) and `.env.local` for frontend (`VITE_API_URL`).

- CI/CD (GitHub Actions)
  - Lint, typecheck, test for both frontend and backend; build Docker images; deploy to Azure App Service (api) and Azure Static Web Apps/Vercel (frontend).
  - Backend: ruff/flake8, black --check, mypy (optional), pytest with coverage; security scans (bandit, trivy). Frontend: eslint, typecheck, build.

- Hosting Recommendations (Azure-centric)
  - Frontend: Azure Static Web Apps or Vercel.
  - Backend: Azure App Service (Linux) container running Django with Gunicorn/Uvicorn workers (ASGI) or Azure Web App for Containers.
  - Database: Azure Database for PostgreSQL Flexible Server.
  - Cache/Broker: Azure Cache for Redis for Channels/Celery.
  - Files: Azure Blob Storage with private containers + SAS.
  - Estimated Cost: Dev <$50/mo; Production scales with vCPU/memory and DB tier.

### 2.8 Testing Strategy

- Unit Tests
  - Frontend: React Testing Library + Vitest for components and hooks.
  - Backend: pytest + pytest-django for views/serializers/permissions; factory_boy or model_bakery for fixtures.
- Integration Tests
  - Backend: Django test client with pytest against a test Postgres (via Docker); transactional tests and factories.
- E2E Tests
  - Playwright for browser flows (auth, CRUD, filters, admin permissions).
- API Tests
  - OpenAPI via drf-spectacular plus contract tests; optional Postman/Newman collections.
- Coverage Goals
  - Unit 70%+, Integration 60%+, Critical paths (auth, CRUD core) 80%+.

### 2.9 Documentation Needs

- API documentation: OpenAPI with Swagger UI at `/docs`.
- Component documentation: Storybook for shared UI components and complex tables/forms.
- Developer Guide: Setup, env, running, testing, deploying.
- User Guide: Brief how-to for CRM workflows.

---

## 3) Development Roadmap

### Phase 1: Foundation (1.5–2 weeks)

- Scaffold backend (Django + DRF) with apps: Users/Auth, Organizations, Contacts, Leads, Activities, Products, Quotes, Files, Audit.
- Django models and migrations; seed script for dev.
- JWT cookie-based auth with refresh tokens; RBAC (admin/user).
- OpenAPI docs; basic error handler; request validation.
- Docker Compose for api+db; GitHub Actions CI baseline (lint/test/build).

### Phase 2: Core Features (2–3 weeks)

- Implement CRUD for Organizations, Contacts, Leads, Activities, Products, Quotes.
- Add server-side pagination/filtering/sorting.
- Integrate frontend pages with TanStack Query hooks and `apiClient` (migrate to cookie auth and `credentials: 'include'`).
- Login + Me wired; ProtectedRoute/AdminRoute validated via backend claims.
- File uploads via Azure Blob signed URLs and entity attachments.

### Phase 3: Advanced Features (2–3 weeks)

- Opportunities module (lead conversion), pipeline analytics.
- Reporting & analytics dashboard (Recharts), export CSV/PDF.
- Notifications (WebSocket/SSE) and activity feeds.
- Admin: Users & Roles management; Pipelines, Sources, Types CRUD.
- Email integration (SendGrid/Azure Email) and templated notifications.

### Phase 4: Polish & Optimization (1–2 weeks)

- Accessibility passes and performance tuning (code-splitting, memoization).
- Audit logging, rate limiting, security headers, CSP.
- E2E tests stabilization; load test critical endpoints.
- Documentation finalization and production deployment automation.

Total: ~6–10 weeks depending on team size and parallelization.

Priority and Estimates (selected)

- Critical: Auth + RBAC (5d), Core CRUD/APIs (10–12d), DB & Migrations (3d), CI/CD (3d)
- High: Files (3d), Analytics (3–5d), Import/Export (3d), Notifications (3d)
- Medium: Email/Calendar integrations (5–8d), Storybook (2d)
- Low: Offline/Cache advanced (2–3d), Advanced theming/DS docs (2d)

---

## 4) File Structure Recommendation

Frontend (existing with minor additions)

```text
src/
  api/                 # optional: react-query hooks by entity
    leads.ts
    contacts.ts
    ...
  components/
    data-table/        # reusable server-driven table
    forms/
    layout/
    ui/
  contexts/
  hooks/
  lib/
    api.ts             # update to use credentials + base URL from env
    queryClient.ts
  pages/
  schemas/
  types/               # shared TS types from OpenAPI (generated via drf-spectacular)
  
```

Backend (new, Django)

```text
api/
  manage.py
  pyproject.toml            # or requirements.txt
  requirements.txt          # if not using pyproject
  Dockerfile
  .env.example
  crm_backend/
    __init__.py
    asgi.py
    wsgi.py
    settings/
      __init__.py
      base.py
      dev.py
      prod.py
    urls.py
  apps/
    users/
      models.py            # CustomUser (email unique)
      serializers.py
      views.py
      urls.py              # auth/me/login/refresh/logout
      permissions.py
      admin.py
    organizations/
      models.py
      serializers.py
      views.py             # ModelViewSet
      filters.py
      urls.py
      admin.py
    contacts/
    leads/
    opportunities/
    activities/
    products/
    quotes/
    files/
    audit/
    roles/
  scripts/
    seed.py
  tests/
    conftest.py
```

DevOps

```text
Dockerfile.frontend
Dockerfile.api
docker-compose.yml
.github/workflows/
  ci.yml
```

---

## 5) Prioritized Task List

Immediate (Week 1–2)

- Initialize backend (Django + DRF + Postgres) with Auth and Users.
- Implement `/auth/login`, `/auth/me`, `/auth/refresh`, `/auth/logout` with cookies.
- Wire frontend auth to cookie-based session; update `apiClient` to include credentials and handle 401.
- CRUD for Organizations and Contacts; integrate corresponding pages with TanStack Query.
- Add Docker Compose and CI lint/test/build.

Short-term (Month 1)

- Leads + Activities CRUD and list endpoints with filters/pagination.
- Products + Quotes CRUD (with QuoteItems) and list endpoints.
- Server-side search/sort/pagination across lists; reusable DataTable component.
- File uploads to Azure Blob with signed URLs.

Medium-term (Months 2–3)

- Opportunities (lead conversion), analytics dashboards and reports.
- Admin: Users, Roles, Pipelines, Sources, Types modules.
- Notifications (WS/SSE) and audit logging.
- Import/export (CSV/PDF) and email integration.

Long-term Enhancements

- SSO (Azure AD/Google), Calendar sync, advanced permissions (teams), offline support, mobile optimizations.

---

## 6) Risk Assessment

- Security: localStorage tokens in current frontend; mitigate by migrating to httpOnly cookies and strict CORS/CSRF strategy.
- Scope Creep: Extensive features; mitigate by phasing and explicit acceptance criteria.
- Performance: Large lists without server-side pagination can be slow; enforce pagination and indexes.
- Data Consistency: Conversions (Lead -> Opportunity) and multi-entity relations; ensure atomic transactions with Django ORM (transaction.atomic).
- Vendor Lock-in: Azure services; mitigate with abstraction and environment-driven configuration.

Mitigations: phased delivery, automated tests, performance budgets, strict API contracts, robust monitoring/logging.

---

## 7) Resource Recommendations

- Skills: TypeScript, React, TanStack Query, Django, DRF, PostgreSQL, Azure (App Service, Postgres, Blob), testing (pytest/RTL/Playwright), CI/CD.
- Libraries/Tools
  - Backend: Django, DRF, drf-spectacular, django-filter, drf-simplejwt, django-storages[azure], django-cors-headers, django-csp, Celery, Channels.
  - Frontend: TanStack Query hooks per entity, Recharts for analytics, Storybook for UI, react-aria or Radix patterns for A11y.
  - DevOps: Docker, GitHub Actions, Azure CLI, Trivy.
- Learning
  - Django docs, DRF docs, drf-spectacular docs, TanStack Query docs, Azure App Service + Postgres docs, OWASP Cheat Sheets.

---

## 8) Code Analysis & Recommendations

- Code Quality & Architecture
  - Positive: Clean component structure, well-typed forms with Zod, reusable layout and UI primitives, route guards in place.
  - Opportunity: Centralize query hooks; create `queryClient.ts` and typed hooks by entity. Replace mock data arrays with real queries. Extract repetitive page patterns (filters + table) into shared components.

- Consistency Issues
  - Activity types/stages differ between UI and schemas (UI uses capitalized labels; schemas use lowercase enums). Standardize and map via constants.
  - Color classes occasionally hard-coded; prefer DS variables where possible.
  - Token handling in `api.ts` uses localStorage; move to cookie-based session and `credentials: 'include'`.

- Refactoring Opportunities
  - Create a reusable DataTable with configurable columns, sort, filter, pagination integrated with TanStack Query.
  - Abstract form dialogs to accept `onSubmit` async functions with success/error handling.
  - Introduce `@/types` with shared interfaces generated from OpenAPI or Prisma to reduce drift with backend.

- Performance
  - Turn large icons/images into lazy-loaded or virtualized lists when counts grow.
  - Use route-level code splitting for admin pages.
  - Memoize heavy lists; use `React.Suspense` with query’s `suspense` option if desired.

- Best Practices Compliance
  - Add ESLint rules for accessibility, and stricter TS (`noImplicitAny` true, strictNullChecks true) once integration stabilizes.
  - Use `@tanstack/react-query` devtools in development for debugging server state.
  - Add error boundaries at layout level.

---

## 9) Concrete Implementation Notes (Snippets)

- Frontend API client adjustments (cookie-based)

```ts
// lib/api.ts (concept)
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
class ApiClient {
  // ...
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = { "Content-Type": "application/json", ...options.headers };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // send cookies
    });
    if (!response.ok) { /* handle 401, parse error */ }
    return response.json();
  }
}
```

- Example React Query hook

```ts
// api/leads.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useLeads(params: { page?: number; q?: string; stage?: string }) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: () => apiClient.get(`/leads?${new URLSearchParams(params as any)}`),
    staleTime: 30_000,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.post("/leads", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}
```

- Docker Compose (abridged)

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: crm
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ./api
    env_file: ./api/.env
    depends_on: [db, redis]
    ports:
      - "3000:3000"
    command: gunicorn crm_backend.asgi:application -k uvicorn.workers.UvicornWorker -b 0.0.0.0:3000

  web:
    build: .
    environment:
      - VITE_API_URL=http://localhost:3000/api/v1
    ports:
      - "8080:8080"

volumes:
  db_data: {}
```

- GitHub Actions CI (abridged)

```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install deps
        run: |
          python -m pip install --upgrade pip
          pip install -r api/requirements.txt
      - name: Lint & Format
        run: |
          pip install ruff black
          ruff check api
          black --check api
      - name: Tests
        run: |
          pip install pytest pytest-django
          pytest -q api
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run build --if-present
```

---

## 10) Requirements Coverage

- Frontend Architecture Analysis: Done (audit, hierarchy, UI/UX status, dependencies).
- Missing Frontend Elements: Done (list + components needed).
- Backend Architecture Requirements: Done (stack, DB, ORM, auth, storage).
- Database Schema Design: Done (ERD, tables, relationships, indexes, validation).
- API Architecture: Done (REST, endpoints, schemas outline, error handling, versioning, rate limiting).
- Feature Implementation Roadmap: Done (phases, priorities, estimates).
- Integration Requirements: Done (email, calendar, storage, analytics, auth providers, export).
- Security Implementation: Done (auth, CORS, headers, rate limiting, envs).
- State Management & Data Flow: Done (client/server state, real-time, caching).
- DevOps & Deployment: Done (setup, CI/CD, hosting, costs).
- Testing Strategy: Done (unit, integration, E2E, coverage goals).
- Documentation Needs: Done (API, Storybook, guides).

Quality Gates

- Build/Lint/Typecheck: Not executed in this report; add CI to verify.
- Tests: None yet; to be added per roadmap.

---

## 11) Next Steps for This Repo

- Add `api/` backend scaffold with Django + DRF + PostgreSQL and minimal auth endpoints.
- Update `lib/api.ts` to use credentials and move away from localStorage tokens.
- Introduce React Query hooks per entity and wire up Leads/Contacts/Organizations pages.
- Add Docker Compose and a GitHub Actions CI pipeline.
- Create `.env.example` files for both frontend and backend.
- Start with Organizations/Contacts CRUD end-to-end, then Leads/Activities.
