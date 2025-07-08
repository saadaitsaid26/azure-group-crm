"""
Settings package for crm_backend.
Uses dev.py by default, can be overridden via DJANGO_SETTINGS_MODULE env var.
"""

import os

# Default to development settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_backend.settings.dev")
