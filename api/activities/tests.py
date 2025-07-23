from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from organizations.models import Organization
from contacts.models import Contact
from leads.models import Lead
from .models import Activity

User = get_user_model()


class ActivityViewSetTestCase(APITestCase):
    """
    Test suite for Activity ViewSet.
    """

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
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
        
        # Create test lead
        self.lead = Lead.objects.create(
            organization=self.organization,
            contact=self.contact,
            owner=self.user,
            title='Test Lead',
            stage='new'
        )
        
        # Create test activities
        now = timezone.now()
        
        self.activity1 = Activity.objects.create(
            lead=self.lead,
            contact=self.contact,
            organization=self.organization,
            created_by=self.user,
            type='call',
            title='Follow-up call',
            comment='Discuss requirements',
            is_done=False,
            schedule_from=now + timedelta(days=1),
            schedule_to=now + timedelta(days=1, hours=1)
        )
        
        self.activity2 = Activity.objects.create(
            contact=self.contact,
            organization=self.organization,
            created_by=self.user,
            type='email',
            title='Send proposal',
            comment='Email proposal document',
            is_done=True,
            schedule_from=now - timedelta(days=2),
            schedule_to=now - timedelta(days=2, hours=-1)
        )

    def test_list_activities_unauthenticated(self):
        """Test that unauthenticated users cannot list activities."""
        response = self.client.get('/api/v1/activities/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_activities_empty(self):
        """Test listing activities when none exist."""
        Activity.objects.all().delete()
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/activities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertEqual(response.data['results'], [])

    def test_list_activities(self):
        """Test listing activities."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/activities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)

    def test_create_activity_full(self):
        """Test creating an activity with all fields."""
        self.client.force_authenticate(user=self.user)
        now = timezone.now()
        data = {
            'lead': str(self.lead.id),
            'contact': str(self.contact.id),
            'organization': str(self.organization.id),
            'type': 'meeting',
            'title': 'Client meeting',
            'comment': 'Discuss project scope',
            'is_done': False,
            'schedule_from': (now + timedelta(days=3)).isoformat(),
            'schedule_to': (now + timedelta(days=3, hours=2)).isoformat()
        }
        response = self.client.post('/api/v1/activities/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Client meeting')
        self.assertEqual(response.data['type'], 'meeting')
        self.assertEqual(response.data['is_done'], False)
        # created_by should be auto-set to current user
        self.assertEqual(str(response.data['created_by']), str(self.user.id))

    def test_create_activity_minimal(self):
        """Test creating an activity with minimal fields."""
        self.client.force_authenticate(user=self.user)
        data = {
            'contact': str(self.contact.id),
            'type': 'note',
            'title': 'Quick note'
        }
        response = self.client.post('/api/v1/activities/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Quick note')
        self.assertEqual(response.data['type'], 'note')

    def test_create_activity_invalid_date_range(self):
        """Test creating an activity with schedule_from > schedule_to fails."""
        self.client.force_authenticate(user=self.user)
        now = timezone.now()
        data = {
            'contact': str(self.contact.id),
            'type': 'call',
            'title': 'Bad date range',
            'schedule_from': (now + timedelta(hours=2)).isoformat(),
            'schedule_to': (now + timedelta(hours=1)).isoformat()
        }
        response = self.client.post('/api/v1/activities/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('schedule_to', response.data)

    def test_create_activity_no_entity(self):
        """Test creating an activity without any entity reference fails."""
        self.client.force_authenticate(user=self.user)
        data = {
            'type': 'task',
            'title': 'Orphan activity'
        }
        response = self.client.post('/api/v1/activities/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_filter_activities_by_type(self):
        """Test filtering activities by type."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/activities/', {'type': 'call'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['type'], 'call')

    def test_filter_activities_by_is_done(self):
        """Test filtering activities by is_done status."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/activities/', {'is_done': 'false'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['is_done'], False)

    def test_filter_activities_by_lead(self):
        """Test filtering activities by lead."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/activities/', {'lead_id': str(self.lead.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(str(response.data['results'][0]['lead']), str(self.lead.id))

    def test_filter_activities_by_organization(self):
        """Test filtering activities by organization."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/activities/', {'organization_id': str(self.organization.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_search_activities(self):
        """Test searching activities by title and comment."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/activities/', {'q': 'Follow-up'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Follow-up call')

    def test_retrieve_activity(self):
        """Test retrieving a single activity."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/v1/activities/{self.activity1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], str(self.activity1.id))
        self.assertEqual(response.data['title'], 'Follow-up call')

    def test_update_activity(self):
        """Test updating an activity."""
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'Updated call',
            'comment': 'Updated comment'
        }
        response = self.client.patch(f'/api/v1/activities/{self.activity1.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated call')
        self.assertEqual(response.data['comment'], 'Updated comment')

    def test_delete_activity(self):
        """Test deleting an activity."""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/v1/activities/{self.activity1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Activity.objects.filter(id=self.activity1.id).exists())

    def test_toggle_done_action(self):
        """Test toggling the is_done status of an activity."""
        self.client.force_authenticate(user=self.user)
        # Activity1 starts as not done
        self.assertFalse(self.activity1.is_done)
        
        # Toggle to done
        response = self.client.patch(f'/api/v1/activities/{self.activity1.id}/toggle_done/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_done'])
        
        # Toggle back to not done
        response = self.client.patch(f'/api/v1/activities/{self.activity1.id}/toggle_done/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_done'])

    def test_activity_stats(self):
        """Test activity statistics endpoint."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/activities/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('by_type', response.data)
        self.assertIn('completed', response.data)
        self.assertIn('pending', response.data)
        self.assertIn('overdue', response.data)
        self.assertEqual(response.data['total'], 2)
        self.assertEqual(response.data['completed'], 1)
        self.assertEqual(response.data['pending'], 1)

    def test_activity_upcoming(self):
        """Test upcoming activities endpoint."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/activities/upcoming/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        # Should only return activity1 which is in the future
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], str(self.activity1.id))

    def test_activity_overdue(self):
        """Test overdue activities endpoint."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/activities/overdue/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

