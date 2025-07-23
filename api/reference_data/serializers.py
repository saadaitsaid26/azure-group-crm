"""
Serializers for reference data models.
"""

from rest_framework import serializers
from .models import PipelineStage, LeadSource, ActivityType, ContactType


class PipelineStageSerializer(serializers.ModelSerializer):
    """Serializer for PipelineStage model."""

    class Meta:
        model = PipelineStage
        fields = [
            "id",
            "name",
            "description",
            "sort_order",
            "is_active",
            "color",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LeadSourceSerializer(serializers.ModelSerializer):
    """Serializer for LeadSource model."""

    class Meta:
        model = LeadSource
        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ActivityTypeSerializer(serializers.ModelSerializer):
    """Serializer for ActivityType model."""

    class Meta:
        model = ActivityType
        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "icon",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ContactTypeSerializer(serializers.ModelSerializer):
    """Serializer for ContactType model."""

    class Meta:
        model = ContactType
        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
