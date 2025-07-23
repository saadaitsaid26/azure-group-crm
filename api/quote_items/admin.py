from django.contrib import admin
from .models import Quote, QuoteItem


class QuoteItemInline(admin.TabularInline):
    """
    Inline admin for QuoteItem in Quote admin.
    """
    model = QuoteItem
    extra = 1
    fields = ['product', 'description', 'quantity', 'unit_price', 'line_total', 'sort_order']
    readonly_fields = ['line_total']
    autocomplete_fields = ['product']


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    """
    Admin interface for Quote model with inline items.
    """
    list_display = ['quote_number', 'organization', 'status', 'total', 'expiry_date', 'created_at']
    list_filter = ['status', 'created_at', 'expiry_date']
    search_fields = ['quote_number', 'organization__name', 'notes']
    readonly_fields = ['id', 'created_by', 'created_at', 'updated_at']
    autocomplete_fields = ['organization', 'contact', 'lead']
    inlines = [QuoteItemInline]
    
    fieldsets = (
        ('Quote Information', {
            'fields': ('quote_number', 'status', 'organization', 'contact', 'lead')
        }),
        ('Totals', {
            'fields': ('subtotal', 'tax_rate', 'tax_amount', 'discount_amount', 'total')
        }),
        ('Additional Information', {
            'fields': ('expiry_date', 'notes', 'terms')
        }),
        ('Metadata', {
            'fields': ('id', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Auto-assign created_by on creation."""
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(QuoteItem)
class QuoteItemAdmin(admin.ModelAdmin):
    """
    Admin interface for QuoteItem model.
    """
    list_display = ['quote', 'product', 'quantity', 'unit_price', 'line_total', 'sort_order']
    list_filter = ['created_at']
    search_fields = ['quote__quote_number', 'product__name', 'product__sku']
    readonly_fields = ['id', 'line_total', 'created_at', 'updated_at']
    autocomplete_fields = ['quote', 'product']
