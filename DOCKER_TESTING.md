# Docker Testing Guide

## ✅ Pre-flight Checklist

Before starting Docker Compose, ensure:

1. ✅ Docker Desktop is installed
2. ✅ Docker Desktop is running (check system tray)
3. ✅ Environment files are copied (.env, api\.env)
4. ✅ All Dockerfiles exist

Run the verification script to check:
```powershell
.\docker-verify.ps1
```

## 🚀 Starting Services

### Option 1: Quick Start Script (Recommended)
```powershell
.\docker-start.ps1
```

This script will:
- Check if Docker is running
- Create environment files if needed
- Build all containers
- Start all services
- Show access URLs and test credentials
- Optionally show logs

### Option 2: Manual Start
```powershell
# Build containers
docker-compose build

# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🔍 Verifying Services

### Check Service Status
```powershell
docker-compose ps
```

Expected output:
```
NAME           STATUS          PORTS
crm_api        Up (healthy)    0.0.0.0:3000->3000/tcp
crm_db         Up (healthy)    0.0.0.0:5432->5432/tcp
crm_redis      Up (healthy)    0.0.0.0:6379->6379/tcp
crm_web        Up              0.0.0.0:8080->8080/tcp
```

### Check Health Endpoint
```powershell
# Using Invoke-WebRequest
Invoke-WebRequest http://localhost:3000/health | Select-Object -Expand Content

# Expected response:
# {"status":"healthy","database":"healthy","cache":"healthy"}
```

### Check API Documentation
```powershell
# Open Swagger UI
Start-Process "http://localhost:3000/api/docs/"

# Or check with curl
Invoke-WebRequest http://localhost:3000/api/docs/ | Select-Object StatusCode
# Expected: StatusCode = 200
```

### Check Frontend
```powershell
# Open frontend
Start-Process "http://localhost:8080"

# Or check status
Invoke-WebRequest http://localhost:8080 | Select-Object StatusCode
# Expected: StatusCode = 200
```

## 🧪 Testing Authentication

### Test Login Endpoint
```powershell
# Test unauthorized access
Invoke-WebRequest http://localhost:3000/api/v1/auth/me

# Expected: 401 Unauthorized
```

### Test with Test Users
```powershell
# The create_test_users command runs automatically on startup
# Test credentials:
# Admin: admin@example.com / admin123
# User: user@example.com / user123
```

### Run Backend Tests
```powershell
# Run all tests
docker-compose exec api pytest -v

# Run specific test file
docker-compose exec api pytest users/tests.py -v

# With coverage
docker-compose exec api pytest --cov=. --cov-report=term-missing
```

## 📊 Monitoring

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db
docker-compose logs -f redis

# Last 50 lines
docker-compose logs --tail=50 api
```

### Check Container Resources
```powershell
# Real-time stats
docker stats

# Specific containers
docker stats crm_api crm_web
```

## 🔧 Database Operations

### Check Database Connection
```powershell
# Access PostgreSQL shell
docker-compose exec db psql -U app -d crm

# Inside psql:
\dt          # List tables
\du          # List users
\q           # Quit
```

### Run Migrations
```powershell
# Migrations run automatically on startup, but you can run manually:
docker-compose exec api python manage.py migrate

# Create new migration
docker-compose exec api python manage.py makemigrations

# Check migration status
docker-compose exec api python manage.py showmigrations
```

### Access Django Shell
```powershell
docker-compose exec api python manage.py shell

# Inside shell:
from users.models import User
User.objects.all()
```

## 🔄 Redis Operations

### Check Redis Connection
```powershell
# Access Redis CLI
docker-compose exec redis redis-cli

# Inside redis-cli:
PING         # Should return PONG
KEYS *       # List all keys
INFO         # Server info
```

### Clear Cache
```powershell
docker-compose exec redis redis-cli FLUSHALL
```

## 🛑 Stopping Services

### Stop All Services
```powershell
docker-compose stop
```

### Stop and Remove Containers
```powershell
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes Data)
```powershell
docker-compose down -v
```

## 🔄 Restarting Services

### Restart All Services
```powershell
docker-compose restart
```

### Restart Specific Service
```powershell
docker-compose restart api
docker-compose restart web
```

### Rebuild and Restart
```powershell
# Rebuild API
docker-compose build api
docker-compose up -d api

# Rebuild everything
docker-compose build
docker-compose up -d
```

## ❌ Troubleshooting

### Containers Won't Start
```powershell
# Check logs
docker-compose logs api
docker-compose logs db

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Failed
```powershell
# Check if database is healthy
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Wait for health check
Start-Sleep -Seconds 10
docker-compose ps
```

### Port Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Clean Slate
```powershell
# Nuclear option: remove everything and start fresh
docker-compose down -v --rmi all
docker-compose build --no-cache
docker-compose up -d
```

## ✅ Success Criteria

Your Docker setup is working correctly if:

- ✅ `docker-compose ps` shows all services as "Up" or "Up (healthy)"
- ✅ `http://localhost:3000/health` returns `{"status":"healthy"}`
- ✅ `http://localhost:3000/api/docs/` shows Swagger UI
- ✅ `http://localhost:8080` shows the React frontend
- ✅ `docker-compose exec api pytest -v` shows all tests passing
- ✅ No errors in `docker-compose logs`

## 📝 Next Steps After Successful Test

Once Docker is working:

1. ✅ Verify all endpoints are accessible
2. ✅ Run backend tests
3. ✅ Test authentication flow manually
4. ✅ Proceed to Phase 3: Frontend Auth Integration

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify Docker Desktop is running
3. Check [DOCKER.md](DOCKER.md) for detailed troubleshooting
4. Review error messages carefully
