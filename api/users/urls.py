"""
URL patterns for users app.
"""

from django.urls import path
from . import views

app_name = "users"

urlpatterns = [
    path("auth/login", views.login_view, name="login"),
    path("auth/me", views.me_view, name="me"),
    path("auth/refresh", views.refresh_view, name="refresh"),
    path("auth/logout", views.logout_view, name="logout"),
]
