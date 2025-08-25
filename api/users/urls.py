"""
URL patterns for users app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import group_views

app_name = "users"

# Router for ViewSets
router = DefaultRouter()
router.register(r"", views.UserViewSet, basename="user")

# Router for Groups
groups_router = DefaultRouter()
groups_router.register(r"", group_views.GroupViewSet, basename="group")

# Router for Permissions
permissions_router = DefaultRouter()
permissions_router.register(r"", group_views.PermissionViewSet, basename="permission")

urlpatterns = [
    # Auth endpoints (under /api/v1/auth/)
    path("login", views.login_view, name="login"),
    path("me", views.me_view, name="me"),
    path("refresh", views.refresh_view, name="refresh"),
    path("logout", views.logout_view, name="logout"),
]

# User management endpoints will be registered under /api/v1/users/ in main urls.py
user_management_urls = router.urls

# Groups and Permissions endpoints will be registered under /api/v1/groups/ and /api/v1/permissions/
groups_urls = groups_router.urls
permissions_urls = permissions_router.urls
