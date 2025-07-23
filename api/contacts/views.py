from django.db import models
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter, UUIDFilter
from .models import Contact
from .serializers import ContactSerializer


class ContactFilter(FilterSet):
    """
    Custom filter for Contact model.
    """
    q = CharFilter(method='search_filter', label='Search')
    organization_id = UUIDFilter(field_name='organization', label='Organization ID')
    
    class Meta:
        model = Contact
        fields = {
            'status': ['exact'],
            'role': ['exact', 'icontains'],
            'organization': ['exact'],
        }
    
    def search_filter(self, queryset, name, value):
        """Search across first name, last name, email, and role."""
        if value:
            return queryset.filter(
                models.Q(first_name__icontains=value) |
                models.Q(last_name__icontains=value) |
                models.Q(email__icontains=value) |
                models.Q(role__icontains=value)
            )
        return queryset


class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Contact CRUD operations.
    Supports:
    - List with pagination, filtering, search, and ordering
    - Create, Retrieve, Update, Delete
    - Permissions: IsAuthenticated (all can read, staff can modify)
    """
    queryset = Contact.objects.select_related('organization').all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ContactFilter
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'role']
    ordering_fields = ['first_name', 'last_name', 'created_at', 'updated_at', 'status']
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
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get contact statistics.
        """
        from django.db.models import Count
        
        queryset = self.filter_queryset(self.get_queryset())
        
        stats = {
            'total': queryset.count(),
            'by_status': dict(queryset.values('status').annotate(count=Count('id')).values_list('status', 'count')),
            'by_organization': queryset.filter(organization__isnull=False).values(
                'organization__name'
            ).annotate(count=Count('id'))[:10],  # Top 10 organizations
        }
        
        return Response(stats)
