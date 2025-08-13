# Docker Development Guide

## Prerequisites

- **Docker Desktop** for Windows (includes Docker Compose)
- **PowerShell** 5.1 or later

## Quick Start

### 1. Initial Setup

Copy environment files:

```powershell
# Copy frontend environment
Copy-Item .env.example .env

# Copy backend environment
Copy-Item api\.env.example api\.env
```

### 2. Build and Start Services

```powershell
# Build all containers
docker-compose build

# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api
docker-compose logs -f web
```

### 3. Access Services

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **API Documentation (Swagger)**: http://localhost:3000/api/docs/
- **API Documentation (ReDoc)**: http://localhost:3000/api/redoc/
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 4. Stop Services

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

## Common Commands

### Container Management

```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose stop

# Restart specific service
docker-compose restart api

# View running containers
docker-compose ps

# View container resource usage
docker stats
```

### Logs and Debugging

```powershell
# Follow logs from all services
docker-compose logs -f

# Follow logs from specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db

# View last 100 lines
docker-compose logs --tail=100 api

# Export logs to file
docker-compose logs api > api-logs.txt
```

### Database Operations

```powershell
# Run migrations
docker-compose exec api python manage.py migrate

# Create superuser
docker-compose exec api python manage.py createsuperuser

# Create test users
docker-compose exec api python manage.py create_test_users

# Open Django shell
docker-compose exec api python manage.py shell

# Access PostgreSQL shell
docker-compose exec db psql -U app -d crm

# Backup database
docker-compose exec db pg_dump -U app crm > backup.sql

# Restore database
Get-Content backup.sql | docker-compose exec -T db psql -U app -d crm
```

### Backend Development

```powershell
# Run tests
docker-compose exec api pytest

# Run specific test file
docker-compose exec api pytest users/tests.py -v

# Check code coverage
docker-compose exec api pytest --cov=. --cov-report=html

# Run migrations
docker-compose exec api python manage.py makemigrations
docker-compose exec api python manage.py migrate

# Collect static files
docker-compose exec api python manage.py collectstatic --noinput

# Open Python shell
docker-compose exec api python manage.py shell
```

### Frontend Development

```powershell
# Install new npm package
docker-compose exec web npm install <package-name>

# Run type checking
docker-compose exec web npm run typecheck

# Run linter
docker-compose exec web npm run lint

# Build for production
docker-compose exec web npm run build
```

### Redis Operations

```powershell
# Access Redis CLI
docker-compose exec redis redis-cli

# View all keys
docker-compose exec redis redis-cli KEYS '*'

# Flush all cache
docker-compose exec redis redis-cli FLUSHALL

# Monitor Redis commands in real-time
docker-compose exec redis redis-cli MONITOR
```

### Accessing Container Shell

```powershell
# Access API container shell
docker-compose exec api sh

# Access web container shell
docker-compose exec web sh

# Access database container shell
docker-compose exec db sh
```

## Development Workflow

### Hot Reload

Both frontend and backend support hot reload:

- **Frontend**: Vite dev server watches for file changes
- **Backend**: Gunicorn with `--reload` flag watches Python files

Simply edit files in your local workspace, and changes will reflect automatically.

### Running Tests

```powershell
# Run all backend tests
docker-compose exec api pytest -v

# Run with coverage
docker-compose exec api pytest --cov=. --cov-report=term-missing

# Run specific test
docker-compose exec api pytest users/tests.py::TestAuthEndpoints::test_login_success -v
```

### Database Migrations

```powershell
# Create new migration
docker-compose exec api python manage.py makemigrations

# Apply migrations
docker-compose exec api python manage.py migrate

# View migration status
docker-compose exec api python manage.py showmigrations

# Rollback migration
docker-compose exec api python manage.py migrate users 0001
```

## Troubleshooting

### Container won't start

```powershell
# Check container logs
docker-compose logs api

# Check container status
docker-compose ps

# Rebuild container
docker-compose build --no-cache api
docker-compose up -d api
```

### Database connection issues

```powershell
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify database connection from API
docker-compose exec api python manage.py dbshell
```

### Port already in use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Clean rebuild

```powershell
# Stop everything
docker-compose down -v

# Remove all containers and images
docker-compose down --rmi all -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Reset database

```powershell
# Stop services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker volume rm azure_group_crm_postgres_data

# Start fresh
docker-compose up -d

# Run migrations
docker-compose exec api python manage.py migrate

# Create test users
docker-compose exec api python manage.py create_test_users
```

## Production Deployment

For production deployment:

1. Update `.env` files with production values
2. Set `DEBUG=False` in `api/.env`
3. Generate strong `SECRET_KEY`
4. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
5. Use production Docker Compose file:

```powershell
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

## Health Checks

```powershell
# Check API health
Invoke-WebRequest http://localhost:3000/health | Select-Object -Expand Content

# Check database connectivity
docker-compose exec db pg_isready -U app

# Check Redis connectivity
docker-compose exec redis redis-cli PING
```

## Environment Variables

Key environment variables in `api/.env`:

- `DEBUG`: Enable debug mode (True/False)
- `SECRET_KEY`: Django secret key (change in production)
- `DATABASE_URL`: PostgreSQL connection string
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `REDIS_URL`: Redis connection string

Key environment variables in `.env`:

- `VITE_API_URL`: Backend API URL

## References

- Docker Compose Documentation: https://docs.docker.com/compose/
- Django Documentation: https://docs.djangoproject.com/
- Vite Documentation: https://vitejs.dev/
