import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings


class Activity(models.Model):
    """
    Activity model representing tasks, calls, meetings, and notes in the CRM.
    """
    TYPE_CHOICES = [
        ('call', 'Call'),
        ('email', 'Email'),
        ('meeting', 'Meeting'),
        ('task', 'Task'),
        ('note', 'Note'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(
        'leads.Lead',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='activities',
        db_index=True
    )
    contact = models.ForeignKey(
        'contacts.Contact',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities',
        db_index=True
    )
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities',
        db_index=True
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_activities',
        db_index=True
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField(blank=True)
    is_done = models.BooleanField(default=False, db_index=True)
    schedule_from = models.DateTimeField(null=True, blank=True, db_index=True)
    schedule_to = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-schedule_from']
        verbose_name_plural = 'Activities'
        indexes = [
            models.Index(fields=['type', 'is_done']),
            models.Index(fields=['lead', 'created_at']),
            models.Index(fields=['organization', 'created_at']),
            models.Index(fields=['contact', 'created_at']),
            models.Index(fields=['schedule_from', 'schedule_to']),
            models.Index(fields=['is_done', 'schedule_from']),
        ]
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.title or 'Untitled'}"
    
    def clean(self):
        """Validate that schedule_from is before schedule_to."""
        if self.schedule_from and self.schedule_to:
            if self.schedule_from > self.schedule_to:
                raise ValidationError({
                    'schedule_to': 'End date must be after start date.'
                })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def lead_title(self):
        return self.lead.title if self.lead else None
    
    @property
    def contact_name(self):
        return self.contact.full_name if self.contact else None
    
    @property
    def organization_name(self):
        return self.organization.name if self.organization else None
    
    @property
    def created_by_email(self):
        return self.created_by.email if self.created_by else None
