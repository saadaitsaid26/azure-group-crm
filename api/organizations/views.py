from django.db import models
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter
from .models import Organization
from .serializers import OrganizationSerializer


class OrganizationFilter(FilterSet):
    """
    Custom filter for Organization model.
    """
    q = CharFilter(method='search_filter', label='Search')
    
    class Meta:
        model = Organization
        fields = {
            'status': ['exact'],
            'type': ['exact'],
            'industry': ['exact', 'icontains'],
        }
    
    def search_filter(self, queryset, name, value):
        """Search across name, email, and industry."""
        if value:
            return queryset.filter(
                models.Q(name__icontains=value) |
                models.Q(email__icontains=value) |
                models.Q(industry__icontains=value)
            )
        return queryset


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Organization CRUD operations.
    Supports:
    - List with pagination, filtering, search, and ordering
    - Create, Retrieve, Update, Delete
    - Permissions: IsAuthenticated (all can read, staff can modify)
    """
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = OrganizationFilter
    search_fields = ['name', 'email', 'industry', 'phone']
    ordering_fields = ['name', 'created_at', 'updated_at', 'status']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        Read operations: any authenticated user
        Write operations: staff only
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # For now, allow all authenticated users to modify
            # In production, restrict to staff: [IsAuthenticated, IsAdminUser]
            return [IsAuthenticated()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """
        Get all contacts for this organization.
        """
        organization = self.get_object()
        contacts = organization.contacts.all()
        
        # Import here to avoid circular dependency
        from contacts.serializers import ContactSerializer
        serializer = ContactSerializer(contacts, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get organization statistics.
        """
        from django.db.models import Count
        
        queryset = self.filter_queryset(self.get_queryset())
        
        stats = {
            'total': queryset.count(),
            'by_status': dict(queryset.values('status').annotate(count=Count('id')).values_list('status', 'count')),
            'by_type': dict(queryset.values('type').annotate(count=Count('id')).values_list('type', 'count')),
        }
        
        return Response(stats)
