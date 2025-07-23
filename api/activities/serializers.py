from rest_framework import serializers
from .models import Activity
from django.utils import timezone


class ActivitySerializer(serializers.ModelSerializer):
    """
    Serializer for Activity model with validation.
    """
    lead_title = serializers.CharField(source='lead.title', read_only=True)
    contact_name = serializers.CharField(source='contact.full_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id',
            'lead',
            'lead_title',
            'contact',
            'contact_name',
            'organization',
            'organization_name',
            'created_by',
            'created_by_email',
            'type',
            'title',
            'comment',
            'is_done',
            'schedule_from',
            'schedule_to',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'lead_title',
            'contact_name',
            'organization_name',
            'created_by_email',
            'created_at',
            'updated_at',
        ]
    
    def validate(self, data):
        """Cross-field validation."""
        schedule_from = data.get('schedule_from')
        schedule_to = data.get('schedule_to')
        
        # If updating, get the current values if new ones aren't provided
        if self.instance:
            schedule_from = schedule_from or self.instance.schedule_from
            schedule_to = schedule_to or self.instance.schedule_to
        
        # Validate date range
        if schedule_from and schedule_to:
            if schedule_from > schedule_to:
                raise serializers.ValidationError({
                    'schedule_to': 'End date/time must be after start date/time.'
                })
        
        # Validate that at least one entity reference exists (only on create)
        if not self.instance:
            lead = data.get('lead')
            contact = data.get('contact')
            organization = data.get('organization')
            
            if not any([lead, contact, organization]):
                raise serializers.ValidationError({
                    'non_field_errors': ['Activity must be associated with at least one of: lead, contact, or organization.']
                })
        
        return data
    
    def create(self, validated_data):
        """Set created_by to the current user if not provided."""
        if 'created_by' not in validated_data and self.context.get('request'):
            validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
