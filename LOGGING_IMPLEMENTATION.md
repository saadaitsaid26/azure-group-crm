# Django Logging Feature Implementation

## Summary

File-based logging has been successfully added to the Django backend for both development and production environments.

---

## Changes Made

### 1. **Updated `api/crm_backend/settings/dev.py`**

Added comprehensive logging configuration with:
- ✅ Console handler (stdout/stderr) - same as before
- ✅ **File handler** - `django.log` (all logs, 10MB max, 5 backups)
- ✅ **Error file handler** - `django_errors.log` (ERROR+ only, 10MB max, 5 backups)
- ✅ **Debug file handler** - `django_debug.log` (SQL queries, 10MB max, 3 backups)
- ✅ Log rotation to prevent disk space issues
- ✅ Verbose formatting with timestamps, module, process, thread info
- ✅ Per-app loggers for all CRM apps

**Log Files Created:**
```
api/logs/
├── django.log              # All logs (INFO+)
├── django_errors.log       # Errors only (ERROR+)
└── django_debug.log        # Debug info including SQL queries
```

### 2. **Updated `api/crm_backend/settings/prod.py`**

Added production-grade logging with:
- ✅ Console handler (for Docker logs)
- ✅ **File handler** - `django.log` (50MB max, 10 backups)
- ✅ **Error file handler** - `django_errors.log` (50MB max, 10 backups)
- ✅ **Security file handler** - `security.log` (security events, 50MB max, 10 backups)
- ✅ **Critical file handler** - `critical.log` (critical errors only, 50MB max, 10 backups)
- ✅ Larger file sizes and more backups for production
- ✅ Security-focused logging for audit trails

**Log Files Created:**
```
api/logs/
├── django.log              # All logs (INFO+)
├── django_errors.log       # Errors only (ERROR+)
├── security.log            # Security events (WARNING+)
└── critical.log            # Critical errors only
```

### 3. **Updated `docker-compose.yml`**

Added log directory volume mount:
```yaml
volumes:
  - ./api:/app
  - static_volume:/app/staticfiles
  - ./api/logs:/app/logs  # ← NEW: Persists logs on host
```

### 4. **Updated `docker-compose.prod.yml`**

Added log directory volume mount for production:
```yaml
volumes:
  - static_volume:/app/staticfiles
  - media_volume:/app/media
  - ./api/logs:/app/logs  # ← NEW: Persists logs on host
```

### 5. **`.gitignore` Already Configured**

The `.gitignore` file already excludes:
- `*.log` files
- `logs` directories

So log files won't be committed to Git.

---

## Logging Configuration Details

### Development Settings (`dev.py`)

#### Handlers:
| Handler | Output | Level | Max Size | Backups | Purpose |
|---------|--------|-------|----------|---------|---------|
| `console` | stdout/stderr | ALL | N/A | N/A | Terminal output |
| `file` | `django.log` | ALL | 10 MB | 5 | General logs |
| `error_file` | `django_errors.log` | ERROR+ | 10 MB | 5 | Error tracking |
| `debug_file` | `django_debug.log` | DEBUG+ | 10 MB | 3 | SQL queries, debug info |

#### Loggers:
| Logger | Level | Handlers | Purpose |
|--------|-------|----------|---------|
| `root` | INFO | console, file | Default logger |
| `django` | INFO | console, file, error_file | Django framework |
| `django.request` | WARNING | console, error_file | HTTP requests |
| `django.db.backends` | DEBUG | debug_file | SQL queries |
| `users` | DEBUG | console, file, error_file | Users app |
| `organizations` | DEBUG | console, file, error_file | Organizations app |
| `contacts` | DEBUG | console, file, error_file | Contacts app |
| `leads` | DEBUG | console, file, error_file | Leads app |
| `activities` | DEBUG | console, file, error_file | Activities app |
| `products` | DEBUG | console, file, error_file | Products app |
| `quote_items` | DEBUG | console, file, error_file | Quote Items app |
| `reference_data` | DEBUG | console, file, error_file | Reference Data app |

### Production Settings (`prod.py`)

#### Handlers:
| Handler | Output | Level | Max Size | Backups | Purpose |
|---------|--------|-------|----------|---------|---------|
| `console` | stdout/stderr | ALL | N/A | N/A | Docker logs |
| `file` | `django.log` | ALL | 50 MB | 10 | General logs |
| `error_file` | `django_errors.log` | ERROR+ | 50 MB | 10 | Error tracking |
| `security_file` | `security.log` | WARNING+ | 50 MB | 10 | Security events |
| `critical_file` | `critical.log` | CRITICAL | 50 MB | 10 | Critical failures |

#### Loggers:
| Logger | Level | Handlers | Purpose |
|--------|-------|----------|---------|
| `root` | INFO | console, file | Default logger |
| `django` | INFO | console, file, error_file | Django framework |
| `django.request` | ERROR | console, error_file, critical_file | HTTP errors |
| `django.security` | WARNING | console, security_file, critical_file | Security events |
| `django.db.backends` | INFO | file | SQL queries (less verbose) |
| All CRM apps | INFO | console, file, error_file | Application logs |

---

## Log Formats

### Simple Format (Console in Dev):
```
INFO 2025-10-18 14:30:45,123 User login successful
ERROR 2025-10-18 14:31:02,456 Database connection failed
```

### Verbose Format (Files):
```
INFO 2025-10-18 14:30:45,123 users 12345 67890 User john.doe logged in successfully
ERROR 2025-10-18 14:31:02,456 django.db 12345 67891 Database connection failed: timeout
```

Format breakdown:
- `{levelname}` - Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- `{asctime}` - Timestamp
- `{module}` - Python module name
- `{process:d}` - Process ID
- `{thread:d}` - Thread ID
- `{message}` - Log message

---

## Log Rotation

**RotatingFileHandler** automatically rotates logs when they reach max size:

### Development:
- Main log: 10 MB → creates `django.log.1`, `django.log.2`, ... up to `django.log.5`
- After 5 backups, oldest is deleted
- Total disk usage: ~60 MB max (10 MB × 6 files)

### Production:
- Main log: 50 MB → creates `django.log.1`, `django.log.2`, ... up to `django.log.10`
- Total disk usage: ~550 MB max per log type
- Multiple log files: ~2 GB total maximum

---

## How to Use Logging in Code

### Basic Logging:

```python
import logging

logger = logging.getLogger(__name__)

# Different log levels
logger.debug("Detailed debug information")
logger.info("General information")
logger.warning("Warning message")
logger.error("Error occurred")
logger.critical("Critical failure!")
```

### Example in a Django View:

```python
from rest_framework.views import APIView
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)

class UserLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        logger.info(f"Login attempt for user: {username}")
        
        try:
            # Authentication logic
            user = authenticate(username=username, password=password)
            if user:
                logger.info(f"User {username} logged in successfully")
                return Response({"status": "success"})
            else:
                logger.warning(f"Failed login attempt for user: {username}")
                return Response({"status": "failed"})
        except Exception as e:
            logger.error(f"Login error for {username}: {str(e)}", exc_info=True)
            return Response({"status": "error"}, status=500)
```

### Example in a Model:

```python
from django.db import models
import logging

logger = logging.getLogger(__name__)

class Organization(models.Model):
    name = models.CharField(max_length=255)
    
    def save(self, *args, **kwargs):
        logger.debug(f"Saving organization: {self.name}")
        try:
            super().save(*args, **kwargs)
            logger.info(f"Organization saved successfully: {self.name} (ID: {self.id})")
        except Exception as e:
            logger.error(f"Failed to save organization {self.name}: {str(e)}", exc_info=True)
            raise
```

---

## Testing the Logging

### 1. Restart Docker Containers:

```powershell
cd C:\Users\saada\Desktop\azure_group_crm
docker-compose down
docker-compose up -d
```

### 2. Check Log Files Are Created:

```powershell
cd api\logs
Get-ChildItem
```

Expected output:
```
django.log
django_errors.log
django_debug.log
```

### 3. Monitor Logs in Real-Time:

```powershell
# Watch all logs
Get-Content api\logs\django.log -Wait -Tail 50

# Watch errors only
Get-Content api\logs\django_errors.log -Wait -Tail 50

# Watch debug/SQL queries
Get-Content api\logs\django_debug.log -Wait -Tail 50
```

### 4. Generate Test Logs:

```python
# Run Django shell
docker exec -it crm_api python manage.py shell

# In the shell:
import logging
logger = logging.getLogger('users')

logger.debug("This is a debug message")
logger.info("This is an info message")
logger.warning("This is a warning message")
logger.error("This is an error message")
logger.critical("This is a critical message")
```

### 5. Check Docker Logs (Console Output):

```powershell
docker logs crm_api -f
```

---

## Verification Commands

### Check if logs directory exists:
```powershell
Test-Path api\logs
```

### Check log file sizes:
```powershell
Get-ChildItem api\logs -File | Select-Object Name, @{Name="Size (KB)";Expression={[math]::Round($_.Length/1KB,2)}}
```

### Count lines in log files:
```powershell
Get-Content api\logs\django.log | Measure-Object -Line
```

### Search for specific patterns:
```powershell
# Find all errors
Select-String -Path api\logs\django.log -Pattern "ERROR"

# Find all user-related logs
Select-String -Path api\logs\django.log -Pattern "user"

# Find logs from specific module
Select-String -Path api\logs\django.log -Pattern "organizations"
```

### View last 20 lines:
```powershell
Get-Content api\logs\django.log -Tail 20
```

---

## Benefits

### Before (Console Only):
- ❌ Logs lost when container restarts
- ❌ No historical data
- ❌ Difficult to debug issues that happened in the past
- ❌ Can't analyze patterns over time
- ❌ No separation by severity

### After (Console + Files):
- ✅ Persistent logs on disk
- ✅ Historical data preserved
- ✅ Can review past events and errors
- ✅ Separate files for errors, security, critical issues
- ✅ Automatic log rotation prevents disk space issues
- ✅ Detailed formatting with timestamps, process IDs, thread IDs
- ✅ Per-app logging for better debugging
- ✅ SQL query logging in development
- ✅ Security event logging in production
- ✅ Docker logs still available via `docker logs`

---

## Log Management Best Practices

### 1. **Regular Monitoring:**
```powershell
# Setup a scheduled task to check log files daily
Get-Content api\logs\django_errors.log | Select-String -Pattern "ERROR|CRITICAL"
```

### 2. **Archive Old Logs:**
```powershell
# Compress logs older than 7 days
$date = (Get-Date).AddDays(-7)
Get-ChildItem api\logs\*.log.* | Where-Object {$_.LastWriteTime -lt $date} | Compress-Archive -DestinationPath "logs_archive_$(Get-Date -Format 'yyyy-MM-dd').zip"
```

### 3. **Disk Space Monitoring:**
```powershell
# Check logs directory size
Get-ChildItem api\logs -Recurse | Measure-Object -Property Length -Sum | Select-Object @{Name="Size (MB)";Expression={[math]::Round($_.Sum/1MB,2)}}
```

### 4. **Error Alerting:**
```powershell
# Check for critical errors in last hour
$lastHour = (Get-Date).AddHours(-1)
Get-Content api\logs\critical.log | Where-Object {$_ -match "CRITICAL"} | Select-Object -Last 10
```

---

## Integration with Monitoring Tools

The log files can be integrated with:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana + Loki**
- **Splunk**
- **Datadog**
- **Sentry** (for error tracking)
- **Azure Monitor** (if deploying to Azure)

---

## Troubleshooting

### Issue: Logs directory not created
**Solution:**
```powershell
mkdir api\logs
```

### Issue: Permission errors writing logs
**Solution:**
```powershell
# Check directory permissions
icacls api\logs

# Grant full control (if needed)
icacls api\logs /grant Users:F
```

### Issue: Log files growing too large
**Solution:**
- Log rotation is automatic
- Adjust `maxBytes` in settings if needed
- Increase `backupCount` for more history

### Issue: Can't see logs in files
**Solution:**
1. Check Django settings are loaded: `docker exec -it crm_api python -c "from django.conf import settings; print(settings.LOGGING)"`
2. Verify logs directory exists in container: `docker exec -it crm_api ls -la logs/`
3. Check file permissions: `docker exec -it crm_api ls -la logs/`
4. Restart container: `docker-compose restart api`

---

## Next Steps

1. ✅ **Restart Docker containers** to apply changes
2. ✅ **Test logging** by making API requests
3. ✅ **Verify log files** are being created
4. 📊 Consider adding **log analysis dashboard** (Grafana/Kibana)
5. 🔔 Set up **error alerting** for critical issues
6. 📈 Monitor **log file sizes** over time
7. 🔍 Add **custom logging** to critical business logic

---

**Date:** October 18, 2025  
**Implementation By:** GitHub Copilot  
**Status:** ✅ Complete - Ready for Testing
