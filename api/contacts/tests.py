import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User
from organizations.models import Organization
from .models import Contact


@pytest.mark.django_db
class TestContactEndpoints:
    """Test suite for Contact API endpoints."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Set up test client, user, and organization."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.organization = Organization.objects.create(
            name='Test Org',
            email='org@test.com'
        )
        self.list_url = reverse('contact-list')
    
    def test_list_contacts_unauthorized(self):
        """Test that unauthorized users cannot list contacts."""
        client = APIClient()
        response = client.get(self.list_url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_contacts_empty(self):
        """Test listing contacts when none exist."""
        response = self.client.get(self.list_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 0
        assert response.data['results'] == []
    
    def test_create_contact(self):
        """Test creating a new contact."""
        data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@test.com',
            'phone': '+1234567890',
            'organization': str(self.organization.id),
            'role': 'Manager',
            'status': 'active'
        }
        response = self.client.post(self.list_url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['first_name'] == 'John'
        assert response.data['last_name'] == 'Doe'
        assert response.data['email'] == 'john.doe@test.com'
        assert response.data['organization_name'] == 'Test Org'
        assert 'id' in response.data
    
    def test_create_contact_without_organization(self):
        """Test creating a contact without an organization."""
        data = {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'jane@test.com',
            'phone': '+9876543210',
            'status': 'lead'
        }
        response = self.client.post(self.list_url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['organization'] is None
    
    def test_create_contact_duplicate_email(self):
        """Test that duplicate emails for active contacts are prevented."""
        Contact.objects.create(
            first_name='Existing',
            last_name='Contact',
            email='duplicate@test.com',
            status='active'
        )
        data = {
            'first_name': 'New',
            'last_name': 'Contact',
            'email': 'duplicate@test.com',
            'phone': '+1111111111',
            'status': 'active'
        }
        response = self.client.post(self.list_url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data
    
    def test_list_contacts_with_data(self):
        """Test listing contacts."""
        Contact.objects.create(
            first_name='John',
            last_name='Doe',
            email='john@test.com',
            organization=self.organization
        )
        Contact.objects.create(
            first_name='Jane',
            last_name='Smith',
            email='jane@test.com'
        )
        
        response = self.client.get(self.list_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2
        assert len(response.data['results']) == 2
    
    def test_filter_by_organization(self):
        """Test filtering contacts by organization."""
        org2 = Organization.objects.create(name='Org 2', email='org2@test.com')
        Contact.objects.create(
            first_name='Contact',
            last_name='One',
            email='c1@test.com',
            organization=self.organization
        )
        Contact.objects.create(
            first_name='Contact',
            last_name='Two',
            email='c2@test.com',
            organization=org2
        )
        
        response = self.client.get(self.list_url, {'organization': str(self.organization.id)})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        # organization field returns UUID object, not string
        assert str(response.data['results'][0]['organization']) == str(self.organization.id)
    
    def test_search_contacts(self):
        """Test searching contacts by name."""
        Contact.objects.create(first_name='Alice', last_name='Wonder', email='alice@test.com')
        Contact.objects.create(first_name='Bob', last_name='Builder', email='bob@test.com')
        
        response = self.client.get(self.list_url, {'q': 'Alice'})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        assert 'Alice' in response.data['results'][0]['first_name']
    
    def test_retrieve_contact(self):
        """Test retrieving a single contact."""
        contact = Contact.objects.create(
            first_name='Test',
            last_name='Contact',
            email='test@contact.com',
            organization=self.organization
        )
        url = reverse('contact-detail', kwargs={'pk': contact.id})
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == str(contact.id)
        assert response.data['full_name'] == 'Test Contact'
    
    def test_update_contact(self):
        """Test updating a contact."""
        contact = Contact.objects.create(
            first_name='Old',
            last_name='Name',
            email='old@test.com',
            phone='+1234567890'  # Ensure phone or email is provided
        )
        url = reverse('contact-detail', kwargs={'pk': contact.id})
        data = {
            'first_name': 'New',
            'last_name': 'Name',
            'email': 'old@test.com',  # Keep email to pass validation
            'role': 'Updated Role'
        }
        response = self.client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == 'New'
        assert response.data['role'] == 'Updated Role'
    
    def test_delete_contact(self):
        """Test deleting a contact."""
        contact = Contact.objects.create(
            first_name='To',
            last_name='Delete',
            email='delete@test.com'
        )
        url = reverse('contact-detail', kwargs={'pk': contact.id})
        response = self.client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Contact.objects.filter(id=contact.id).exists()
