"""
URL patterns for reference data app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "reference_data"

router = DefaultRouter()
router.register(r"pipeline-stages", views.PipelineStageViewSet, basename="pipeline-stage")
router.register(r"lead-sources", views.LeadSourceViewSet, basename="lead-source")
router.register(r"activity-types", views.ActivityTypeViewSet, basename="activity-type")
router.register(r"contact-types", views.ContactTypeViewSet, basename="contact-type")

urlpatterns = router.urls
