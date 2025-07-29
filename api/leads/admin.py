from django.contrib import admin
from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    """
    Admin interface for Lead model.
    """
    list_display = ['title', 'organization', 'stage', 'priority', 'value', 'owner', 'created_at']
    list_filter = ['stage', 'priority', 'source', 'created_at']
    search_fields = ['title', 'source', 'notes', 'organization__name', 'contact__first_name', 'contact__last_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    autocomplete_fields = ['organization', 'contact', 'owner']
    
    fieldsets = (
        ('Lead Information', {
            'fields': ('title', 'organization', 'contact', 'stage', 'priority', 'source')
        }),
        ('Assignment', {
            'fields': ('owner',)
        }),
        ('Value & Notes', {
            'fields': ('value', 'notes')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
