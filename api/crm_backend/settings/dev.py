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

# Logging is configured in base.py - no override needed for development
