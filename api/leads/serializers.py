from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    """
    Serializer for Lead model with validation.
    """
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    contact_name = serializers.CharField(source='contact.full_name', read_only=True)
    owner_name = serializers.CharField(source='owner.email', read_only=True)
    activities_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Lead
        fields = [
            'id',
            'organization',
            'organization_name',
            'contact',
            'contact_name',
            'owner',
            'owner_name',
            'title',
            'value',
            'priority',
            'stage',
            'source',
            'notes',
            'activities_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'organization_name',
            'contact_name',
            'owner_name',
            'activities_count',
            'created_at',
            'updated_at',
        ]
    
    def get_activities_count(self, obj):
        """Return the number of activities for this lead."""
        return obj.activities.count()
    
    def validate_value(self, value):
        """Ensure value is non-negative."""
        if value < 0:
            raise serializers.ValidationError("Value must be non-negative.")
        return value
    
    def validate(self, data):
        """Cross-field validation."""
        # Note: Removed strict stage transition validation to allow flexible lead management
        # Users can move leads between any stages as needed
        return data
