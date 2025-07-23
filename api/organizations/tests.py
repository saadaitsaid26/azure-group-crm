import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User
from .models import Organization


@pytest.mark.django_db
class TestOrganizationEndpoints:
    """Test suite for Organization API endpoints."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Set up test client and user."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.list_url = reverse('organization-list')
    
    def test_list_organizations_unauthorized(self):
        """Test that unauthorized users cannot list organizations."""
        client = APIClient()
        response = client.get(self.list_url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_organizations_empty(self):
        """Test listing organizations when none exist."""
        response = self.client.get(self.list_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 0
        assert response.data['results'] == []
    
    def test_create_organization(self):
        """Test creating a new organization."""
        data = {
            'name': 'Test Corp',
            'email': 'contact@testcorp.com',
            'phone': '+1234567890',
            'industry': 'Technology',
            'website': 'https://testcorp.com',
            'status': 'active',
            'type': 'Enterprise'
        }
        response = self.client.post(self.list_url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Test Corp'
        assert response.data['email'] == 'contact@testcorp.com'
        assert 'id' in response.data
        assert 'created_at' in response.data
    
    def test_create_organization_minimal_fields(self):
        """Test creating an organization with only required fields."""
        data = {
            'name': 'Minimal Corp',
            'email': 'minimal@corp.com',
        }
        response = self.client.post(self.list_url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Minimal Corp'
    
    def test_create_organization_duplicate_email(self):
        """Test that duplicate emails for active organizations are prevented."""
        Organization.objects.create(
            name='Existing Corp',
            email='duplicate@test.com',
            status='active'
        )
        data = {
            'name': 'New Corp',
            'email': 'duplicate@test.com',
            'status': 'active'
        }
        response = self.client.post(self.list_url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data
    
    def test_list_organizations_with_data(self):
        """Test listing organizations."""
        Organization.objects.create(
            name='Corp A',
            email='a@test.com',
            status='active'
        )
        Organization.objects.create(
            name='Corp B',
            email='b@test.com',
            status='prospect'
        )
        
        response = self.client.get(self.list_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2
        assert len(response.data['results']) == 2
    
    def test_filter_by_status(self):
        """Test filtering organizations by status."""
        Organization.objects.create(name='Active Corp', email='active@test.com', status='active')
        Organization.objects.create(name='Prospect Corp', email='prospect@test.com', status='prospect')
        
        response = self.client.get(self.list_url, {'status': 'active'})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        assert response.data['results'][0]['status'] == 'active'
    
    def test_search_organizations(self):
        """Test searching organizations by name."""
        Organization.objects.create(name='Tech Corp', email='tech@test.com', industry='Technology')
        Organization.objects.create(name='Finance Inc', email='finance@test.com', industry='Finance')
        
        response = self.client.get(self.list_url, {'q': 'Tech'})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        assert 'Tech' in response.data['results'][0]['name']
    
    def test_retrieve_organization(self):
        """Test retrieving a single organization."""
        org = Organization.objects.create(
            name='Test Corp',
            email='test@corp.com',
            phone='+1234567890'
        )
        url = reverse('organization-detail', kwargs={'pk': org.id})
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == str(org.id)
        assert response.data['name'] == 'Test Corp'
    
    def test_update_organization(self):
        """Test updating an organization."""
        org = Organization.objects.create(
            name='Old Name',
            email='old@test.com'
        )
        url = reverse('organization-detail', kwargs={'pk': org.id})
        data = {
            'name': 'New Name',
            'email': 'new@test.com',
            'industry': 'Updated Industry'
        }
        response = self.client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'New Name'
        assert response.data['industry'] == 'Updated Industry'
    
    def test_delete_organization(self):
        """Test deleting an organization."""
        org = Organization.objects.create(
            name='To Delete',
            email='delete@test.com'
        )
        url = reverse('organization-detail', kwargs={'pk': org.id})
        response = self.client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Organization.objects.filter(id=org.id).exists()
