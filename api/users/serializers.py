"""
Serializers for user authentication and management.
"""

from rest_framework import serializers
from django.contrib.auth.models import Group
from .models import User


class GroupBasicSerializer(serializers.ModelSerializer):
    """Basic serializer for Group model (for nested representation)."""
    
    class Meta:
        model = Group
        fields = ['id', 'name']
        read_only_fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    groups = GroupBasicSerializer(many=True, read_only=True)
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Group.objects.all(),
        source='groups',
        required=False
    )

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "role", 
            "is_active", "groups", "group_ids", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
    
    def update(self, instance, validated_data):
        """Update user with groups."""
        groups = validated_data.pop('groups', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update groups if provided
        if groups is not None:
            instance.groups.set(groups)
        
        return instance


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users."""

    password = serializers.CharField(write_only=True, min_length=8)
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Group.objects.all(),
        source='groups',
        required=False
    )

    class Meta:
        model = User
        fields = ["id", "email", "password", "first_name", "last_name", "role", "group_ids"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        """Create user with encrypted password and groups."""
        password = validated_data.pop("password")
        groups = validated_data.pop("groups", [])
        user = User.objects.create_user(password=password, **validated_data)
        if groups:
            user.groups.set(groups)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
