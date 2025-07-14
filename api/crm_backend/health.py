"""
Health check views for monitoring service status.
"""
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


def health_check(request):
    """
    Health check endpoint for container orchestration.
    Checks database and cache connectivity.
    """
    status = {
        "status": "healthy",
        "database": "unknown",
        "cache": "unknown",
    }
    http_status = 200

    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        status["database"] = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        status["database"] = "unhealthy"
        status["status"] = "unhealthy"
        http_status = 503

    # Check cache connection
    try:
        cache.set("health_check", "ok", 1)
        if cache.get("health_check") == "ok":
            status["cache"] = "healthy"
        else:
            raise Exception("Cache get/set failed")
    except Exception as e:
        logger.error(f"Cache health check failed: {e}")
        status["cache"] = "unhealthy"
        # Cache is optional, don't fail health check
        # status["status"] = "unhealthy"
        # http_status = 503

    return JsonResponse(status, status=http_status)
