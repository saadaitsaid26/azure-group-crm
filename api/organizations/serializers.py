from rest_framework import serializers
from .models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    """
    Serializer for Organization model with validation.
    """
    contacts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = [
            'id',
            'name',
            'industry',
            'website',
            'phone',
            'email',
            'address',
            'notes',
            'status',
            'type',
            'metadata',
            'contacts_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'contacts_count']
    
    def get_contacts_count(self, obj):
        """Return the number of contacts for this organization."""
        return obj.contacts.count()
    
    def validate_email(self, value):
        """Validate email is unique for active organizations."""
        if value:
            # Check for duplicate email in active organizations
            queryset = Organization.objects.filter(email=value, status='active')
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("An active organization with this email already exists.")
        return value
    
    def validate_website(self, value):
        """Ensure website has proper protocol."""
        if value and not value.startswith(('http://', 'https://')):
            return f'https://{value}'
        return value
