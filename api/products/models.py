import uuid
from django.db import models


class Product(models.Model):
    """
    Product model for the catalog.
    Stores product information including pricing and inventory status.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=100, blank=True, default='', db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'category']),
            models.Index(fields=['name', 'sku']),
        ]
    
    def __str__(self):
        return f"{self.sku} - {self.name}"
    
    def save(self, *args, **kwargs):
        # Normalize SKU to uppercase
        if self.sku:
            self.sku = self.sku.strip().upper()
        super().save(*args, **kwargs)
