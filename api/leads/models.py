import uuid
from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings


class Lead(models.Model):
    """
    Lead model representing potential sales opportunities in the CRM.
    """
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    STAGE_CHOICES = [
        ('new', 'New'),
        ('followUp', 'Follow Up'),
        ('prospect', 'Prospect'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='leads',
        db_index=True
    )
    contact = models.ForeignKey(
        'contacts.Contact',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='leads',
        db_index=True
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_leads',
        db_index=True
    )
    title = models.CharField(max_length=100, db_index=True)
    value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0
    )
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', db_index=True)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='new', db_index=True)
    source = models.CharField(max_length=100, blank=True, db_index=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['stage', 'priority']),
            models.Index(fields=['organization', 'created_at']),
            models.Index(fields=['owner', 'stage']),
            models.Index(fields=['-created_at', 'stage']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def organization_name(self):
        return self.organization.name if self.organization else None
    
    @property
    def contact_name(self):
        return self.contact.full_name if self.contact else None
    
    @property
    def owner_name(self):
        return self.owner.email if self.owner else None
