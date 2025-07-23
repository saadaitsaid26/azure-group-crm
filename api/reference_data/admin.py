"""
Admin interface for reference data models.
"""

from django.contrib import admin
from .models import PipelineStage, LeadSource, ActivityType, ContactType


@admin.register(PipelineStage)
class PipelineStageAdmin(admin.ModelAdmin):
    """Admin interface for PipelineStage model."""

    list_display = ["name", "sort_order", "is_active", "color", "created_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["name", "description"]
    ordering = ["sort_order", "name"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(LeadSource)
class LeadSourceAdmin(admin.ModelAdmin):
    """Admin interface for LeadSource model."""

    list_display = ["name", "is_active", "created_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["name", "description"]
    ordering = ["name"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    """Admin interface for ActivityType model."""

    list_display = ["name", "icon", "is_active", "created_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["name", "description"]
    ordering = ["name"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(ContactType)
class ContactTypeAdmin(admin.ModelAdmin):
    """Admin interface for ContactType model."""

    list_display = ["name", "is_active", "created_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["name", "description"]
    ordering = ["name"]
    readonly_fields = ["id", "created_at", "updated_at"]
