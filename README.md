# Azure Group CRM

<div align="center">

![Azure Group CRM](https://img.shields.io/badge/Azure_Group-CRM-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)

[![Django](https://img.shields.io/badge/Django-5.0.10-092E20?style=flat-square&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST_Framework-3.15.2-A30000?style=flat-square&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

**An enterprise-grade, full-stack Customer Relationship Management (CRM) platform engineered with Django REST Framework and React.**

[Key Features](#-key-features) • [Architecture](#-architecture) • [Quick Start (Docker)](#-quick-start-docker) • [Local Setup](#-local-development-without-docker) • [API Documentation](#-api-documentation) • [Documentation Hub](#-documentation-hub)

</div>

---

## 📖 Overview

**Azure Group CRM** is a modern, modular, and scalable relationship management system tailored for business-to-business operations. It unifies lead tracking, customer interactions, product catalogs, quotes, and administrative governance into a single, high-performance interface.

The application couples an asynchronous **Django REST Framework** backend backed by **PostgreSQL 17** and **Redis 7** with a responsive **React 18** Single Page Application powered by **Vite**, **TypeScript**, **shadcn/ui**, and **TanStack Query & Table**.

---

## ✨ Key Features

### 🏢 Customer & Organization Management
- **Organizations Directory**: Comprehensive company tracking with industry categorization, contact associations, deal history, and domain metrics.
- **Contacts Management**: Unified directory of customer representatives linked directly to organizations, with custom contact types and communication channels.
- **Full CRUD Dialogs**: Accessible, validated modal forms powered by `react-hook-form` and `zod` for zero-friction data entry.

### 🎯 Sales Pipeline & Opportunity Tracking
- **Interactive Kanban Pipeline**: Drag-and-drop lead board across configurable pipeline stages with stage transition validations.
- **Lead Qualification & Scoring**: Source attribution (Website, Referral, Campaigns), estimated deal values, and assignment to team members.
- **Interaction Timeline (Activities)**: Track calls, meetings, tasks, follow-ups, and notes chronologically per organization and contact.

### 💼 Product Catalog & Quote Builder
- **Product Management**: SKU management, pricing, categories, stock tracking, and active status toggling.
- **Quote & Proposal Engine**: Nested line items with auto-computed subtotals, tax rate calculations, custom discounts, and status lifecycles (`Draft`, `Sent`, `Accepted`, `Rejected`, `Expired`).

### ⚡ Enterprise Data Table Component
- **TanStack Table v8 Integration**: Reusable, accessible `DataTable` component built for data-dense enterprise views.
- **Server-Side Operations**: Backend-driven sorting, filtering, and pagination for high scalability.
- **Interactive Controls**: Debounced search (reduces API load by ~70%), multi-select faceted filters, column visibility toggles, and client-side CSV exports.

### 🛡️ Administration & RBAC
- **User Governance**: Full CRUD interface for administrator user management, activation toggling, and role assignments.
- **Role-Based Access Control**: Django group and permission synchronization with dedicated admin views.
- **Reference Data Configurator**: In-app management of Pipeline Stages, Lead Sources, Activity Types, and Contact Types without database migrations.

### 🔒 Enterprise-Grade Security
- **Cookie-Based JWT Auth**: Tokens transmitted exclusively in secure `httpOnly` cookies, preventing XSS token theft.
- **Token Rotation & Revocation**: Automatic refresh token rotation and explicit logout token blacklisting.
- **Brute-Force Rate Limiting**: DRF throttling configured on authentication endpoints (5 attempts/min).
- **Audit & Structured Logging**: Centralized logging system capturing security events, request traces, and system exceptions.

---

## 🏗️ Architecture

```
                       ┌────────────────────────┐
                       │   Client (Browser)     │
                       │ React 18 + TypeScript  │
                       └───────────┬────────────┘
                                   │ HTTP / httpOnly Cookies
                                   ▼
                       ┌────────────────────────┐
                       │   Gunicorn + Uvicorn   │
                       │    (Reverse Proxy)     │
                       └───────────┬────────────┘
                                   │
                                   ▼
                       ┌────────────────────────┐
                       │ Django 5.0 + DRF API   │
                       │  Modular Django Apps   │
                       └──────┬──────────┬──────┘
                              │          │
                     Database │          │ Cache / Sessions
                              ▼          ▼
                      ┌──────────────┐ ┌──────────────┐
                      │  PostgreSQL  │ │   Redis 7    │
                      │   Version 17 │ │  In-Memory   │
                      └──────────────┘ └──────────────┘
```

### Technology Breakdown

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | Django / DRF | 5.0.10 / 3.15.2 | RESTful API engine, ORM, and business logic |
| **ASGI / WSGI Server** | Gunicorn + Uvicorn | 23.0 / 0.32 | Production-ready asynchronous application server |
| **Primary Database** | PostgreSQL | 17-alpine | Relational persistence with UUID keys |
| **Cache & Broker** | Redis | 7-alpine | Query caching, session store, rate limiting |
| **API Documentation** | drf-spectacular | 0.27.2 | Automated OpenAPI 3.0, Swagger UI, and ReDoc |
| **Frontend Core** | React | 18.3.1 | Component-driven Single Page Application |
| **Type Safety** | TypeScript | 5.8.3 | End-to-end static typing across the UI layer |
| **Build Tooling** | Vite (SWC) | 5.4.19 | Fast HMR dev server and optimized production bundles |
| **UI Components** | Radix UI + shadcn/ui | Latest | WAI-ARIA accessible, unstyled component primitives |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first responsive styling and dark mode |
| **State & Cache** | TanStack Query | 5.83.0 | Server-state management and query invalidation |
| **Table Engine** | TanStack Table | 8.21.3 | Headless data grid for enterprise list views |
| **Form Validation** | React Hook Form + Zod | 7.61 / 3.25 | Schema-driven form handling and error validation |
| **Containerization** | Docker & Compose | Compose v2 | Multi-container reproducible environments |

---

## 📂 Project Structure

```
azure_group_crm/
├── api/                           # Django Backend Application
│   ├── activities/                # Tasks, meetings, calls, notes, and timeline
│   ├── contacts/                  # Customer contact records and organization links
│   ├── crm_backend/               # Core project configurations
│   │   ├── settings/              # Split settings (base.py, dev.py, prod.py)
│   │   ├── asgi.py                # ASGI entrypoint
│   │   ├── dashboard.py           # Analytics and KPI summary endpoints
│   │   ├── health.py              # Health check endpoint (/health)
│   │   └── urls.py                # Global root routing
│   ├── leads/                     # Sales opportunities, stages, and scoring
│   ├── organizations/             # Companies, industries, and domain tracking
│   ├── products/                  # Product catalog, SKUs, and inventory items
│   ├── quote_items/               # Quotes, line items, and financial calculations
│   ├── reference_data/            # Pipeline stages, lead sources, activity/contact types
│   ├── users/                     # Authentication, RBAC, groups, and permissions
│   ├── Dockerfile                 # Backend container definition
│   ├── manage.py                  # Django management CLI
│   ├── pytest.ini                 # Test suite configuration
│   └── requirements.txt           # Python backend dependencies
│
├── src/                           # React Frontend Application
│   ├── api/                       # Typed React Query API client modules
│   ├── components/                # Reusable UI component library
│   │   ├── dashboard/             # KPI summary cards and visual charts
│   │   ├── data-table/            # TanStack Table enterprise implementation
│   │   ├── forms/                 # Add/Edit dialog forms for all entities
│   │   ├── layout/                # Sidebar, header, navigation, and wrappers
│   │   └── ui/                    # shadcn/ui primitive components
│   ├── contexts/                  # AuthContext and global application states
│   ├── hooks/                     # Custom hooks (mobile detection, toast, etc.)
│   ├── lib/                       # Utility helpers (axios client, cn helper)
│   ├── pages/                     # Routed page views
│   │   ├── admin/                 # Admin pages (Users, Roles, Pipelines, Sources, Types)
│   │   ├── Activities.tsx         # Interaction timeline & activity cards
│   │   ├── Contacts.tsx           # Contact directory with DataTable
│   │   ├── Dashboard.tsx          # Real-time metrics and charts
│   │   ├── Leads.tsx              # Kanban pipeline board
│   │   ├── Login.tsx              # Authentication portal
│   │   ├── Organizations.tsx      # Organization directory with DataTable
│   │   ├── Products.tsx           # Products list with DataTable
│   │   └── Quotes.tsx             # Quotes and line item management
│   └── schemas/                   # Zod validation schemas
│
├── Documentations/                # Project documentation archive & audit logs
├── docker-compose.yml             # Development container orchestration
├── docker-compose.prod.yml        # Production container configuration
├── Dockerfile.frontend            # Frontend multi-stage container
├── package.json                   # Frontend dependencies and scripts
└── vite.config.ts                 # Vite bundler configuration
```

---

## 🚀 Quick Start (Docker - Recommended)

Docker is the quickest and most consistent way to spin up the entire application suite including database and cache.

### 1. Clone the Repository

```powershell
git clone https://github.com/saadaitsaid26/azure-group-crm.git
cd azure_group_crm
```

### 2. Environment Setup

Copy the sample environment files:

```powershell
# Root environment
Copy-Item .env.example .env

# Backend environment
Copy-Item api\.env.example api\.env
```

### 3. Verify Docker Environment (Windows PowerShell)

Use the built-in diagnostic script to ensure Docker is healthy:

```powershell
.\docker-verify.ps1
```

### 4. Build and Start Services

```powershell
# Option A: One-click PowerShell helper
.\docker-start.ps1

# Option B: Standard Docker Compose CLI
docker-compose up -d --build
```

### 5. Access Endpoints

Once containers report healthy, open your browser:

| Service | URL | Notes |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:8080](http://localhost:8080) | React SPA with hot-reloading |
| **Backend API Root** | [http://localhost:3000](http://localhost:3000) | Django REST Framework API |
| **API Documentation (Swagger)** | [http://localhost:3000/api/docs/](http://localhost:3000/api/docs/) | Interactive API explorer |
| **API Documentation (ReDoc)** | [http://localhost:3000/api/redoc/](http://localhost:3000/api/redoc/) | Detailed schema reference |
| **Django Admin** | [http://localhost:3000/admin/](http://localhost:3000/admin/) | Native Django superuser portal |
| **Health Check** | [http://localhost:3000/health](http://localhost:3000/health) | System and database diagnostic |

### 6. Default Credentials

The container initialization automatically seeds test accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@example.com` | `admin123` | Full access (CRM + Admin Panel + Django Admin) |
| **Standard User** | `user@example.com` | `user123` | Standard CRM operations (Leads, Contacts, Quotes) |

---

## 🏃 Local Development (Without Docker)

If you prefer running services directly on your host machine:

### Prerequisites
- **Python** 3.12+
- **Node.js** 20+ and `npm`
- **PostgreSQL 17** (or fallback to SQLite by setting `DATABASE_URL=` in `api/.env`)
- **Redis 7** (optional; local cache fallback supported in development)

---

### Backend Setup

1. **Navigate to the API folder and create a virtual environment:**
   ```powershell
   cd api
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

2. **Install backend dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Apply database migrations:**
   ```powershell
   python manage.py migrate
   ```

5. **Seed demo users & reference data:**
   ```powershell
   python manage.py create_test_users
   ```

6. **Start the backend development server:**
   ```powershell
   python manage.py runserver 3000
   ```
   *The API will be available at `http://localhost:3000`.*

---

### Frontend Setup

1. **Open a new terminal at the project root:**
   ```powershell
   # Install NPM packages
   npm install
   ```

2. **Set up frontend environment:**
   ```powershell
   Copy-Item .env.example .env
   ```

3. **Start the Vite development server:**
   ```powershell
   npm run dev
   ```
   *The frontend will launch at `http://localhost:8080` (or `http://localhost:5173`).*

---

## 🔌 API Documentation

Azure Group CRM features auto-generated, type-safe API documentation via `drf-spectacular`.

```
GET /api/schema/       # OpenAPI 3.0 raw YAML/JSON schema
GET /api/docs/         # Interactive Swagger UI
GET /api/redoc/        # ReDoc documentation reader
GET /health            # System health check (DB & Cache status)
```

### Primary API Endpoints (`/api/v1/`)

| Domain | Route | Methods | Description |
| :--- | :--- | :--- | :--- |
| **Authentication** | `/api/v1/auth/login/` | `POST` | Authenticate and obtain `httpOnly` JWT cookies |
| | `/api/v1/auth/me/` | `GET` | Current user profile details |
| | `/api/v1/auth/refresh/` | `POST` | Rotate access token via refresh cookie |
| | `/api/v1/auth/logout/` | `POST` | Clear auth cookies and blacklist token |
| **Organizations** | `/api/v1/organizations/` | `GET`, `POST` | List and create organizations |
| | `/api/v1/organizations/{id}/` | `GET`, `PATCH`, `DELETE` | Retrieve, update, or remove organization |
| **Contacts** | `/api/v1/contacts/` | `GET`, `POST` | List and create contacts |
| | `/api/v1/contacts/{id}/` | `GET`, `PATCH`, `DELETE` | Retrieve, update, or remove contact |
| **Leads** | `/api/v1/leads/` | `GET`, `POST` | Opportunity list and lead creation |
| | `/api/v1/leads/{id}/` | `GET`, `PATCH`, `DELETE` | Update lead status or assign to pipeline stage |
| **Activities** | `/api/v1/activities/` | `GET`, `POST` | Interaction events, calls, tasks, and meetings |
| **Products** | `/api/v1/products/` | `GET`, `POST` | Manage product catalog and SKU configurations |
| | `/api/v1/products/stats/` | `GET` | Product catalog analytics by category and status |
| **Quotes** | `/api/v1/quotes/` | `GET`, `POST` | Create quotes with nested line items |
| | `/api/v1/quotes/{id}/` | `GET`, `PATCH`, `DELETE` | Update quote, calculate taxes, and change status |
| | `/api/v1/quotes/stats/` | `GET` | Financial metrics (pipeline value, conversion) |
| **Administration** | `/api/v1/users/` | `GET`, `POST` | Admin user governance (admin-only) |
| | `/api/v1/groups/` | `GET`, `POST` | Group and RBAC permissions management |
| | `/api/v1/reference/` | `GET`, `POST` | Manage pipeline stages, lead sources, activity types |

---

## 🧪 Testing & Quality Assurance

### Backend Automated Tests

Tests are managed through `pytest` and `pytest-django`:

```powershell
# Run all backend tests
docker-compose exec api pytest -v

# Run with test coverage
docker-compose exec api pytest --cov=. --cov-report=term-missing

# Run local without Docker
cd api
pytest -v
```

### Frontend Validation & Linting

```powershell
# TypeScript strict type checking
npm run typecheck

# ESLint code standard analysis
npm run lint

# Production build test
npm run build
```

### PowerShell Test Automation Scripts

The repository includes ready-to-run automation scripts for end-to-end verification:
- `.\test-auth-flow.ps1` - Tests authentication endpoints, cookie handling, and token rotation.
- `.\test-api-endpoints.ps1` - Smoke-tests all API routes and returns status codes.
- `.\test-accessibility.ps1` - Validates UI elements against WCAG standards.

---

## 🛠️ Common Operations & Cheat Sheet

```powershell
# View live container logs
docker-compose logs -f api
docker-compose logs -f web

# Run migrations inside the container
docker-compose exec api python manage.py migrate

# Create a new superuser
docker-compose exec api python manage.py createsuperuser

# Access PostgreSQL CLI
docker-compose exec db psql -U app -d crm

# Stop all containers
docker-compose down

# Stop and wipe database volume (clean state)
docker-compose down -v
```

---

## 📚 Documentation Hub

For in-depth architectural decisions, guides, and migration notes, explore the `Documentations/` directory:

| Document | Purpose |
| :--- | :--- |
| **[DATATABLE_DOCUMENTATION.md](Documentations/DATATABLE_DOCUMENTATION.md)** | Complete developer guide for the TanStack Table system |
| **[DOCKER.md](Documentations/DOCKER.md)** | Production containerization and deployment specifications |
| **[STATE.md](Documentations/STATE.md)** | Historical implementation progress and development log |
| **[API_TESTING_GUIDE.md](Documentations/API_TESTING_GUIDE.md)** | Manual and automated API test procedures |
| **[ACCESSIBILITY_FIXES.md](Documentations/ACCESSIBILITY_FIXES.md)** | ARIA accessibility audits and implementation details |
| **[DJANGO_SETTINGS_EXPLAINED.md](Documentations/DJANGO_SETTINGS_EXPLAINED.md)** | Split configuration guide (base, dev, prod) |

---

## 🚢 Production Deployment

1. **Environment Variables**: Configure `.env.production.example` into `.env` with a secure random `SECRET_KEY`, non-default database credentials, and production `ALLOWED_HOSTS`.
2. **Container Orchestration**: Deploy using the production Compose specification:
   ```powershell
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
3. **Static Assets**: Run `python manage.py collectstatic --noinput` to bundle static admin and Swagger files.
4. **HTTPS / TLS**: Terminate TLS at a reverse proxy (e.g., Nginx, Traefik, or Azure Application Gateway) with `SECURE_PROXY_SSL_HEADER` enabled.

---

## 🤝 Contribution & License

- **Ownership**: Proprietary software developed for **Azure Group**.
- **Contact**: Reach out to the internal engineering team for feature requests or deployment queries.

---

<div align="center">

**Built with precision and modern engineering for Azure Group © 2025**

</div>
