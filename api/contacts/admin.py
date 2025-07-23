from django.contrib import admin
from .models import Contact


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    """
    Admin interface for Contact model.
    """
    list_display = ['full_name', 'email', 'phone', 'organization', 'role', 'status', 'created_at']
    list_filter = ['status', 'role', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'role']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at', 'full_name']
    autocomplete_fields = ['organization']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('first_name', 'last_name', 'full_name', 'email', 'phone')
        }),
        ('Organization & Role', {
            'fields': ('organization', 'role', 'status')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
