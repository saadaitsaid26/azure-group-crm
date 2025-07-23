from django.db import models
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter, UUIDFilter, DateTimeFilter, BooleanFilter
from .models import Activity
from .serializers import ActivitySerializer


class ActivityFilter(FilterSet):
    """
    Custom filter for Activity model.
    """
    q = CharFilter(method='search_filter', label='Search')
    lead_id = UUIDFilter(field_name='lead', label='Lead ID')
    contact_id = UUIDFilter(field_name='contact', label='Contact ID')
    organization_id = UUIDFilter(field_name='organization', label='Organization ID')
    created_by_id = UUIDFilter(field_name='created_by', label='Created By ID')
    schedule_from_after = DateTimeFilter(field_name='schedule_from', lookup_expr='gte')
    schedule_from_before = DateTimeFilter(field_name='schedule_from', lookup_expr='lte')
    schedule_to_after = DateTimeFilter(field_name='schedule_to', lookup_expr='gte')
    schedule_to_before = DateTimeFilter(field_name='schedule_to', lookup_expr='lte')
    
    class Meta:
        model = Activity
        fields = {
            'type': ['exact'],
            'is_done': ['exact'],
            'lead': ['exact'],
            'contact': ['exact'],
            'organization': ['exact'],
            'created_by': ['exact'],
        }
    
    def search_filter(self, queryset, name, value):
        """Search across title and comment."""
        if value:
            return queryset.filter(
                models.Q(title__icontains=value) |
                models.Q(comment__icontains=value)
            )
        return queryset


class ActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Activity CRUD operations.
    Supports:
    - List with pagination, filtering, search, and ordering
    - Create, Retrieve, Update, Delete
    - Custom action to toggle is_done status
    - Permissions: IsAuthenticated
    """
    queryset = Activity.objects.select_related(
        'lead', 'contact', 'organization', 'created_by'
    ).all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ActivityFilter
    search_fields = ['title', 'comment']
    ordering_fields = ['schedule_from', 'schedule_to', 'created_at', 'is_done', 'type']
    ordering = ['-schedule_from']
    
    def get_permissions(self):
        """All authenticated users can perform CRUD operations."""
        return [IsAuthenticated()]
    
    def get_serializer_context(self):
        """Add request to serializer context."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['patch'])
    def toggle_done(self, request, pk=None):
        """Toggle the is_done status of an activity."""
        activity = self.get_object()
        activity.is_done = not activity.is_done
        activity.save()
        
        serializer = self.get_serializer(activity)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get activity statistics."""
        from django.db.models import Count
        
        queryset = self.filter_queryset(self.get_queryset())
        
        stats = {
            'total': queryset.count(),
            'by_type': dict(queryset.values('type').annotate(count=Count('id')).values_list('type', 'count')),
            'completed': queryset.filter(is_done=True).count(),
            'pending': queryset.filter(is_done=False).count(),
            'overdue': queryset.filter(
                is_done=False,
                schedule_to__lt=models.functions.Now()
            ).count(),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming activities (not done, scheduled in the future)."""
        from django.utils import timezone
        
        upcoming = self.get_queryset().filter(
            is_done=False,
            schedule_from__gte=timezone.now()
        ).order_by('schedule_from')[:10]
        
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue activities (not done, past schedule_to)."""
        from django.utils import timezone
        
        overdue = self.get_queryset().filter(
            is_done=False,
            schedule_to__lt=timezone.now()
        ).order_by('schedule_to')
        
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)
