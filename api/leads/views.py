from django.db import models
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter, UUIDFilter
from .models import Lead
from .serializers import LeadSerializer


class LeadFilter(FilterSet):
    """
    Custom filter for Lead model.
    """
    q = CharFilter(method='search_filter', label='Search')
    organization_id = UUIDFilter(field_name='organization', label='Organization ID')
    contact_id = UUIDFilter(field_name='contact', label='Contact ID')
    owner_id = UUIDFilter(field_name='owner', label='Owner ID')
    
    class Meta:
        model = Lead
        fields = {
            'stage': ['exact'],
            'priority': ['exact'],
            'source': ['exact', 'icontains'],
            'organization': ['exact'],
            'contact': ['exact'],
            'owner': ['exact'],
        }
    
    def search_filter(self, queryset, name, value):
        """Search across title, notes, and source."""
        if value:
            return queryset.filter(
                models.Q(title__icontains=value) |
                models.Q(notes__icontains=value) |
                models.Q(source__icontains=value)
            )
        return queryset


class LeadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Lead CRUD operations.
    Supports:
    - List with pagination, filtering, search, and ordering
    - Create, Retrieve, Update, Delete
    - Permissions: IsAuthenticated
    """
    queryset = Lead.objects.select_related('organization', 'contact', 'owner').all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = LeadFilter
    search_fields = ['title', 'notes', 'source']
    ordering_fields = ['title', 'value', 'priority', 'stage', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """All authenticated users can perform CRUD operations."""
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Set the owner to the current user if not specified."""
        if not serializer.validated_data.get('owner'):
            serializer.save(owner=self.request.user)
        else:
            serializer.save()
    
    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Get all activities for this lead."""
        lead = self.get_object()
        activities = lead.activities.all()
        
        from activities.serializers import ActivitySerializer
        serializer = ActivitySerializer(activities, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get lead statistics."""
        from django.db.models import Count, Sum, Avg
        
        queryset = self.filter_queryset(self.get_queryset())
        
        stats = {
            'total': queryset.count(),
            'by_stage': dict(queryset.values('stage').annotate(count=Count('id')).values_list('stage', 'count')),
            'by_priority': dict(queryset.values('priority').annotate(count=Count('id')).values_list('priority', 'count')),
            'total_value': float(queryset.aggregate(Sum('value'))['value__sum'] or 0),
            'average_value': float(queryset.aggregate(Avg('value'))['value__avg'] or 0),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def pipeline(self, request):
        """Get pipeline view grouped by stage with value totals."""
        from django.db.models import Sum, Count
        
        queryset = self.filter_queryset(self.get_queryset())
        
        pipeline = queryset.values('stage').annotate(
            count=Count('id'),
            total_value=Sum('value')
        ).order_by('stage')
        
        # Convert to list and format
        pipeline_data = []
        for item in pipeline:
            pipeline_data.append({
                'stage': item['stage'],
                'count': item['count'],
                'total_value': float(item['total_value'] or 0),
            })
        
        return Response(pipeline_data)
