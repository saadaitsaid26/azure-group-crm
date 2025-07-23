from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.db import models
from .models import Product
from .serializers import ProductSerializer
from .filters import ProductFilter


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product CRUD operations.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ProductFilter
    ordering_fields = ['name', 'sku', 'price', 'category', 'created_at']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get product statistics.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        total_count = queryset.count()
        active_count = queryset.filter(status='active').count()
        inactive_count = queryset.filter(status='inactive').count()
        
        # Category breakdown
        categories = queryset.values('category').annotate(
            count=models.Count('id')
        ).order_by('-count')
        
        return Response({
            'total': total_count,
            'active': active_count,
            'inactive': inactive_count,
            'by_category': list(categories)
        })

