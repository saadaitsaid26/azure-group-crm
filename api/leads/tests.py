from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from organizations.models import Organization
from contacts.models import Contact
from .models import Lead

User = get_user_model()


class LeadViewSetTestCase(APITestCase):
    """
    Test suite for Lead ViewSet.
    """

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        
        # Create test users
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123',
            first_name='Other',
            last_name='User'
        )
        
        # Create test organization
        self.organization = Organization.objects.create(
            name='Test Org',
            industry='Technology',
            status='active'
        )
        
        # Create test contact
        self.contact = Contact.objects.create(
            organization=self.organization,
            first_name='John',
            last_name='Doe',
            email='john@testorg.com',
            status='active'
        )
        
        # Create test leads
        self.lead1 = Lead.objects.create(
            organization=self.organization,
            contact=self.contact,
            owner=self.user,
            title='Lead 1',
            value=10000.00,
            priority='high',
            stage='new',
            source='website'
        )
        
        self.lead2 = Lead.objects.create(
            organization=self.organization,
            owner=self.other_user,
            title='Lead 2',
            value=5000.00,
            priority='medium',
            stage='followUp',
            source='referral'
        )

    def test_list_leads_unauthenticated(self):
        """Test that unauthenticated users cannot list leads."""
        response = self.client.get('/api/v1/leads/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_leads_empty(self):
        """Test listing leads when none exist."""
        Lead.objects.all().delete()
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/leads/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertEqual(response.data['results'], [])

    def test_list_leads(self):
        """Test listing leads."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/leads/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)

    def test_create_lead_full(self):
        """Test creating a lead with all fields."""
        self.client.force_authenticate(user=self.user)
        data = {
            'organization': str(self.organization.id),
            'contact': str(self.contact.id),
            'title': 'New Lead',
            'value': '15000.00',
            'priority': 'high',
            'stage': 'new',
            'source': 'cold_call',
            'notes': 'Test notes'
        }
        response = self.client.post('/api/v1/leads/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Lead')
        self.assertEqual(response.data['value'], '15000.00')
        self.assertEqual(response.data['priority'], 'high')
        self.assertEqual(response.data['stage'], 'new')
        # Owner should be auto-assigned to the current user
        self.assertEqual(str(response.data['owner']), str(self.user.id))

    def test_create_lead_minimal(self):
        """Test creating a lead with minimal fields."""
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'Minimal Lead',
            'stage': 'new'
        }
        response = self.client.post('/api/v1/leads/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Minimal Lead')
        self.assertEqual(response.data['stage'], 'new')
        self.assertEqual(response.data['priority'], 'medium')  # default

    def test_create_lead_negative_value(self):
        """Test creating a lead with negative value fails."""
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'Bad Lead',
            'value': '-1000.00',
            'stage': 'new'
        }
        response = self.client.post('/api/v1/leads/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('value', response.data)

    def test_filter_leads_by_stage(self):
        """Test filtering leads by stage."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/leads/', {'stage': 'new'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['stage'], 'new')

    def test_filter_leads_by_priority(self):
        """Test filtering leads by priority."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/leads/', {'priority': 'high'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['priority'], 'high')

    def test_filter_leads_by_owner(self):
        """Test filtering leads by owner."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/leads/', {'owner_id': str(self.user.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(str(response.data['results'][0]['owner']), str(self.user.id))

    def test_filter_leads_by_organization(self):
        """Test filtering leads by organization."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/leads/', {'organization_id': str(self.organization.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_search_leads(self):
        """Test searching leads by title and notes."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/leads/', {'q': 'Lead 1'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Lead 1')

    def test_retrieve_lead(self):
        """Test retrieving a single lead."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/v1/leads/{self.lead1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], str(self.lead1.id))
        self.assertEqual(response.data['title'], 'Lead 1')

    def test_update_lead(self):
        """Test updating a lead."""
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'Updated Lead',
            'stage': 'prospect',
            'priority': 'low'
        }
        response = self.client.patch(f'/api/v1/leads/{self.lead1.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Lead')
        self.assertEqual(response.data['stage'], 'prospect')

    def test_update_lead_prevent_reopen_won(self):
        """Test that updating a won lead to a different stage is prevented."""
        self.lead1.stage = 'won'
        self.lead1.save()
        
        self.client.force_authenticate(user=self.user)
        data = {'stage': 'new'}
        response = self.client.patch(f'/api/v1/leads/{self.lead1.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Validation error is returned on 'stage' field
        self.assertIn('stage', response.data)

    def test_delete_lead(self):
        """Test deleting a lead."""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/v1/leads/{self.lead1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Lead.objects.filter(id=self.lead1.id).exists())

    def test_lead_stats(self):
        """Test lead statistics endpoint."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/leads/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('by_stage', response.data)
        self.assertIn('by_priority', response.data)
        self.assertIn('total_value', response.data)
        self.assertIn('average_value', response.data)
        self.assertEqual(response.data['total'], 2)

    def test_lead_pipeline(self):
        """Test lead pipeline endpoint."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/leads/pipeline/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        # Should have entries for 'new' and 'followUp' stages
        stages = [item['stage'] for item in response.data]
        self.assertIn('new', stages)
        self.assertIn('followUp', stages)

