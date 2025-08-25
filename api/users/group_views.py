"""
Views for Django Groups and Permissions management.
"""

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from users.permissions import IsAdminUser
from .group_serializers import (
    GroupSerializer,
    GroupListSerializer,
    PermissionSerializer,
    ContentTypeSerializer,
)


class GroupFilter(filters.FilterSet):
    """Filter for Group model."""
    
    q = filters.CharFilter(method='filter_search')
    
    class Meta:
        model = Group
        fields = ['q']
    
    def filter_search(self, queryset, name, value):
        """Search by group name."""
        return queryset.filter(name__icontains=value)


class GroupViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Django Groups (Admin only)."""
    
    queryset = Group.objects.all().prefetch_related('permissions', 'user_set')
    permission_classes = [IsAdminUser]
    filterset_class = GroupFilter
    ordering_fields = ['name']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Use list serializer for list action, detail for others."""
        if self.action == 'list':
            return GroupListSerializer
        return GroupSerializer
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get group statistics."""
        queryset = self.filter_queryset(self.get_queryset())
        
        total = queryset.count()
        
        # Groups with users
        groups_with_users = sum(1 for group in queryset if group.user_set.exists())
        
        # Groups without users
        empty_groups = total - groups_with_users
        
        # Total users in groups
        total_users_in_groups = sum(group.user_set.count() for group in queryset)
        
        return Response({
            'total': total,
            'with_users': groups_with_users,
            'empty': empty_groups,
            'total_users': total_users_in_groups,
        })
    
    @action(detail=True, methods=['post'])
    def add_user(self, request, pk=None):
        """Add a user to this group."""
        from users.models import User
        
        group = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
            group.user_set.add(user)
            return Response({'message': f'User {user.email} added to group {group.name}'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_user(self, request, pk=None):
        """Remove a user from this group."""
        from users.models import User
        
        group = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
            group.user_set.remove(user)
            return Response({'message': f'User {user.email} removed from group {group.name}'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """Get all users in this group."""
        from users.serializers import UserSerializer
        
        group = self.get_object()
        users = group.user_set.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing available permissions (Admin only, read-only)."""
    
    queryset = Permission.objects.all().select_related('content_type')
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['content_type']
    search_fields = ['name', 'codename']
    ordering_fields = ['name', 'codename']
    ordering = ['content_type__app_label', 'codename']
    
    @action(detail=False, methods=['get'])
    def by_content_type(self, request):
        """Get permissions grouped by content type."""
        from django.db.models import Prefetch
        
        content_types = ContentType.objects.all().prefetch_related(
            Prefetch('permission_set', queryset=Permission.objects.all())
        )
        
        result = []
        for ct in content_types:
            permissions = PermissionSerializer(ct.permission_set.all(), many=True).data
            if permissions:  # Only include content types with permissions
                result.append({
                    'content_type': ContentTypeSerializer(ct).data,
                    'permissions': permissions
                })
        
        return Response(result)
