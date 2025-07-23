from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.db import models
from .models import Quote, QuoteItem
from .serializers import QuoteSerializer, QuoteListSerializer, QuoteItemSerializer
from .filters import QuoteFilter


class QuoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Quote CRUD operations with nested items.
    """
    queryset = Quote.objects.select_related(
        'organization', 'contact', 'lead', 'created_by'
    ).prefetch_related('items', 'items__product')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = QuoteFilter
    ordering_fields = ['quote_number', 'created_at', 'total', 'status', 'expiry_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == 'list':
            return QuoteListSerializer
        return QuoteSerializer
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get quote statistics.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        total_count = queryset.count()
        
        # By status
        by_status = {}
        for choice_value, choice_label in Quote.STATUS_CHOICES:
            count = queryset.filter(status=choice_value).count()
            by_status[choice_value] = count
        
        # Total values
        total_value = queryset.aggregate(
            total=models.Sum('total')
        )['total'] or 0
        
        # Average quote value
        avg_value = queryset.aggregate(
            avg=models.Avg('total')
        )['avg'] or 0
        
        return Response({
            'total': total_count,
            'by_status': by_status,
            'total_value': float(total_value),
            'average_value': float(avg_value)
        })
    
    @action(detail=True, methods=['get'])
    def items_list(self, request, pk=None):
        """
        Get all items for a specific quote.
        """
        quote = self.get_object()
        items = quote.items.all()
        serializer = QuoteItemSerializer(items, many=True)
        return Response(serializer.data)


class QuoteItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for QuoteItem CRUD operations.
    """
    queryset = QuoteItem.objects.select_related('quote', 'product')
    serializer_class = QuoteItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['quote', 'product']
    ordering_fields = ['sort_order', 'created_at']
    ordering = ['sort_order', 'created_at']
