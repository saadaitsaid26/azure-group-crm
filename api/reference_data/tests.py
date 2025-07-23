"""
Tests for user management and reference data.
"""

from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User
from reference_data.models import PipelineStage, LeadSource, ActivityType, ContactType


class UserManagementTests(APITestCase):
    """Tests for user management endpoints (admin only)."""

    def setUp(self):
        """Set up test data."""
        # Create admin user
        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            first_name="Admin",
            last_name="User",
            role="admin",
        )
        
        # Create regular user
        self.user = User.objects.create_user(
            email="user@test.com",
            password="testpass123",
            first_name="Regular",
            last_name="User",
            role="user",
        )

    def test_list_users_as_admin(self):
        """Test listing users as admin."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/v1/users/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(len(response.data["results"]), 2)

    def test_list_users_as_regular_user(self):
        """Test listing users as regular user (should be forbidden)."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/v1/users/")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_users_unauthenticated(self):
        """Test listing users without authentication."""
        response = self.client.get("/api/v1/users/")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_user_as_admin(self):
        """Test creating a user as admin."""
        self.client.force_authenticate(user=self.admin)
        data = {
            "email": "newuser@test.com",
            "password": "newpass123",
            "first_name": "New",
            "last_name": "User",
            "role": "user",
        }
        response = self.client.post("/api/v1/users/", data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], "newuser@test.com")
        self.assertTrue(User.objects.filter(email="newuser@test.com").exists())

    def test_user_stats(self):
        """Test user statistics endpoint."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/v1/users/stats/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total"], 2)
        self.assertEqual(response.data["by_role"]["admin"], 1)
        self.assertEqual(response.data["by_role"]["user"], 1)


class PipelineStageTests(APITestCase):
    """Tests for pipeline stage management."""

    def setUp(self):
        """Set up test data."""
        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            role="admin",
        )
        self.client.force_authenticate(user=self.admin)

    def test_create_pipeline_stage(self):
        """Test creating a pipeline stage."""
        data = {
            "name": "Qualified",
            "description": "Qualified leads",
            "sort_order": 2,
            "color": "#FF5733",
        }
        response = self.client.post("/api/v1/reference/pipeline-stages/", data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Qualified")
        self.assertEqual(response.data["sort_order"], 2)

    def test_list_pipeline_stages(self):
        """Test listing pipeline stages."""
        PipelineStage.objects.create(name="New", sort_order=1)
        PipelineStage.objects.create(name="Qualified", sort_order=2)
        
        response = self.client.get("/api/v1/reference/pipeline-stages/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)


class LeadSourceTests(APITestCase):
    """Tests for lead source management."""

    def setUp(self):
        """Set up test data."""
        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            role="admin",
        )
        self.client.force_authenticate(user=self.admin)

    def test_create_lead_source(self):
        """Test creating a lead source."""
        data = {
            "name": "Website",
            "description": "Leads from website",
        }
        response = self.client.post("/api/v1/reference/lead-sources/", data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Website")

    def test_list_lead_sources(self):
        """Test listing lead sources."""
        LeadSource.objects.create(name="Website")
        LeadSource.objects.create(name="Referral")
        
        response = self.client.get("/api/v1/reference/lead-sources/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)


class ActivityTypeTests(APITestCase):
    """Tests for activity type management."""

    def setUp(self):
        """Set up test data."""
        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            role="admin",
        )
        self.client.force_authenticate(user=self.admin)

    def test_create_activity_type(self):
        """Test creating an activity type."""
        data = {
            "name": "Call",
            "description": "Phone call",
            "icon": "phone",
        }
        response = self.client.post("/api/v1/reference/activity-types/", data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Call")
        self.assertEqual(response.data["icon"], "phone")


class ContactTypeTests(APITestCase):
    """Tests for contact type management."""

    def setUp(self):
        """Set up test data."""
        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="testpass123",
            role="admin",
        )
        self.client.force_authenticate(user=self.admin)

    def test_create_contact_type(self):
        """Test creating a contact type."""
        data = {
            "name": "Decision Maker",
            "description": "Primary decision maker",
        }
        response = self.client.post("/api/v1/reference/contact-types/", data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Decision Maker")
