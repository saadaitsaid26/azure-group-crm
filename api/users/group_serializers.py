"""
Serializers for Django Groups and Permissions.
"""

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer for Django Permission model."""
    
    content_type_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type', 'content_type_name']
        read_only_fields = ['id', 'name', 'codename', 'content_type']
    
    def get_content_type_name(self, obj):
        """Get human-readable content type name."""
        return f"{obj.content_type.app_label}.{obj.content_type.model}"


class GroupSerializer(serializers.ModelSerializer):
    """Serializer for Django Group model."""
    
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Permission.objects.all(),
        source='permissions',
        required=False
    )
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permission_ids', 'user_count']
    
    def get_user_count(self, obj):
        """Get count of users in this group."""
        return obj.user_set.count()
    
    def create(self, validated_data):
        """Create group with permissions."""
        permissions = validated_data.pop('permissions', [])
        group = Group.objects.create(**validated_data)
        if permissions:
            group.permissions.set(permissions)
        return group
    
    def update(self, instance, validated_data):
        """Update group with permissions."""
        permissions = validated_data.pop('permissions', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update permissions if provided
        if permissions is not None:
            instance.permissions.set(permissions)
        
        return instance


class GroupListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing groups."""
    
    user_count = serializers.SerializerMethodField()
    permission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'user_count', 'permission_count']
    
    def get_user_count(self, obj):
        """Get count of users in this group."""
        return obj.user_set.count()
    
    def get_permission_count(self, obj):
        """Get count of permissions in this group."""
        return obj.permissions.count()


class ContentTypeSerializer(serializers.ModelSerializer):
    """Serializer for ContentType model."""
    
    class Meta:
        model = ContentType
        fields = ['id', 'app_label', 'model']
        read_only_fields = ['id', 'app_label', 'model']
