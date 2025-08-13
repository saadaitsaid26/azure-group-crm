"""
CRM dashboard API endpoints for authenticated users.
This module exposes two read-only views that aggregate and return dashboard
metrics for a CRM application:
1) dashboard_stats(request)
    Returns a comprehensive analytics payload with:
    - Revenue KPIs from accepted quotes (total, current month, month-over-month change)
    - Lead KPIs (active leads, new leads this month, monthly change)
    - Contact KPIs (total contacts, new contacts this month, monthly change)
    - Conversion KPIs (overall conversion, monthly conversion, monthly change)
    - Pipeline value (sum of values for non-won/non-lost leads)
    - Recent activity feed (latest 10 activities with related lead/contact/user info)
    - Lead distribution by stage (count and summed value)
    - Revenue trend grouped by month for the recent period
    Implementation notes:
    - Quote `updated_at` is used as a proxy for quote acceptance timing.
    - Percentage changes handle zero baselines safely to avoid division errors.
    - Decimal aggregates are converted to float for JSON serialization.
2) dashboard_summary(request)
    Returns lightweight dashboard card counters:
    - Total organizations
    - Total contacts
    - Total leads
    - Active leads
    - Total quotes
    - Pending activities
Both endpoints are protected with IsAuthenticated and return DRF JSON responses.
Dashboard API views for CRM analytics and statistics.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from leads.models import Lead
from contacts.models import Contact
from quote_items.models import Quote
from activities.models import Activity
from organizations.models import Organization


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get comprehensive dashboard statistics including KPIs and metrics.
    """
    # Date ranges
    today = timezone.now().date()
    this_month_start = today.replace(day=1)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
    
    # Total Revenue from accepted quotes
    total_revenue = Quote.objects.filter(
        status='accepted'
    ).aggregate(
        total=Sum('total')
    )['total'] or Decimal('0.00')
    
    # Revenue this month (using updated_at as proxy for when quote was accepted)
    this_month_revenue = Quote.objects.filter(
        status='accepted',
        updated_at__gte=this_month_start
    ).aggregate(
        total=Sum('total')
    )['total'] or Decimal('0.00')
    
    # Revenue last month for comparison
    last_month_revenue = Quote.objects.filter(
        status='accepted',
        updated_at__gte=last_month_start,
        updated_at__lt=this_month_start
    ).aggregate(
        total=Sum('total')
    )['total'] or Decimal('0.00')
    
    # Calculate revenue change percentage
    if last_month_revenue > 0:
        revenue_change = ((this_month_revenue - last_month_revenue) / last_month_revenue * 100)
    else:
        revenue_change = 100.0 if this_month_revenue > 0 else 0.0
    
    # Active Leads (not won or lost)
    active_leads = Lead.objects.exclude(
        stage__in=['won', 'lost']
    ).count()
    
    # Leads this month
    this_month_leads = Lead.objects.filter(
        created_at__gte=this_month_start
    ).count()
    
    # Leads last month
    last_month_leads = Lead.objects.filter(
        created_at__gte=last_month_start,
        created_at__lt=this_month_start
    ).count()
    
    # Calculate leads change percentage
    if last_month_leads > 0:
        leads_change = ((this_month_leads - last_month_leads) / last_month_leads * 100)
    else:
        leads_change = 100.0 if this_month_leads > 0 else 0.0
    
    # Total Contacts
    total_contacts = Contact.objects.count()
    
    # Contacts this month
    this_month_contacts = Contact.objects.filter(
        created_at__gte=this_month_start
    ).count()
    
    # Contacts last month
    last_month_contacts = Contact.objects.filter(
        created_at__gte=last_month_start,
        created_at__lt=this_month_start
    ).count()
    
    # Calculate contacts change percentage
    if last_month_contacts > 0:
        contacts_change = ((this_month_contacts - last_month_contacts) / last_month_contacts * 100)
    else:
        contacts_change = 100.0 if this_month_contacts > 0 else 0.0
    
    # Conversion Rate (won leads / total leads)
    total_leads_count = Lead.objects.count()
    won_leads_count = Lead.objects.filter(stage='won').count()
    
    if total_leads_count > 0:
        conversion_rate = (won_leads_count / total_leads_count * 100)
    else:
        conversion_rate = 0.0
    
    # This month conversion rate
    this_month_total_leads = Lead.objects.filter(
        created_at__gte=this_month_start
    ).count()
    this_month_won_leads = Lead.objects.filter(
        created_at__gte=this_month_start,
        stage='won'
    ).count()
    
    if this_month_total_leads > 0:
        this_month_conversion = (this_month_won_leads / this_month_total_leads * 100)
    else:
        this_month_conversion = 0.0
    
    # Last month conversion rate
    last_month_total_leads = Lead.objects.filter(
        created_at__gte=last_month_start,
        created_at__lt=this_month_start
    ).count()
    last_month_won_leads = Lead.objects.filter(
        created_at__gte=last_month_start,
        created_at__lt=this_month_start,
        stage='won'
    ).count()
    
    if last_month_total_leads > 0:
        last_month_conversion = (last_month_won_leads / last_month_total_leads * 100)
    else:
        last_month_conversion = 0.0
    
    # Calculate conversion change
    if last_month_conversion > 0:
        conversion_change = ((this_month_conversion - last_month_conversion) / last_month_conversion * 100)
    else:
        conversion_change = 100.0 if this_month_conversion > 0 else 0.0
    
    # Pipeline value (sum of active leads)
    pipeline_value = Lead.objects.exclude(
        stage__in=['won', 'lost']
    ).aggregate(
        total=Sum('value')
    )['total'] or Decimal('0.00')
    
    # Recent activities (last 10)
    recent_activities = Activity.objects.select_related(
        'lead', 'contact', 'created_by'
    ).order_by('-created_at')[:10].values(
        'id', 'type', 'title', 'comment', 'schedule_from', 
        'is_done', 'created_at',
        lead_title=F('lead__title'),
        contact_name=F('contact__first_name'),
        user_email=F('created_by__email')
    )
    
    # Leads by stage for pipeline
    leads_by_stage = Lead.objects.values('stage').annotate(
        count=Count('id'),
        value=Sum('value')
    ).order_by('stage')
    
    # Revenue over time (last 6 months) - using updated_at as proxy
    six_months_ago = today - timedelta(days=180)
    revenue_over_time = Quote.objects.filter(
        status='accepted',
        updated_at__gte=six_months_ago
    ).annotate(
        month=TruncMonth('updated_at')
    ).values('month').annotate(
        revenue=Sum('total')
    ).order_by('month')
    
    return Response({
        'kpis': {
            'total_revenue': {
                'value': float(total_revenue),
                'change': round(revenue_change, 1),
                'this_month': float(this_month_revenue),
            },
            'active_leads': {
                'value': active_leads,
                'change': round(leads_change, 1),
                'this_month': this_month_leads,
            },
            'total_contacts': {
                'value': total_contacts,
                'change': round(contacts_change, 1),
                'this_month': this_month_contacts,
            },
            'conversion_rate': {
                'value': round(conversion_rate, 1),
                'change': round(conversion_change, 1),
                'this_month': round(this_month_conversion, 1),
            },
        },
        'pipeline_value': float(pipeline_value),
        'recent_activities': list(recent_activities),
        'leads_by_stage': list(leads_by_stage),
        'revenue_over_time': [
            {
                'month': item['month'].strftime('%Y-%m') if item['month'] else '',
                'revenue': float(item['revenue'] or 0)
            }
            for item in revenue_over_time
        ],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """
    Get quick summary statistics for dashboard cards.
    """
    total_organizations = Organization.objects.count()
    total_contacts = Contact.objects.count()
    total_leads = Lead.objects.count()
    active_leads = Lead.objects.exclude(stage__in=['won', 'lost']).count()
    total_quotes = Quote.objects.count()
    pending_activities = Activity.objects.filter(done=False).count()
    
    return Response({
        'total_organizations': total_organizations,
        'total_contacts': total_contacts,
        'total_leads': total_leads,
        'active_leads': active_leads,
        'total_quotes': total_quotes,
        'pending_activities': pending_activities,
    })
