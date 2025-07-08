"""
Development settings for crm_backend project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "*"]

# Development-specific settings
INTERNAL_IPS = [
    "127.0.0.1",
]

# Allow all origins in development if CORS_ALLOWED_ORIGINS is not set
if not os.getenv("CORS_ALLOWED_ORIGINS"):
    CORS_ALLOW_ALL_ORIGINS = True

# Logging configuration for development
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
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
