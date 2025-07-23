from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Admin interface for Product model.
    """
    list_display = ['sku', 'name', 'category', 'price', 'cost', 'status', 'created_at']
    list_filter = ['status', 'category', 'created_at']
    search_fields = ['sku', 'name', 'description', 'category']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('sku', 'name', 'description', 'category', 'status')
        }),
        ('Pricing', {
            'fields': ('price', 'cost')
        }),
        ('Additional Data', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

