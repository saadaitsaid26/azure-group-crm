from django_filters import rest_framework as filters
from django.db import models
from .models import Quote


class QuoteFilter(filters.FilterSet):
    """
    Filter for Quote queryset with search and filtering capabilities.
    """
    q = filters.CharFilter(method='search_filter', label='Search')
    status = filters.ChoiceFilter(choices=Quote.STATUS_CHOICES)
    organization = filters.UUIDFilter(field_name='organization__id')
    contact = filters.UUIDFilter(field_name='contact__id')
    lead = filters.UUIDFilter(field_name='lead__id')
    created_by = filters.UUIDFilter(field_name='created_by__id')
    expiry_date_from = filters.DateFilter(field_name='expiry_date', lookup_expr='gte')
    expiry_date_to = filters.DateFilter(field_name='expiry_date', lookup_expr='lte')
    min_total = filters.NumberFilter(field_name='total', lookup_expr='gte')
    max_total = filters.NumberFilter(field_name='total', lookup_expr='lte')
    
    class Meta:
        model = Quote
        fields = ['status', 'organization', 'contact', 'lead', 'created_by', 'q']
    
    def search_filter(self, queryset, name, value):
        """
        Search across quote_number, notes, and organization name.
        """
        return queryset.filter(
            models.Q(quote_number__icontains=value) |
            models.Q(notes__icontains=value) |
            models.Q(organization__name__icontains=value)
        )
