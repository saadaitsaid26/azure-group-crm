# Django Settings Files Explained

## Overview

Your Django project uses a **modular settings structure** instead of a single `settings.py` file. This allows different configurations for development, production, and other environments.

---

## File Structure

```
crm_backend/
├── settings/
│   ├── __init__.py      # Settings package initializer
│   ├── base.py          # Shared settings for all environments
│   ├── dev.py           # Development-specific settings
│   └── prod.py          # Production-specific settings
├── settings.py          # Legacy/old settings file (NOT USED)
├── wsgi.py              # WSGI server entry point
├── asgi.py              # ASGI server entry point
└── ...
```

---

## 1. `settings/__init__.py` - Settings Package Initializer

**Purpose:** Makes the `settings/` directory a Python package and sets the default settings module.

**Current Content:**
```python
"""
Settings package for crm_backend.
Uses dev.py by default, can be overridden via DJANGO_SETTINGS_MODULE env var.
"""

import os

# Default to development settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings.dev")
```

**What It Does:**
- Converts the `settings/` directory into a Python package
- Sets a **default** environment variable `DJANGO_SETTINGS_MODULE` to `crm_backend.settings.dev`
- This default is only used if no other configuration has set this variable
- Acts as a fallback mechanism

**Key Point:** This is a **setdefault**, meaning it only sets the value if it hasn't been set already by:
- `.env` file
- `docker-compose.yml`
- `manage.py`
- Command line environment variables

---

## 2. `settings/base.py` - Shared Base Settings

**Purpose:** Contains settings that are **common to all environments** (dev, staging, production).

**What's Defined Here:**
```python
# Core Django settings
- BASE_DIR                      # Project root directory
- SECRET_KEY                    # From environment variable
- INSTALLED_APPS                # All Django apps & 3rd party packages
- MIDDLEWARE                    # Request/response processing pipeline
- ROOT_URLCONF                  # URL configuration module
- TEMPLATES                     # Template engine configuration
- WSGI_APPLICATION              # WSGI application path
- ASGI_APPLICATION              # ASGI application path

# Database Configuration
- DATABASES                     # PostgreSQL via DATABASE_URL or SQLite fallback

# Cache Configuration
- CACHES                        # Redis cache configuration
- SESSION_ENGINE                # Use Redis for sessions

# Custom Settings
- AUTH_USER_MODEL               # Custom User model: users.User

# Security
- AUTH_PASSWORD_VALIDATORS      # Password strength requirements

# Internationalization
- LANGUAGE_CODE, TIME_ZONE      # Locale settings
- USE_I18N, USE_TZ              # Internationalization flags

# Static Files
- STATIC_URL, STATIC_ROOT       # Static file serving

# REST Framework
- REST_FRAMEWORK                # DRF configuration (auth, permissions, pagination)

# JWT Authentication
- SIMPLE_JWT                    # JWT token configuration (lifetime, cookies, etc.)

# CORS
- CORS_ALLOWED_ORIGINS          # Cross-origin resource sharing
- CORS_ALLOW_CREDENTIALS

# CSRF
- CSRF_TRUSTED_ORIGINS          # Cross-site request forgery protection
- CSRF_COOKIE_HTTPONLY
- CSRF_COOKIE_SAMESITE

# API Documentation
- SPECTACULAR_SETTINGS          # drf-spectacular OpenAPI config
```

**Key Characteristics:**
- ✅ Environment-agnostic (works in any environment)
- ✅ Uses environment variables for sensitive data
- ✅ Shared by both dev.py and prod.py
- ✅ No DEBUG or ALLOWED_HOSTS (those are environment-specific)

**Why This Approach?**
- **DRY Principle:** Don't repeat yourself - shared settings in one place
- **Maintainability:** Update common settings once, affects all environments
- **Clarity:** Environment-specific files only contain differences

---

## 3. `settings/dev.py` - Development Settings

**Purpose:** Settings specific to **local development** and **Docker development** environments.

**Current Content:**
```python
from .base import *  # Import all base settings

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "*"]

# Development-specific settings
INTERNAL_IPS = ["127.0.0.1"]

# Allow all origins in development if CORS_ALLOWED_ORIGINS is not set
if not os.getenv("CORS_ALLOWED_ORIGINS"):
    CORS_ALLOW_ALL_ORIGINS = True

# Logging configuration for development (CONSOLE ONLY)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",  # stdout/stderr
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
```

**Key Settings:**
- **`DEBUG = True`** - Enables detailed error pages, template debugging
- **`ALLOWED_HOSTS = ["*"]`** - Allows connections from any host (permissive for dev)
- **`CORS_ALLOW_ALL_ORIGINS`** - Allows all cross-origin requests (if not configured)
- **`INTERNAL_IPS`** - For Django Debug Toolbar (if installed)
- **`LOGGING`** - Console-only logging for easy terminal viewing

**Security Note:** These settings are **UNSAFE for production**:
- ❌ DEBUG mode exposes sensitive information
- ❌ Wildcard ALLOWED_HOSTS is a security risk
- ❌ CORS allowing all origins is dangerous

**When Used:**
- Running `python manage.py runserver` locally
- Docker Compose development (`docker-compose.yml`)
- Running tests with pytest
- Any time `DJANGO_SETTINGS_MODULE=crm_backend.settings.dev`

---

## 4. `settings/prod.py` - Production Settings

**Purpose:** Settings optimized for **production deployment** with security hardening.

**Current Content:**
```python
from .base import *  # Import all base settings

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# Security settings for production
SECURE_SSL_REDIRECT = True          # Force HTTPS
SESSION_COOKIE_SECURE = True        # Only send session cookie over HTTPS
CSRF_COOKIE_SECURE = True           # Only send CSRF cookie over HTTPS
SECURE_BROWSER_XSS_FILTER = True    # Enable XSS filtering
SECURE_CONTENT_TYPE_NOSNIFF = True  # Prevent MIME sniffing
X_FRAME_OPTIONS = "DENY"            # Prevent clickjacking
SECURE_HSTS_SECONDS = 31536000      # HTTP Strict Transport Security (1 year)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Content Security Policy
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'",)
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
CSP_IMG_SRC = ("'self'", "data:", "https:")
CSP_FONT_SRC = ("'self'", "data:")

# Logging configuration for production (CONSOLE ONLY - currently)
LOGGING = {
    # ... more detailed logging with verbose formatter
    # Still outputs to console only (see DJANGO_LOGGING_ANALYSIS.md for file-based recommendations)
}
```

**Key Security Enhancements:**
- **`DEBUG = False`** - Hides error details from users
- **`ALLOWED_HOSTS`** - Restricts which domains can serve the app
- **SSL/HTTPS Enforcement** - All cookies and connections secured
- **Security Headers** - HSTS, XSS protection, frame options
- **Content Security Policy** - Prevents XSS attacks

**When Used:**
- Production deployments (Azure, AWS, etc.)
- Docker Compose production (`docker-compose.prod.yml`)
- Any time `DJANGO_SETTINGS_MODULE=crm_backend.settings.prod`

---

## 5. `settings.py` - Legacy Settings File

**Location:** `crm_backend/settings.py` (in root of crm_backend, NOT in settings/ folder)

**Status:** ⚠️ **NOT CURRENTLY USED** - This is an old/legacy file

**Current Content:**
```python
# Basic Django settings from django-admin startproject
# This file exists but is NOT loaded by your application
```

**Why It Exists:**
- Created automatically by `django-admin startproject`
- Kept for reference or backwards compatibility
- Your app uses `settings/` folder instead

**Should You Delete It?**
- Generally safe to remove to avoid confusion
- Or keep it for reference and document that it's not used
- **It won't affect your app** - the settings/ folder takes precedence

---

## 6. `wsgi.py` - WSGI Server Entry Point

**Purpose:** Entry point for **WSGI-compatible web servers** (Gunicorn, uWSGI, Apache mod_wsgi).

**Current Content:**
```python
"""
WSGI config for crm_backend project.
It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings")

application = get_wsgi_application()
```

**What is WSGI?**
- **WSGI** = Web Server Gateway Interface
- A specification for how web servers communicate with Python web applications
- The **traditional/synchronous** Python web server interface
- Used for handling regular HTTP requests

**How It Works:**
1. Web server (Nginx, Apache) receives HTTP request
2. Web server forwards request to WSGI server (Gunicorn)
3. Gunicorn calls the `application` object defined here
4. Django processes the request and returns a response

**Key Line:**
```python
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings")
```
- Sets default to `crm_backend.settings` (which is the old settings.py file)
- ⚠️ **Problem:** This points to the legacy file, not the settings folder!
- **However:** This is overridden by environment variables in production
- Your `.env` and `docker-compose.yml` set `DJANGO_SETTINGS_MODULE=crm_backend.settings.dev`

**When Used:**
- Production deployments with Gunicorn + WSGI workers
- Traditional synchronous Django applications
- Your Dockerfile uses: `gunicorn crm_backend.asgi:application -k uvicorn.workers.UvicornWorker`
  - Note: You're actually using ASGI (see below), not WSGI

**Do You Need This File?**
- ✅ Yes, keep it for compatibility
- 🤔 However, you're using ASGI in production (see asgi.py)
- WSGI is for synchronous applications; ASGI is for async

---

## 7. `asgi.py` - ASGI Server Entry Point

**Purpose:** Entry point for **ASGI-compatible web servers** (Uvicorn, Daphne, Hypercorn).

**Current Content:**
```python
"""
ASGI config for crm_backend project.
It exposes the ASGI callable as a module-level variable named ``application``.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings")

application = get_asgi_application()
```

**What is ASGI?**
- **ASGI** = Asynchronous Server Gateway Interface
- A specification for asynchronous Python web servers
- The **modern/async** Python web server interface
- Successor to WSGI, supports async views, WebSockets, HTTP/2

**How It Works:**
1. Your Dockerfile runs: `gunicorn crm_backend.asgi:application -k uvicorn.workers.UvicornWorker`
2. Gunicorn uses Uvicorn workers (ASGI) instead of WSGI workers
3. Enables async capabilities even though your views are mostly sync

**Key Differences from WSGI:**
| Feature | WSGI | ASGI |
|---------|------|------|
| Async Support | ❌ No | ✅ Yes |
| WebSockets | ❌ No | ✅ Yes |
| Long-lived connections | ❌ No | ✅ Yes |
| HTTP/2 | ❌ No | ✅ Yes |
| Performance | Good | Better (async I/O) |

**Why You're Using ASGI:**
- Modern best practice for Django 3.0+
- Enables future async features (async views, channels)
- Better performance for I/O-bound operations
- Your app currently uses sync views, but ASGI is forward-compatible

**Same Issue as wsgi.py:**
```python
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings")
```
- Points to legacy settings.py
- Overridden by environment variables (`.env`, `docker-compose.yml`)

---

## How Settings Are Loaded (Priority Order)

When Django starts, it looks for `DJANGO_SETTINGS_MODULE` in this order:

```
1. Command line environment variable (highest priority)
   $ DJANGO_SETTINGS_MODULE=crm_backend.settings.prod python manage.py runserver

2. Docker environment variable
   docker-compose.yml:
     environment:
       - DJANGO_SETTINGS_MODULE=crm_backend.settings.dev

3. .env file
   DJANGO_SETTINGS_MODULE=crm_backend.settings.dev

4. manage.py setdefault
   os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings.dev")

5. settings/__init__.py setdefault
   os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings.dev")

6. wsgi.py/asgi.py setdefault (lowest priority)
   os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings")
```

**Current Configuration:**
- Your `.env` and `docker-compose.yml` set it to `crm_backend.settings.dev`
- This overrides the `wsgi.py`/`asgi.py` default
- ✅ Result: You're using `dev.py` settings

---

## Settings Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Django Application Start                  │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Check DJANGO_SETTINGS_MODULE environment variable          │
│  (from .env, docker-compose.yml, or command line)           │
└─────────────────────────────────────────────────────────────┘
                              ▼
                   crm_backend.settings.dev
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  settings/dev.py loads                       │
│                     from .base import *                      │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              settings/base.py loads                          │
│  - Reads .env file (via dotenv)                             │
│  - Sets up DATABASES, CACHES, REST_FRAMEWORK, etc.          │
│  - Configures all shared settings                           │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         settings/dev.py adds/overrides                       │
│  - DEBUG = True                                             │
│  - ALLOWED_HOSTS = ["*"]                                    │
│  - LOGGING configuration                                     │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         Django application fully configured                  │
│         Ready to handle requests                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Recommendation: Fix wsgi.py and asgi.py

**Current Issue:**
Both files point to `crm_backend.settings` (legacy file) instead of `crm_backend.settings.dev`

**Fix:**

### Update `wsgi.py`:
```python
import os
from django.core.wsgi import get_wsgi_application

# Change this line:
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings")
# To this:
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings.dev")

application = get_wsgi_application()
```

### Update `asgi.py`:
```python
import os
from django.core.asgi import get_asgi_application

# Change this line:
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings")
# To this:
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings.dev")

application = get_asgi_application()
```

**Why This Matters:**
- Makes the default behavior consistent across all files
- Prevents confusion if environment variables aren't set
- Aligns with your actual settings structure

---

## Quick Reference

| File | Purpose | Currently Used? | Environment |
|------|---------|----------------|-------------|
| `settings/__init__.py` | Package initializer | ✅ Yes | All |
| `settings/base.py` | Shared settings | ✅ Yes | All |
| `settings/dev.py` | Development config | ✅ Yes (active) | Development |
| `settings/prod.py` | Production config | ❌ Not yet | Production |
| `settings.py` | Legacy config | ❌ No | None |
| `wsgi.py` | WSGI entry point | ⚠️ Available but not used | Production (sync) |
| `asgi.py` | ASGI entry point | ✅ Yes | Production (async) |

---

## Summary

1. **Settings Structure:**
   - `base.py` = Shared configuration
   - `dev.py` = Development (DEBUG=True, permissive CORS)
   - `prod.py` = Production (DEBUG=False, security hardened)

2. **Entry Points:**
   - `wsgi.py` = For traditional sync WSGI servers
   - `asgi.py` = For modern async ASGI servers (you're using this)

3. **Legacy File:**
   - `settings.py` = Old file, not used, can be deleted

4. **Current Configuration:**
   - Using `crm_backend.settings.dev`
   - Running ASGI via Uvicorn workers
   - Console-only logging (no file logs)

5. **Recommendations:**
   - Update `wsgi.py` and `asgi.py` to point to `settings.dev`
   - Consider deleting or renaming `settings.py` to avoid confusion
   - Add file-based logging (see `DJANGO_LOGGING_ANALYSIS.md`)

---

**Date:** October 18, 2025  
**Documentation By:** GitHub Copilot  
**Project:** Azure Group CRM
