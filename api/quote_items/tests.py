from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Quote, QuoteItem
from products.models import Product
from organizations.models import Organization
from contacts.models import Contact
from decimal import Decimal
from datetime import date, timedelta

User = get_user_model()


class QuoteTests(APITestCase):
    """
    Test suite for Quote and QuoteItem API endpoints.
    """
    
    def setUp(self):
        """Set up test user, products, and organization."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test organization
        self.org = Organization.objects.create(
            name='Test Organization',
            email='org@test.com',
            status='active'
        )
        
        # Create test contact
        self.contact = Contact.objects.create(
            first_name='John',
            last_name='Doe',
            email='john@test.com',
            organization=self.org,
            status='active'
        )
        
        # Create test products
        self.product1 = Product.objects.create(
            sku='PROD-001',
            name='Product 1',
            price=Decimal('100.00'),
            cost=Decimal('50.00'),
            status='active'
        )
        self.product2 = Product.objects.create(
            sku='PROD-002',
            name='Product 2',
            price=Decimal('200.00'),
            cost=Decimal('100.00'),
            status='active'
        )
    
    def test_unauthorized_access(self):
        """Test that unauthorized access returns 401."""
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/v1/quotes/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_quotes_empty(self):
        """Test listing quotes when none exist."""
        response = self.client.get('/api/v1/quotes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)
    
    def test_create_quote_with_items(self):
        """Test creating a quote with nested items."""
        data = {
            'quote_number': 'QT-001',
            'organization': str(self.org.id),
            'contact': str(self.contact.id),
            'status': 'draft',
            'tax_rate': '10.00',
            'discount_amount': '0.00',
            'subtotal': '300.00',
            'tax_amount': '30.00',
            'total': '330.00',
            'expiry_date': (date.today() + timedelta(days=30)).isoformat(),
            'items': [
                {
                    'product': str(self.product1.id),
                    'quantity': '1.00',
                    'unit_price': '100.00',
                    'sort_order': 0
                },
                {
                    'product': str(self.product2.id),
                    'quantity': '1.00',
                    'unit_price': '200.00',
                    'sort_order': 1
                }
            ]
        }
        response = self.client.post('/api/v1/quotes/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quote_number'], 'QT-001')
        self.assertEqual(len(response.data['items']), 2)
        self.assertEqual(Decimal(response.data['total']), Decimal('330.00'))
    
    def test_create_quote_minimal(self):
        """Test creating a quote with minimal data (no items)."""
        data = {
            'quote_number': 'QT-002',
            'organization': str(self.org.id),
            'status': 'draft',
            'subtotal': '0.00',
            'tax_rate': '0.00',
            'tax_amount': '0.00',
            'discount_amount': '0.00',
            'total': '0.00'
        }
        response = self.client.post('/api/v1/quotes/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quote_number'], 'QT-002')
    
    def test_create_quote_duplicate_number(self):
        """Test that duplicate quote number is rejected."""
        Quote.objects.create(
            quote_number='QT-DUP',
            organization=self.org,
            created_by=self.user,
            subtotal=Decimal('0'),
            tax_amount=Decimal('0'),
            total=Decimal('0')
        )
        data = {
            'quote_number': 'QT-DUP',
            'organization': str(self.org.id),
            'status': 'draft',
            'subtotal': '0.00',
            'tax_amount': '0.00',
            'total': '0.00'
        }
        response = self.client.post('/api/v1/quotes/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quote_number', response.data)
    
    def test_create_quote_invalid_subtotal(self):
        """Test that mismatched subtotal is rejected."""
        data = {
            'quote_number': 'QT-003',
            'organization': str(self.org.id),
            'status': 'draft',
            'tax_rate': '10.00',
            'discount_amount': '0.00',
            'subtotal': '500.00',  # Wrong - should be 300.00
            'tax_amount': '30.00',
            'total': '330.00',
            'items': [
                {
                    'product': str(self.product1.id),
                    'quantity': '1.00',
                    'unit_price': '100.00',
                    'sort_order': 0
                },
                {
                    'product': str(self.product2.id),
                    'quantity': '1.00',
                    'unit_price': '200.00',
                    'sort_order': 1
                }
            ]
        }
        response = self.client.post('/api/v1/quotes/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('subtotal', response.data)
    
    def test_create_quote_invalid_tax(self):
        """Test that mismatched tax amount is rejected."""
        data = {
            'quote_number': 'QT-004',
            'organization': str(self.org.id),
            'status': 'draft',
            'tax_rate': '10.00',
            'discount_amount': '0.00',
            'subtotal': '300.00',
            'tax_amount': '50.00',  # Wrong - should be 30.00
            'total': '350.00',
            'items': [
                {
                    'product': str(self.product1.id),
                    'quantity': '1.00',
                    'unit_price': '100.00',
                    'sort_order': 0
                },
                {
                    'product': str(self.product2.id),
                    'quantity': '1.00',
                    'unit_price': '200.00',
                    'sort_order': 1
                }
            ]
        }
        response = self.client.post('/api/v1/quotes/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('tax_amount', response.data)
    
    def test_create_quote_invalid_total(self):
        """Test that mismatched total is rejected."""
        data = {
            'quote_number': 'QT-005',
            'organization': str(self.org.id),
            'status': 'draft',
            'tax_rate': '10.00',
            'discount_amount': '0.00',
            'subtotal': '300.00',
            'tax_amount': '30.00',
            'total': '500.00',  # Wrong - should be 330.00
            'items': [
                {
                    'product': str(self.product1.id),
                    'quantity': '1.00',
                    'unit_price': '100.00',
                    'sort_order': 0
                },
                {
                    'product': str(self.product2.id),
                    'quantity': '1.00',
                    'unit_price': '200.00',
                    'sort_order': 1
                }
            ]
        }
        response = self.client.post('/api/v1/quotes/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('total', response.data)
    
    def test_create_quote_with_discount(self):
        """Test creating a quote with discount."""
        data = {
            'quote_number': 'QT-006',
            'organization': str(self.org.id),
            'status': 'draft',
            'tax_rate': '10.00',
            'discount_amount': '50.00',
            'subtotal': '300.00',
            'tax_amount': '30.00',
            'total': '280.00',  # 300 + 30 - 50
            'items': [
                {
                    'product': str(self.product1.id),
                    'quantity': '3.00',
                    'unit_price': '100.00',
                    'sort_order': 0
                }
            ]
        }
        response = self.client.post('/api/v1/quotes/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['discount_amount']), Decimal('50.00'))
        self.assertEqual(Decimal(response.data['total']), Decimal('280.00'))
    
    def test_retrieve_quote(self):
        """Test retrieving a quote with items."""
        quote = Quote.objects.create(
            quote_number='QT-RETRIEVE',
            organization=self.org,
            created_by=self.user,
            subtotal=Decimal('100.00'),
            tax_amount=Decimal('10.00'),
            total=Decimal('110.00')
        )
        QuoteItem.objects.create(
            quote=quote,
            product=self.product1,
            quantity=Decimal('1.00'),
            unit_price=Decimal('100.00')
        )
        
        response = self.client.get(f'/api/v1/quotes/{quote.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['quote_number'], 'QT-RETRIEVE')
        self.assertEqual(len(response.data['items']), 1)
    
    def test_update_quote(self):
        """Test updating a quote."""
        quote = Quote.objects.create(
            quote_number='QT-UPDATE',
            organization=self.org,
            created_by=self.user,
            status='draft',
            subtotal=Decimal('0'),
            tax_amount=Decimal('0'),
            total=Decimal('0')
        )
        
        data = {
            'status': 'sent'
        }
        response = self.client.patch(f'/api/v1/quotes/{quote.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'sent')
    
    def test_delete_quote(self):
        """Test deleting a quote."""
        quote = Quote.objects.create(
            quote_number='QT-DELETE',
            organization=self.org,
            created_by=self.user,
            subtotal=Decimal('0'),
            tax_amount=Decimal('0'),
            total=Decimal('0')
        )
        
        response = self.client.delete(f'/api/v1/quotes/{quote.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Quote.objects.filter(id=quote.id).exists())
    
    def test_filter_by_status(self):
        """Test filtering quotes by status."""
        Quote.objects.create(
            quote_number='QT-SENT',
            organization=self.org,
            created_by=self.user,
            status='sent',
            subtotal=Decimal('0'),
            tax_amount=Decimal('0'),
            total=Decimal('0')
        )
        Quote.objects.create(
            quote_number='QT-DRAFT',
            organization=self.org,
            created_by=self.user,
            status='draft',
            subtotal=Decimal('0'),
            tax_amount=Decimal('0'),
            total=Decimal('0')
        )
        
        response = self.client.get('/api/v1/quotes/?status=sent')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'sent')
    
    def test_filter_by_organization(self):
        """Test filtering quotes by organization."""
        org2 = Organization.objects.create(
            name='Org 2',
            email='org2@test.com',
            status='active'
        )
        Quote.objects.create(
            quote_number='QT-ORG1',
            organization=self.org,
            created_by=self.user,
            subtotal=Decimal('0'),
            tax_amount=Decimal('0'),
            total=Decimal('0')
        )
        Quote.objects.create(
            quote_number='QT-ORG2',
            organization=org2,
            created_by=self.user,
            subtotal=Decimal('0'),
            tax_amount=Decimal('0'),
            total=Decimal('0')
        )
        
        response = self.client.get(f'/api/v1/quotes/?organization={self.org.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_search_quotes(self):
        """Test searching quotes."""
        Quote.objects.create(
            quote_number='QT-SEARCH-ME',
            organization=self.org,
            created_by=self.user,
            subtotal=Decimal('0'),
            tax_amount=Decimal('0'),
            total=Decimal('0')
        )
        
        response = self.client.get('/api/v1/quotes/?q=SEARCH')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)
    
    def test_quote_stats(self):
        """Test quote stats endpoint."""
        Quote.objects.create(
            quote_number='QT-STATS-1',
            organization=self.org,
            created_by=self.user,
            status='draft',
            subtotal=Decimal('100.00'),
            tax_amount=Decimal('10.00'),
            total=Decimal('110.00')
        )
        Quote.objects.create(
            quote_number='QT-STATS-2',
            organization=self.org,
            created_by=self.user,
            status='sent',
            subtotal=Decimal('200.00'),
            tax_amount=Decimal('20.00'),
            total=Decimal('220.00')
        )
        
        response = self.client.get('/api/v1/quotes/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('by_status', response.data)
        self.assertIn('total_value', response.data)
        self.assertIn('average_value', response.data)
        self.assertEqual(response.data['total'], 2)
    
    def test_quote_item_line_total_calculation(self):
        """Test that quote item line total is calculated correctly."""
        quote = Quote.objects.create(
            quote_number='QT-LINE-TOTAL',
            organization=self.org,
            created_by=self.user,
            subtotal=Decimal('250.00'),
            tax_amount=Decimal('0'),
            total=Decimal('250.00')
        )
        
        item = QuoteItem.objects.create(
            quote=quote,
            product=self.product1,
            quantity=Decimal('2.50'),
            unit_price=Decimal('100.00')
        )
        
        self.assertEqual(item.line_total, Decimal('250.00'))
