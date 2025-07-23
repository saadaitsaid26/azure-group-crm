from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Product
from decimal import Decimal

User = get_user_model()


class ProductTests(APITestCase):
    """
    Test suite for Product API endpoints.
    """
    
    def setUp(self):
        """Set up test user and authenticate."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test products
        self.product1 = Product.objects.create(
            sku='PROD-001',
            name='Product 1',
            description='Test product 1',
            category='Electronics',
            price=Decimal('99.99'),
            cost=Decimal('50.00'),
            status='active'
        )
        self.product2 = Product.objects.create(
            sku='PROD-002',
            name='Product 2',
            description='Test product 2',
            category='Software',
            price=Decimal('199.99'),
            cost=Decimal('100.00'),
            status='active'
        )
    
    def test_unauthorized_access(self):
        """Test that unauthorized access returns 401."""
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/v1/products/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_products_empty(self):
        """Test listing products when none exist."""
        Product.objects.all().delete()
        response = self.client.get('/api/v1/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)
    
    def test_list_products_with_data(self):
        """Test listing products with data."""
        response = self.client.get('/api/v1/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_create_product_full_data(self):
        """Test creating a product with full data."""
        data = {
            'sku': 'PROD-003',
            'name': 'Product 3',
            'description': 'Test product 3',
            'category': 'Hardware',
            'price': '149.99',
            'cost': '75.00',
            'status': 'active',
            'metadata': {'key': 'value'}
        }
        response = self.client.post('/api/v1/products/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['sku'], 'PROD-003')
        self.assertEqual(response.data['name'], 'Product 3')
        self.assertEqual(Decimal(response.data['price']), Decimal('149.99'))
    
    def test_create_product_minimal_data(self):
        """Test creating a product with minimal required data."""
        data = {
            'sku': 'PROD-004',
            'name': 'Product 4',
            'price': '49.99'
        }
        response = self.client.post('/api/v1/products/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['sku'], 'PROD-004')
        self.assertEqual(response.data['status'], 'active')  # default
    
    def test_create_product_duplicate_sku(self):
        """Test that duplicate SKU is rejected."""
        data = {
            'sku': 'PROD-001',  # Duplicate
            'name': 'Product Duplicate',
            'price': '99.99'
        }
        response = self.client.post('/api/v1/products/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('sku', response.data)
    
    def test_create_product_negative_price(self):
        """Test that negative price is rejected."""
        data = {
            'sku': 'PROD-005',
            'name': 'Product 5',
            'price': '-10.00'
        }
        response = self.client.post('/api/v1/products/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_filter_by_status(self):
        """Test filtering products by status."""
        Product.objects.create(
            sku='PROD-INACTIVE',
            name='Inactive Product',
            price=Decimal('10.00'),
            status='inactive'
        )
        response = self.client.get('/api/v1/products/?status=inactive')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'inactive')
    
    def test_filter_by_category(self):
        """Test filtering products by category."""
        response = self.client.get('/api/v1/products/?category=Electronics')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['category'], 'Electronics')
    
    def test_search_products(self):
        """Test searching products."""
        response = self.client.get('/api/v1/products/?q=Product+1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)
    
    def test_retrieve_product(self):
        """Test retrieving a single product."""
        response = self.client.get(f'/api/v1/products/{self.product1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['sku'], 'PROD-001')
    
    def test_update_product(self):
        """Test updating a product."""
        data = {
            'price': '109.99',
            'name': 'Updated Product 1'
        }
        response = self.client.patch(f'/api/v1/products/{self.product1.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(response.data['price']), Decimal('109.99'))
        self.assertEqual(response.data['name'], 'Updated Product 1')
    
    def test_delete_product(self):
        """Test deleting a product."""
        response = self.client.delete(f'/api/v1/products/{self.product1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=self.product1.id).exists())
    
    def test_product_stats(self):
        """Test product stats endpoint."""
        response = self.client.get('/api/v1/products/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('active', response.data)
        self.assertIn('inactive', response.data)
        self.assertIn('by_category', response.data)
        self.assertEqual(response.data['total'], 2)
        self.assertEqual(response.data['active'], 2)

