"""
Views for reference data management.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from users.permissions import IsAdminUser
from .models import PipelineStage, LeadSource, ActivityType, ContactType
from .serializers import (
    PipelineStageSerializer,
    LeadSourceSerializer,
    ActivityTypeSerializer,
    ContactTypeSerializer,
)


class ReferenceDataFilter(filters.FilterSet):
    """Base filter for reference data."""

    q = filters.CharFilter(method="filter_search")
    is_active = filters.BooleanFilter()

    def filter_search(self, queryset, name, value):
        """Search across name and description."""
        from django.db.models import Q
        return queryset.filter(
            Q(name__icontains=value) | Q(description__icontains=value)
        )


class PipelineStageFilter(ReferenceDataFilter):
    """Filter for PipelineStage model."""

    class Meta:
        model = PipelineStage
        fields = ["is_active", "q"]


class LeadSourceFilter(ReferenceDataFilter):
    """Filter for LeadSource model."""

    class Meta:
        model = LeadSource
        fields = ["is_active", "q"]


class ActivityTypeFilter(ReferenceDataFilter):
    """Filter for ActivityType model."""

    class Meta:
        model = ActivityType
        fields = ["is_active", "q"]


class ContactTypeFilter(ReferenceDataFilter):
    """Filter for ContactType model."""

    class Meta:
        model = ContactType
        fields = ["is_active", "q"]


class PipelineStageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing pipeline stages (Admin only)."""

    queryset = PipelineStage.objects.all()
    serializer_class = PipelineStageSerializer
    permission_classes = [IsAdminUser]
    filterset_class = PipelineStageFilter
    ordering_fields = ["name", "sort_order", "created_at"]
    ordering = ["sort_order"]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get pipeline stage statistics."""
        queryset = self.filter_queryset(self.get_queryset())
        
        total = queryset.count()
        active_count = queryset.filter(is_active=True).count()
        inactive_count = queryset.filter(is_active=False).count()

        return Response({
            "total": total,
            "active": active_count,
            "inactive": inactive_count,
        })


class LeadSourceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing lead sources (Admin only)."""

    queryset = LeadSource.objects.all()
    serializer_class = LeadSourceSerializer
    permission_classes = [IsAdminUser]
    filterset_class = LeadSourceFilter
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get lead source statistics."""
        queryset = self.filter_queryset(self.get_queryset())
        
        total = queryset.count()
        active_count = queryset.filter(is_active=True).count()
        inactive_count = queryset.filter(is_active=False).count()

        return Response({
            "total": total,
            "active": active_count,
            "inactive": inactive_count,
        })


class ActivityTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing activity types (Admin only)."""

    queryset = ActivityType.objects.all()
    serializer_class = ActivityTypeSerializer
    permission_classes = [IsAdminUser]
    filterset_class = ActivityTypeFilter
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get activity type statistics."""
        queryset = self.filter_queryset(self.get_queryset())
        
        total = queryset.count()
        active_count = queryset.filter(is_active=True).count()
        inactive_count = queryset.filter(is_active=False).count()

        return Response({
            "total": total,
            "active": active_count,
            "inactive": inactive_count,
        })


class ContactTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing contact types (Admin only)."""

    queryset = ContactType.objects.all()
    serializer_class = ContactTypeSerializer
    permission_classes = [IsAdminUser]
    filterset_class = ContactTypeFilter
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get contact type statistics."""
        queryset = self.filter_queryset(self.get_queryset())
        
        total = queryset.count()
        active_count = queryset.filter(is_active=True).count()
        inactive_count = queryset.filter(is_active=False).count()

        return Response({
            "total": total,
            "active": active_count,
            "inactive": inactive_count,
        })
