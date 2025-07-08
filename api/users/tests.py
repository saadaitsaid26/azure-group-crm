"""
Tests for authentication endpoints.
"""

import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from users.models import User


@pytest.fixture
def api_client():
    """Create an API client for testing."""
    return APIClient()


@pytest.fixture
def test_user(db):
    """Create a test user."""
    return User.objects.create_user(
        email="test@example.com",
        password="testpass123",
        first_name="Test",
        last_name="User",
    )


@pytest.mark.django_db
class TestAuthEndpoints:
    """Test authentication endpoints."""

    def test_me_endpoint_unauthorized(self, api_client):
        """Test that /auth/me returns 401 when not authenticated."""
        url = reverse("users:me")
        response = api_client.get(url)
        assert response.status_code == 401

    def test_login_success(self, api_client, test_user):
        """Test successful login sets cookies and returns user data."""
        url = reverse("users:login")
        data = {"email": "test@example.com", "password": "testpass123"}
        response = api_client.post(url, data, format="json")

        assert response.status_code == 200
        assert "user" in response.data
        assert response.data["user"]["email"] == "test@example.com"
        # Check cookies are set
        assert "access_token" in response.cookies
        assert "refresh_token" in response.cookies

    def test_login_invalid_credentials(self, api_client, test_user):
        """Test login with invalid credentials returns 401."""
        url = reverse("users:login")
        data = {"email": "test@example.com", "password": "wrongpassword"}
        response = api_client.post(url, data, format="json")

        assert response.status_code == 401
        assert "error" in response.data

    def test_me_endpoint_authenticated(self, api_client, test_user):
        """Test that /auth/me returns user data when authenticated."""
        # Login first
        login_url = reverse("users:login")
        login_data = {"email": "test@example.com", "password": "testpass123"}
        login_response = api_client.post(login_url, login_data, format="json")

        # Set the cookie from login response
        api_client.cookies = login_response.cookies

        # Test /me endpoint
        me_url = reverse("users:me")
        response = api_client.get(me_url)

        assert response.status_code == 200
        assert response.data["email"] == "test@example.com"

    def test_logout(self, api_client, test_user):
        """Test logout clears cookies."""
        # Login first
        login_url = reverse("users:login")
        login_data = {"email": "test@example.com", "password": "testpass123"}
        login_response = api_client.post(login_url, login_data, format="json")
        api_client.cookies = login_response.cookies

        # Logout
        logout_url = reverse("users:logout")
        response = api_client.post(logout_url)

        assert response.status_code == 200
        # Cookies should be cleared (empty value)
        assert response.cookies["access_token"].value == ""
        assert response.cookies["refresh_token"].value == ""
