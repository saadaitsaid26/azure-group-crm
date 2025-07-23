from django_filters import rest_framework as filters
from .models import Product


class ProductFilter(filters.FilterSet):
    """
    Filter for Product queryset with search and filtering capabilities.
    """
    q = filters.CharFilter(method='search_filter', label='Search')
    category = filters.CharFilter(field_name='category', lookup_expr='iexact')
    status = filters.ChoiceFilter(choices=Product.STATUS_CHOICES)
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    class Meta:
        model = Product
        fields = ['status', 'category', 'q', 'min_price', 'max_price']
    
    def search_filter(self, queryset, name, value):
        """
        Search across sku, name, description, and category.
        """
        return queryset.filter(
            models.Q(sku__icontains=value) |
            models.Q(name__icontains=value) |
            models.Q(description__icontains=value) |
            models.Q(category__icontains=value)
        )


from django.db import models
