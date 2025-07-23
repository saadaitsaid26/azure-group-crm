"""
URL patterns for users app.
"""

from django.urls import path
from . import views

app_name = "users"

urlpatterns = [
    # Note: root urls include this under 'api/v1/auth/', so don't repeat 'auth/' here
    path("login", views.login_view, name="login"),
    path("me", views.me_view, name="me"),
    path("refresh", views.refresh_view, name="refresh"),
    path("logout", views.logout_view, name="logout"),
]
