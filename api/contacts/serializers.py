from rest_framework import serializers
from .models import Contact


class ContactSerializer(serializers.ModelSerializer):
    """
    Serializer for Contact model with validation.
    """
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Contact
        fields = [
            'id',
            'organization',
            'organization_name',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'role',
            'status',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'full_name', 'organization_name', 'created_at', 'updated_at']
    
    def validate_email(self, value):
        """Validate email is unique for active contacts."""
        if value:
            # Check for duplicate email in active contacts
            queryset = Contact.objects.filter(email=value, status='active')
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("An active contact with this email already exists.")
        return value
    
    def validate(self, data):
        """Cross-field validation."""
        # Ensure at least email or phone is provided
        if not data.get('email') and not data.get('phone'):
            raise serializers.ValidationError("At least one of email or phone must be provided.")
        return data
