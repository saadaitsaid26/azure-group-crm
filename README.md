# Azure Group CRM

A modern, full-stack Customer Relationship Management (CRM) system built with Django REST Framework and React.

## 🚀 Features

- **Modern Tech Stack**: Django 5, React 18, TypeScript, TailwindCSS
- **Secure Authentication**: JWT cookie-based auth with token rotation
- **API Documentation**: Auto-generated Swagger and ReDoc documentation
- **Docker Ready**: Full containerization with Docker Compose
- **Production Ready**: PostgreSQL, Redis, Gunicorn, health checks
- **Developer Friendly**: Hot reload, comprehensive testing, clear documentation

## 🏗️ Architecture

### Backend
- **Framework**: Django 5.0.10 + Django REST Framework 3.15.2
- **Database**: PostgreSQL 16 (SQLite for local dev without Docker)
- **Cache**: Redis 7 (sessions + caching)
- **Authentication**: JWT with httpOnly cookies
- **API Documentation**: drf-spectacular (Swagger + ReDoc)
- **Server**: Gunicorn with Uvicorn workers

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6

## 📋 Prerequisites

- **Docker Desktop** (recommended for development)
  - Download: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
  
**OR** for local development without Docker:

- **Node.js** 20+ and npm
- **Python** 3.12+
- **PostgreSQL** 16+ (optional, can use SQLite)
- **Redis** 7+ (optional)

## 🚀 Quick Start (Docker - Recommended)

### 1. Clone the repository

```powershell
git clone https://github.com/saadaitsaid26/bluechip-crm.git
cd azure_group_crm
```

### 2. Verify Docker setup

```powershell
.\docker-verify.ps1
```

### 3. Start the application

```powershell
# Option A: Use the quick start script
.\docker-start.ps1

# Option B: Manual start
Copy-Item .env.example .env
Copy-Item api\.env.example api\.env
docker-compose up -d
```

### 4. Access the application

- **Frontend**: <http://localhost:8080>
- **Backend API**: <http://localhost:3000>
- **API Docs (Swagger)**: <http://localhost:3000/api/docs/>
- **API Docs (ReDoc)**: <http://localhost:3000/api/redoc/>
- **Health Check**: <http://localhost:3000/health>

### 5. Test Credentials

- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`

## 🛠️ Development

### View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

### Run Tests

```powershell
# Backend tests
docker-compose exec api pytest -v

# With coverage
docker-compose exec api pytest --cov=. --cov-report=term-missing
```

### Database Operations

```powershell
# Run migrations
docker-compose exec api python manage.py migrate

# Create superuser
docker-compose exec api python manage.py createsuperuser

# Access database shell
docker-compose exec db psql -U app -d crm
```

### Stop Services

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## 📖 Documentation

- **[PLAN.md](PLAN.md)** - Development roadmap and phases
- **[DOCKER.md](DOCKER.md)** - Comprehensive Docker guide
- **[STATE.md](STATE.md)** - Implementation progress log
- **[TESTING_REPORT.md](TESTING_REPORT.md)** - Test results and coverage

## 🏃 Local Development (Without Docker)

### Backend Setup

```powershell
cd api

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Copy environment file
Copy-Item .env.example .env

# Run migrations
python manage.py migrate

# Create test users
python manage.py create_test_users

# Start development server
python manage.py runserver 3000
```

### Frontend Setup

```powershell
# Install dependencies
npm install

# Copy environment file
Copy-Item .env.example .env

# Start development server
npm run dev
```

## 🧪 Testing

### Backend Tests

```powershell
cd api

# Run all tests
pytest -v

# Run specific test file
pytest users/tests.py -v

# With coverage report
pytest --cov=. --cov-report=html
```

### Frontend Tests

```powershell
# Type checking
npm run typecheck

# Linting
npm run lint

# Build verification
npm run build
```

## 📁 Project Structure

```
azure_group_crm/
├── api/                      # Django backend
│   ├── crm_backend/         # Project settings
│   │   ├── settings/        # Split settings (base/dev/prod)
│   │   └── ...
│   ├── users/               # User authentication app
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── manage.py
├── src/                     # React frontend
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── lib/                # Utilities
│   └── ...
├── docker-compose.yml      # Development containers
├── docker-compose.prod.yml # Production containers
├── Dockerfile.frontend     # Frontend container
└── package.json           # Frontend dependencies
```

## 🔒 Security Features

- ✅ httpOnly cookies (prevents XSS attacks)
- ✅ JWT token rotation on refresh
- ✅ CORS and CSRF protection
- ✅ Rate limiting (5 login attempts/minute)
- ✅ Secure password hashing (PBKDF2)
- ✅ Environment-based secrets
- ✅ Database connection pooling

## 🚢 Production Deployment

See [DOCKER.md](DOCKER.md) for production deployment instructions.

Key steps:
1. Update `.env.production.example` with your values
2. Set strong `SECRET_KEY` and database passwords
3. Configure `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
4. Use `docker-compose.prod.yml` for deployment
5. Set up SSL/TLS certificates
6. Configure backup strategy

## 📊 Current Progress

- ✅ **Phase 0**: Project setup and configuration
- ✅ **Phase 1**: Backend scaffold with authentication
- ✅ **Phase 2**: Docker and DevOps setup
- 🔄 **Phase 3**: Frontend auth integration (next)
- ⏳ **Phase 4**: Core entities (Organizations, Contacts)
- ⏳ **Phase 5+**: Additional features

See [STATE.md](STATE.md) for detailed progress tracking.

## 🤝 Contributing

This is a private project for Azure Group. Contact the development team for contribution guidelines.

## 📝 License

Proprietary - Azure Group © 2025

## 🆘 Support

For issues or questions:
1. Check [DOCKER.md](DOCKER.md) troubleshooting section
2. Review [STATE.md](STATE.md) for known issues
3. Contact the development team

---

**Built with ❤️ for Azure Group**
