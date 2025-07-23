from django.contrib import admin
from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    """
    Admin interface for Organization model.
    """
    list_display = ['name', 'email', 'phone', 'status', 'type', 'industry', 'created_at']
    list_filter = ['status', 'type', 'industry', 'created_at']
    search_fields = ['name', 'email', 'phone', 'industry']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'email', 'phone', 'website')
        }),
        ('Classification', {
            'fields': ('status', 'type', 'industry')
        }),
        ('Address & Notes', {
            'fields': ('address', 'notes')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
