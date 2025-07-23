import uuid
from django.db import models
from django.core.validators import EmailValidator, URLValidator


class Organization(models.Model):
    """
    Organization model representing companies/clients in the CRM.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('prospect', 'Prospect'),
        ('inactive', 'Inactive'),
    ]
    
    TYPE_CHOICES = [
        ('Enterprise', 'Enterprise'),
        ('Mid-Market', 'Mid-Market'),
        ('SMB', 'SMB'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, db_index=True)
    industry = models.CharField(max_length=100, blank=True)
    website = models.URLField(max_length=200, blank=True, validators=[URLValidator()])
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(validators=[EmailValidator()], db_index=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name', 'email']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return self.name
