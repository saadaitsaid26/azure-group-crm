"""Base Django settings for crm_backend project."""


import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-change-this-in-production")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG", "False") == "True"

# ALLOWED_HOSTS Configuration
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party apps
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "drf_spectacular",
    "django_filters",
    # Local apps
    "users",
    "organizations",
    "contacts",
    "leads",
    "activities",
    "products",
    "quote_items",
    "reference_data",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # CORS must be before CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "crm_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "crm_backend.wsgi.application"
ASGI_APPLICATION = "crm_backend.asgi.application"

# Database configuration
# Supports DATABASE_URL or individual env vars
import dj_database_url

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    # Use DATABASE_URL if provided (Docker/production)
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Fallback to SQLite for local development
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Cache configuration (Redis)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
        },
        "KEY_PREFIX": "crm",
    }
}

# Session configuration (use Redis for sessions in production)
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

# Custom User Model
AUTH_USER_MODEL = "users.User"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# REST Framework Configuration
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "users.authentication.CookieJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
    },
}

# Simple JWT Configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.getenv("SIMPLEJWT_ACCESS_TOKEN_LIFETIME_MINUTES", "15"))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(os.getenv("SIMPLEJWT_REFRESH_TOKEN_LIFETIME_DAYS", "7"))
    ),
    "ROTATE_REFRESH_TOKENS": os.getenv("SIMPLEJWT_ROTATE_REFRESH_TOKENS", "True")
    == "True",
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_COOKIE": "access_token",
    "AUTH_COOKIE_REFRESH": "refresh_token",
    "AUTH_COOKIE_SECURE": os.getenv("SIMPLEJWT_COOKIE_SECURE", "False") == "True",
    "AUTH_COOKIE_HTTP_ONLY": True,
    "AUTH_COOKIE_SAMESITE": os.getenv("SIMPLEJWT_COOKIE_SAMESITE", "Lax"),
    "AUTH_COOKIE_PATH": "/",
    "AUTH_COOKIE_DOMAIN": os.getenv("COOKIE_DOMAIN", None),
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = os.getenv(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8080"
).split(",")
CORS_ALLOW_CREDENTIALS = True

# CSRF Configuration
CSRF_TRUSTED_ORIGINS = os.getenv(
    "CSRF_TRUSTED_ORIGINS", "http://localhost:5173,http://localhost:8080"
).split(",")
CSRF_COOKIE_HTTPONLY = False  # Allow JS to read CSRF token
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_USE_SESSIONS = False

# drf-spectacular settings
SPECTACULAR_SETTINGS = {
    "TITLE": "Azure Group CRM API",
    "DESCRIPTION": "API documentation for Azure Group CRM",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
}

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================
# Smart, centralized logging configuration for all environments
# Automatically adapts based on DEBUG setting and environment variables

# Ensure logs directory exists
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)

# Determine log level from environment or DEBUG setting
LOG_LEVEL = os.getenv("LOG_LEVEL", "DEBUG" if DEBUG else "INFO")

# Determine if we should log to files (production) or just console (development)
LOG_TO_FILE = os.getenv("LOG_TO_FILE", "True" if not DEBUG else "False") == "True"

# Configure logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    # ========================================================================
    # FORMATTERS - Define how log messages are formatted
    # ========================================================================
    "formatters": {
        # Detailed formatter for file logs (production)
        "verbose": {
            "format": "[{levelname}] {asctime} | {name} | {module}.{funcName}:{lineno} | Process:{process:d} Thread:{thread:d} | {message}",
            "style": "{",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        # Standard formatter for console (development)
        "standard": {
            "format": "[{levelname}] {asctime} | {name} | {message}",
            "style": "{",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        # Simple formatter for console in production
        "simple": {
            "format": "[{levelname}] {asctime} | {message}",
            "style": "{",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    # ========================================================================
    # FILTERS - Control which log records are processed
    # ========================================================================
    "filters": {
        "require_debug_false": {
            "()": "django.utils.log.RequireDebugFalse",
        },
        "require_debug_true": {
            "()": "django.utils.log.RequireDebugTrue",
        },
    },
    # ========================================================================
    # HANDLERS - Define where and how logs are output
    # ========================================================================
    "handlers": {
        # Console handler for development (uses standard formatter)
        "console_dev": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "standard",
            "filters": ["require_debug_true"],
        },
        # Console handler for production (uses simple formatter)
        "console_prod": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "formatter": "simple",
            "filters": ["require_debug_false"],
        },
        # File handler for all logs (rotating)
        "file_all": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOGS_DIR / "django.log",
            "maxBytes": 1024 * 1024 * 10,  # 10 MB
            "backupCount": 5,
            "formatter": "verbose",
        },
        # File handler for errors only (rotating)
        "file_errors": {
            "level": "ERROR",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOGS_DIR / "django_errors.log",
            "maxBytes": 1024 * 1024 * 10,  # 10 MB
            "backupCount": 5,
            "formatter": "verbose",
        },
        # File handler for debug logs (rotating, only in DEBUG mode)
        "file_debug": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOGS_DIR / "django_debug.log",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 3,
            "formatter": "verbose",
            "filters": ["require_debug_true"],
        },
        # Null handler (discards logs)
        "null": {
            "class": "logging.NullHandler",
        },
    },
    # ========================================================================
    # LOGGERS - Configure logging for specific modules/apps
    # ========================================================================
    "loggers": {
        # Django framework logger
        "django": {
            "handlers": ["console_dev", "console_prod"] + (["file_all", "file_errors"] if LOG_TO_FILE else []),
            "level": "INFO",
            "propagate": False,
        },
        # Django request/response logger (catches 4xx, 5xx errors)
        "django.request": {
            "handlers": ["console_dev", "console_prod"] + (["file_errors"] if LOG_TO_FILE else []),
            "level": "WARNING",
            "propagate": False,
        },
        # Django database query logger (useful for debugging slow queries)
        "django.db.backends": {
            "handlers": ["console_dev", "file_debug"] if DEBUG else ["null"],
            "level": "DEBUG" if DEBUG and os.getenv("LOG_SQL", "False") == "True" else "INFO",
            "propagate": False,
        },
        # Django security logger
        "django.security": {
            "handlers": ["console_dev", "console_prod"] + (["file_errors"] if LOG_TO_FILE else []),
            "level": "WARNING",
            "propagate": False,
        },
        # Django server logger
        "django.server": {
            "handlers": ["console_dev", "console_prod"] + (["file_all"] if LOG_TO_FILE else []),
            "level": "INFO",
            "propagate": False,
        },
        # CRM Backend logger
        "crm_backend": {
            "handlers": ["console_dev", "console_prod"] + (["file_all", "file_errors"] if LOG_TO_FILE else []),
            "level": LOG_LEVEL,
            "propagate": False,
        },
        # Users app logger
        "users": {
            "handlers": ["console_dev", "console_prod"] + (["file_all", "file_errors"] if LOG_TO_FILE else []),
            "level": LOG_LEVEL,
            "propagate": False,
        },
        # Organizations app logger
        "organizations": {
            "handlers": ["console_dev", "console_prod"] + (["file_all", "file_errors"] if LOG_TO_FILE else []),
            "level": LOG_LEVEL,
            "propagate": False,
        },
        # Contacts app logger
        "contacts": {
            "handlers": ["console_dev", "console_prod"] + (["file_all", "file_errors"] if LOG_TO_FILE else []),
            "level": LOG_LEVEL,
            "propagate": False,
        },
        # Leads app logger
        "leads": {
            "handlers": ["console_dev", "console_prod"] + (["file_all", "file_errors"] if LOG_TO_FILE else []),
            "level": LOG_LEVEL,
            "propagate": False,
        },
        # Activities app logger
        "activities": {
            "handlers": ["console_dev", "console_prod"] + (["file_all", "file_errors"] if LOG_TO_FILE else []),
            "level": LOG_LEVEL,
            "propagate": False,
        },
        # Products app logger
        "products": {
            "handlers": ["console_dev", "console_prod"] + (["file_all", "file_errors"] if LOG_TO_FILE else []),
            "level": LOG_LEVEL,
            "propagate": False,
        },
        # Quote Items app logger
        "quote_items": {
            "handlers": ["console_dev", "console_prod"] + (["file_all", "file_errors"] if LOG_TO_FILE else []),
            "level": LOG_LEVEL,
            "propagate": False,
        },
        # Reference Data app logger
        "reference_data": {
            "handlers": ["console_dev", "console_prod"] + (["file_all", "file_errors"] if LOG_TO_FILE else []),
            "level": LOG_LEVEL,
            "propagate": False,
        },
    },
    # ========================================================================
    # ROOT LOGGER - Catches all unhandled logs
    # ========================================================================
    "root": {
        "handlers": ["console_dev", "console_prod"] + (["file_all", "file_errors"] if LOG_TO_FILE else []),
        "level": LOG_LEVEL,
    },
}
