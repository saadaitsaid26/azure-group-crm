"""
URL configuration for crm_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from .health import health_check
from .dashboard import dashboard_stats, dashboard_summary
from users.urls import user_management_urls

urlpatterns = [
    # Health check
    path("health", health_check, name="health_check"),
    # Admin
    path("admin/", admin.site.urls),
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # API v1
    path("api/v1/dashboard/", dashboard_stats, name="dashboard_stats"),
    path("api/v1/dashboard/summary/", dashboard_summary, name="dashboard_summary"),
    path("api/v1/auth/", include("users.urls", namespace="users")),
    path("api/v1/users/", include(user_management_urls)),  # User management (admin only)
    path("api/v1/organizations/", include("organizations.urls")),
    path("api/v1/contacts/", include("contacts.urls")),
    path("api/v1/leads/", include("leads.urls")),
    path("api/v1/activities/", include("activities.urls")),
    path("api/v1/products/", include("products.urls")),
    path("api/v1/", include("quote_items.urls")),
    path("api/v1/reference/", include("reference_data.urls")),  # Reference data (admin only)
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
