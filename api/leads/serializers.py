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
        # Ensure stage transitions make sense
        if self.instance:
            old_stage = self.instance.stage
            new_stage = data.get('stage', old_stage)
            
            # Prevent moving from won/lost back to active stages
            if old_stage in ['won', 'lost'] and new_stage not in ['won', 'lost']:
                raise serializers.ValidationError({
                    'stage': 'Cannot reopen a won or lost lead. Create a new lead instead.'
                })
        
        return data
