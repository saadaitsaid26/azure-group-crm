# Azure Group CRM — End‑to‑End Delivery Plan (with step‑by‑step prompts)

Date: 2025-10-06

This plan converts REPORT.md into a concrete, actionable execution guide with copy-pastable prompts you can use with your AI pair programmer to complete the app from setup to production-ready. It’s organized by phases with milestones, acceptance criteria, and quality gates. Use Windows PowerShell for commands.

Note on usage

- Each step includes a “Prompt to assistant” you can paste into your AI assistant in VS Code.
- Keep responses concise; after code edits, run lint/build/tests where indicated.
- Default assumptions: Backend is Django + DRF + Postgres; Auth via httpOnly JWT cookies; Frontend is the existing Vite/React/TS app.
- When a step says “verify in browser,” run the dev servers and smoke test the UI.


## Phase 0 — Project sanity, env, and guardrails (0.5 day)

Goal: Ensure the frontend builds, establish env files, and set baseline quality checks.

Deliverables

- Frontend builds locally
- Root .editorconfig, basic PR checklist, and .gitignore updated (if needed)
- Frontend .env.example with VITE_API_URL

Prompt to assistant

- Objective: Validate current frontend compiles; add example env and quick scripts.
- Context: Repo is a Vite + React + TS app in `c:\\Users\\saada\\Desktop\\azure_group_crm`.
- Actions:
  1) Check `package.json` scripts, add `typecheck`, ensure `lint` exists, and add `preview` if missing.
  2) Create `.env.example` at repo root with `VITE_API_URL=http://localhost:3000/api/v1`.
  3) Add `.editorconfig` (2 spaces, utf-8, LF or keep existing style), and ensure `.gitignore` ignores envs and build artifacts.
  4) Do not change Tailwind/TS configs unless strictly necessary.
- Acceptance criteria: `npm run build` and `npm run typecheck` pass; `.env.example` present.

Quality gates

- Lint/typecheck/build: PASS locally


## Phase 1 — Backend scaffold (Django + DRF + Postgres) (1–2 days)

Goal: Create `api/` with Django 5 + DRF, token cookies with simplejwt, CORS/CSRF, OpenAPI docs.

Deliverables

- `api/` directory with Django project `crm_backend` and apps: `users` (auth)
- `requirements.txt` or `pyproject.toml`
- Settings split: `settings/base.py`, `dev.py`, `prod.py`
- Auth endpoints: `/api/v1/auth/login`, `/me`, `/refresh`, `/logout` (cookies)
- drf-spectacular docs at `/api/schema/` + `/api/docs/`

Prompt to assistant

- Objective: Scaffold Django API with cookie-based JWT.
- Actions:
  1) Create `api/` with Django project `crm_backend` and app `users`.
  2) Add deps: django, djangorestframework, drf-spectacular, django-filter, djangorestframework-simplejwt, django-cors-headers, python-dotenv, psycopg2-binary.
  3) Implement settings split (base/dev/prod), enable CORS with credentials, CSRF trusted origins, and secure cookie flags configurable by env.
  4) Implement custom `User` model (email unique), configure AUTH_USER_MODEL.
  5) Implement auth views: login (set httpOnly access+refresh cookies), me (returns user), refresh (rotate refresh cookie), logout (clear cookies). Include rate limit on login.
  6) Hook up drf-spectacular and swagger/redoc.
  7) Add `urls.py` for versioned `/api/v1` router.
  8) Add basic pytest setup with one test for `/auth/me` unauthorized and after login.
- Acceptance criteria: `pytest -q` passes; `python manage.py runserver` serves `/api/docs/` and auth endpoints.

Quality gates

- Format/lint (ruff/black) OK; Tests: PASS; Docs route reachable


## Phase 2 — Dev containers and Docker Compose (0.5–1 day)

Goal: One-command local dev for db+api+web.

Deliverables

- `docker-compose.yml` with services: postgres, redis (future channels/celery), api, web
- `Dockerfile.api` and `Dockerfile.frontend`
- `api/.env.example` and root `.env.example` updated

Prompt to assistant

- Objective: Add Docker for local dev.
- Actions:
  1) Add `docker-compose.yml` with services: `db` (postgres:16), `redis` (redis:7-alpine), `api` (gunicorn+uvicorn worker), `web` (vite dev or static build served by preview).
  2) Create `Dockerfile.api` (slim Python 3.12, install deps, collect static if any) and `Dockerfile.frontend` (node:20 builder + serve).
  3) Provide `api/.env.example` including `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `COOKIE_DOMAIN`, simplejwt config, and `DEBUG`.
  4) Update root `.env.example` for `VITE_API_URL`.
  5) Document PowerShell commands to up/down the stack.
- Acceptance criteria: `docker compose up` runs db + api (3000) + web (8080) locally; `/api/docs/` reachable.

Quality gates

- Containers start; API health route responds; web serves


## Phase 3 — Frontend auth integration (0.5–1 day)

Goal: Switch to cookie-based auth; stop using localStorage token.

Deliverables

- `src/lib/api.ts` uses `credentials: 'include'` and base URL from env
- `AuthContext` updated to hold only user; login calls `/auth/login`; `ProtectedRoute` checks `/auth/me`

Prompt to assistant

- Objective: Wire frontend to backend auth via cookies.
- Actions:
  1) Update `src/lib/api.ts` to use `import.meta.env.VITE_API_URL ?? '/api/v1'` and always send `credentials: 'include'`.
  2) Update `src/contexts/AuthContext.tsx` to remove localStorage token usage. On init, call `/auth/me`. On login, POST credentials to `/auth/login`, then re-fetch user. On logout, POST `/auth/logout` then clear user.
  3) Update `ProtectedRoute` and `AdminRoute` to rely on `user` from context; redirect to `/login` if null.
  4) Add `lib/queryClient.ts` and wrap app with QueryClientProvider if not already.
- Acceptance criteria: Manual flow works: invalid creds show error; valid login sets user; refresh persists session; `/` redirects to login when logged out.

Quality gates

- Typecheck/lint: PASS; Manual auth smoke test


## Phase 4 — Core entities: Organizations and Contacts (2–3 days)

Goal: Implement backend models/serializers/viewsets and frontend list+create flows using React Query.

Deliverables

- Backend: `organizations` and `contacts` apps with CRUD, filters, pagination, ordering
- Frontend: list pages wired; add dialogs submit to API; basic toasts; empty state replaced with data

Prompt to assistant

- Objective: Add Organizations + Contacts end-to-end.
- Actions (Backend):
  1) Create Django apps `organizations`, `contacts` with models from REPORT.md-derived fields (keep minimal: name/email/phone/address for org; firstName/lastName/email/phone/org FK for contact).
  2) Add DRF serializers with validation, ModelViewSets, routers under `/api/v1/organizations` and `/api/v1/contacts`.
  3) Enable django-filter for `q` (name/email), `organizationId`, ordering, and pagination.
  4) Add permissions: IsAuthenticated; staff can create/update/delete; regular users read-only initially (adjust later if needed).
  5) Add unit tests for list/create/update/delete.
- Actions (Frontend):
  1) Create `src/api/organizations.ts` and `src/api/contacts.ts` with `use*Query`, `useCreate*`, `useUpdate*`, `useDelete*` hooks.
  2) Wire `pages/Organizations.tsx` and `pages/Contacts.tsx` to hooks; replace mock/empty states with DataTable or simple lists initially.
  3) Connect `AddOrganizationDialog` and `AddContactDialog` to mutations with form schemas.
  4) Add optimistic updates where safe, otherwise invalidate queries on success; show toasts.
- Acceptance criteria: Create/read/update/delete orgs/contacts from UI; pagination works; filters by q work; tests pass.

Quality gates

- Backend tests: PASS; Frontend typecheck/build: PASS; Manual UI CRUD works


## Phase 5 — Leads and Activities (3–4 days)

Goal: Implement lead pipeline basics and activity tracking with server-side filters.

Deliverables

- Backend: `leads`, `activities` apps, CRUD + filters; custom action to toggle activity done
- Frontend: pages wired; dialogs submit; filters by stage/priority/date

Prompt to assistant

- Objective: Add Leads + Activities with filters/pagination.
- Actions (Backend):
  1) Create models per REPORT.md (minimal set): Lead with org/contact/title/value/priority/stage/notes/owner/source; Activity with refs to lead/contact/org, type, isDone, scheduleFrom/To, comment.
  2) Add indexes and validators (scheduleFrom <= scheduleTo) and choices for enums.
  3) Add serializers/viewsets, filters: `q`, `stage`, `priority`, `ownerId`, `organizationId` for leads; `type`, `isDone`, date range for activities.
  4) Add custom PATCH action to toggle `isDone` on activities.
  5) Tests for filters, pagination, and permissions.
- Actions (Frontend):
  1) Add `src/api/leads.ts`, `src/api/activities.ts` hooks.
  2) Wire `pages/Leads.tsx` and `pages/Activities.tsx` to server queries with filters, sorting, pagination; integrate dialogs.
  3) Add simple kanban/pipeline UI later; start with list/table.
- Acceptance criteria: CRUD works; filters operate server-side; toggle done updates instantly with optimistic UI.

Quality gates

- Backend tests (filters and validation): PASS; UI flows smoke-tested


## Phase 6 — Products and Quotes (3–4 days)

Goal: Support quoting with quote items and totals.

Deliverables

- Backend: `products`, `quotes` (+ `quote items` nested) CRUD and validation
- Frontend: pages wired; quote items editable in form; totals calculated client-side and validated server-side

Prompt to assistant

- Objective: Add Products + Quotes.
- Actions (Backend):
  1) Product model with sku (unique), name, price, etc. Quote model with quoteNumber (unique), status, subtotal/tax/discount/total, expiryDate; QuoteItem with product, qty, unitPrice, lineTotal.
  2) Serializer validation to ensure totals match items; compute lineTotal; prevent negative numbers.
  3) Endpoints: `/products`, `/quotes` with nested items management (either nested writes in serializer or separate `/quotes/:id/items`).
  4) Tests for totals and nested items.
- Actions (Frontend):
  1) Hooks for products/quotes; product search for items.
  2) `AddProductDialog` and `AddQuoteDialog` wired; client computes totals; server validates.
  3) `pages/Products.tsx` and `pages/Quotes.tsx` list+filters.
- Acceptance criteria: Create/edit quotes with items; validation errors surfaced in UI; list pages show server data.

Quality gates

- Totals validation tests: PASS; UI create/edit works


## Phase 7 — File uploads via Azure Blob (1–2 days)

Goal: Attach files to entities using signed upload flow.

Deliverables

- Backend: `/files/sign` endpoint returns SAS URL; model `File` and link endpoints
- Frontend: upload widget that PUTs to SAS URL, then POSTs metadata to backend

Prompt to assistant

- Objective: Implement signed upload flow.
- Actions (Backend):
  1) Configure django-storages with Azure backend; env vars for storage account/container.
  2) Implement `/api/v1/files/sign` that returns a short-lived SAS for direct browser upload; then accept POST to link file to entity (lead/org/etc.).
  3) Tests for signature creation and file metadata persistence.
- Actions (Frontend):
  1) Create reusable `UploadField` integrated with RHF.
  2) Flow: call sign endpoint -> PUT file -> POST metadata -> show in entity detail.
- Acceptance criteria: A user can attach a document to a lead or organization; file visible after refresh; SAS expires.

Quality gates

- Security: SAS scoped to path and content type; Tests: PASS


## Phase 8 — Admin: Users and Roles; Pipelines/Sources/Types (2–3 days)

Goal: Basic RBAC and reference data management.

Deliverables

- Backend: Users CRUD (admin o  nly), simple roles via Django Groups or Role model; reference tables for pipelines/sources/types
- Frontend: Admin pages wired with server data

Prompt to assistant

- Objective: Add admin management.
- Actions (Backend):
  1) Expose users CRUD for admins; list/search.
  2) Add roles/groups endpoints; secure permissions on CRUD across entities.
  3) Add simple reference models for pipeline stages, lead sources, contact types with CRUD.
- Actions (Frontend):
  1) Wire `admin/Users.tsx`, `admin/Roles.tsx`, `admin/Pipelines.tsx`, `admin/Sources.tsx`, `admin/Types.tsx` to APIs.
  2) Guard routes using AdminRoute.
- Acceptance criteria: Admin can manage users and reference data; non-admins blocked.

Quality gates

- Permission tests: PASS; UI shows 403 when unauthorized


## Phase 9 — Data table component and UX polish (1–2 days)

Goal: Reusable server-driven DataTable with sorting, filtering, pagination.

Deliverables

- `components/data-table/*` generic table using TanStack Table integrated with React Query params
- Replace tables on key pages

Prompt to assistant

- Objective: Build a reusable DataTable and adopt it.
- Actions:
  1) Create a generic DataTable component taking columns definition, queryFn, and state (page, pageSize, sort, filters).
  2) Integrate on Organizations, Contacts, Leads, Products pages.
  3) Add debounced search input and controlled pagination.
- Acceptance criteria: Sorting/filters/pagination work consistently; minimal duplication.

Quality gates

- Typecheck: PASS; No prop drilling smells; performance acceptable


## Phase 10 — Security hardening and audit logs (1–2 days)

Goal: Production-grade security headers, throttling, and audit trails.

Deliverables

- Security middleware and headers; throttling on sensitive endpoints
- `AuditLog` model with signals/middleware to record mutations

Prompt to assistant

- Objective: Harden API and add audit logs.
- Actions:
  1) Add Django SecurityMiddleware config + django-csp; set HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy; strict CSP with needed sources.
  2) DRF throttling for anon/user and login-specific higher restrictions; optional captcha after retries.
  3) Implement `AuditLog` model and signal handlers to record create/update/delete events including actor, ip, ua.
  4) Tests verifying logs are created and include actor.
- Acceptance criteria: Security headers present in responses; audit records created on entity changes.

Quality gates

- Security scans green; Tests: PASS


## Phase 11 — Real-time notifications (optional v1.1) (1–2 days)

Goal: WebSocket/SSE notifications for activities and pipeline changes.

Deliverables

- Django Channels + Redis configured; notifications broadcast on activity changes
- Frontend listener to show toasts/badges

Prompt to assistant

- Objective: Add notifications.
- Actions:
  1) Configure Channels (ASGI), Redis, auth middleware for sockets.
  2) Publish events on activity create/update; subscribe on frontend.
- Acceptance criteria: When a new activity is created, active clients see a toast in near real time.

Quality gates

- Manual smoke; load doesn’t break


## Phase 12 — Testing, CI/CD, and Deployment (1–2 days)

Goal: Automated quality checks and Azure deployment path.

Deliverables

- GitHub Actions CI for backend and frontend per REPORT.md
- Docker images build on CI; deploy to Azure App Service (API) and Azure Static Web Apps (frontend) or alternative hosting

Prompt to assistant

- Objective: Add CI/CD.
- Actions:
  1) Add `.github/workflows/ci.yml` running backend lint/tests and frontend lint/build.
  2) Create deployment workflow(s) or document manual Azure deployment.
  3) Ensure env secrets set in repo for deployments.
- Acceptance criteria: CI green on PRs; main branch auto-builds; manual deploy succeeds to Azure.

Quality gates

- CI: PASS; Deployed URLs reachable


## Phase 13 — Documentation and Developer Experience (0.5–1 day)

Goal: Clear docs and minimal friction for contributors.

Deliverables

- Update `REPORT.md` links and add `README.md` sections for setup/run/test/deploy
- API docs exposed; optional Storybook for UI components later

Prompt to assistant

- Objective: Finalize docs.
- Actions:
  1) Create/Update `README.md` with quick start (Docker and non-Docker), envs, commands, troubleshooting.
  2) Link to `/api/docs/` and document auth cookie behavior.
  3) Add `CONTRIBUTING.md` with branch strategy and code style (optional).
- Acceptance criteria: A new dev can onboard in <15 minutes following README.

Quality gates

- Run-through by a teammate; no missing steps


## Milestones and timeline (indicative)

- Week 1: Phases 1–3
- Week 2: Phases 4–5
- Week 3: Phases 6–7
- Week 4: Phases 8–10 + 12–13
- Optional v1.1: Phase 11


## Acceptance criteria summary (v1.0)

- Auth via cookies works; protect all CRUD routes
- Organizations, Contacts, Leads, Activities, Products, Quotes fully CRUD-able via UI, with filters/pagination
- File uploads to Azure Blob functional
- RBAC enforced for admin functions; non-admins limited
- DataTable consistent and reusable
- Security headers, throttling, and audit logs in place
- CI green; deployable to Azure; docs complete


## Quick reference prompts library

Use these short prompts when you need targeted help mid-implementation.

Auth client rewire

- Update `src/lib/api.ts` to use `credentials: 'include'` and `.env` `VITE_API_URL`; adjust error handling for 401; no localStorage tokens.

React Query hooks template

- Create `src/api/{entity}.ts` with list/detail hooks using TanStack Query v5; include `useCreate*`, `useUpdate*`, `useDelete*` and invalidate queries on success.

DRF ModelViewSet template

- Create model, serializer, viewset, router; enable django-filter on fields; add pagination and ordering; permission IsAuthenticated; write one happy-path test.

Signed upload flow

- Implement `/files/sign` returning SAS URL; client: PUT file to SAS, then POST metadata to backend; render attachments list in entity detail.

Security headers

- Configure SecurityMiddleware + django-csp; set HSTS, CSP script/img/style sources minimal; verify headers via a test.


## Try it: local dev commands (PowerShell)

Note: Only run after the relevant phases are implemented.

```powershell
# Install frontend deps
npm ci
npm run typecheck
npm run build

# Start frontend dev
npm run dev

# (Later) Dockerized stack
docker compose up -d --build

# Tail logs
docker compose logs -f api
```


## Risks and mitigations

- Scope creep: Stick to v1.0 acceptance criteria; defer extras to v1.1+
- Security: Move auth to cookies early (Phase 3) and keep strict CORS/CSRF
- Performance: Enforce pagination; add DB indexes where indicated in REPORT.md
- Data consistency: Use transactions for multi-entity operations (e.g., quote items)


## Definition of Done for each feature

- Code: Typed, linted, and minimal tests added
- API: Documented in OpenAPI; errors follow standard shape
- UI: Handles loading/empty/error states; toasts on success/fail
- Quality gates: Build/lint/tests PASS locally and in CI
- Docs: README or in-code docs updated

---

This plan is designed to be copy-paste actionable in your current codebase, building directly on the architecture and priorities defined in REPORT.md.