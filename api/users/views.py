"""
Authentication views for cookie-based JWT authentication.
"""

from django.contrib.auth import authenticate
from django.conf import settings
from django.db import models
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, throttle_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters import rest_framework as filters
from .models import User
from .serializers import LoginSerializer, UserSerializer, UserCreateSerializer
from .permissions import IsAdminUser


class LoginThrottle(AnonRateThrottle):
    """Custom throttle for login attempts."""

    rate = "5/minute"


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def login_view(request):
    """
    Login endpoint that sets httpOnly cookies with JWT tokens.
    """
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    user = authenticate(email=email, password=password)

    if user is None:
        return Response(
            {"error": {"code": "invalid_credentials", "message": "Invalid email or password"}},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"error": {"code": "account_disabled", "message": "This account has been disabled"}},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Generate tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # Prepare response
    user_data = UserSerializer(user).data
    response = Response(
        {"user": user_data, "message": "Login successful"},
        status=status.HTTP_200_OK,
    )

    # Set httpOnly cookies
    jwt_settings = settings.SIMPLE_JWT

    # Access token cookie
    response.set_cookie(
        key=jwt_settings["AUTH_COOKIE"],
        value=access_token,
        max_age=int(jwt_settings["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        secure=jwt_settings["AUTH_COOKIE_SECURE"],
        httponly=jwt_settings["AUTH_COOKIE_HTTP_ONLY"],
        samesite=jwt_settings["AUTH_COOKIE_SAMESITE"],
        domain=jwt_settings["AUTH_COOKIE_DOMAIN"],
        path=jwt_settings["AUTH_COOKIE_PATH"],
    )

    # Refresh token cookie
    response.set_cookie(
        key=jwt_settings["AUTH_COOKIE_REFRESH"],
        value=refresh_token,
        max_age=int(jwt_settings["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        secure=jwt_settings["AUTH_COOKIE_SECURE"],
        httponly=jwt_settings["AUTH_COOKIE_HTTP_ONLY"],
        samesite=jwt_settings["AUTH_COOKIE_SAMESITE"],
        domain=jwt_settings["AUTH_COOKIE_DOMAIN"],
        path=jwt_settings["AUTH_COOKIE_PATH"],
    )

    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    Get current user information.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_view(request):
    """
    Refresh access token using refresh token from cookie.
    """
    jwt_settings = settings.SIMPLE_JWT
    refresh_token = request.COOKIES.get(jwt_settings["AUTH_COOKIE_REFRESH"])

    if not refresh_token:
        return Response(
            {"error": {"code": "no_refresh_token", "message": "Refresh token not found"}},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)

        # If rotation is enabled, get new refresh token
        if jwt_settings["ROTATE_REFRESH_TOKENS"]:
            refresh.set_jti()
            refresh.set_exp()
            new_refresh_token = str(refresh)
        else:
            new_refresh_token = refresh_token

        response = Response(
            {"message": "Token refreshed successfully"},
            status=status.HTTP_200_OK,
        )

        # Set new access token cookie
        response.set_cookie(
            key=jwt_settings["AUTH_COOKIE"],
            value=access_token,
            max_age=int(jwt_settings["ACCESS_TOKEN_LIFETIME"].total_seconds()),
            secure=jwt_settings["AUTH_COOKIE_SECURE"],
            httponly=jwt_settings["AUTH_COOKIE_HTTP_ONLY"],
            samesite=jwt_settings["AUTH_COOKIE_SAMESITE"],
            domain=jwt_settings["AUTH_COOKIE_DOMAIN"],
            path=jwt_settings["AUTH_COOKIE_PATH"],
        )

        # Set new refresh token cookie if rotated
        if jwt_settings["ROTATE_REFRESH_TOKENS"]:
            response.set_cookie(
                key=jwt_settings["AUTH_COOKIE_REFRESH"],
                value=new_refresh_token,
                max_age=int(jwt_settings["REFRESH_TOKEN_LIFETIME"].total_seconds()),
                secure=jwt_settings["AUTH_COOKIE_SECURE"],
                httponly=jwt_settings["AUTH_COOKIE_HTTP_ONLY"],
                samesite=jwt_settings["AUTH_COOKIE_SAMESITE"],
                domain=jwt_settings["AUTH_COOKIE_DOMAIN"],
                path=jwt_settings["AUTH_COOKIE_PATH"],
            )

        return response

    except Exception as e:
        return Response(
            {"error": {"code": "invalid_token", "message": "Invalid or expired refresh token"}},
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout endpoint that clears JWT cookies.
    """
    jwt_settings = settings.SIMPLE_JWT
    response = Response(
        {"message": "Logout successful"},
        status=status.HTTP_200_OK,
    )

    # Clear access token cookie
    response.delete_cookie(
        key=jwt_settings["AUTH_COOKIE"],
        path=jwt_settings["AUTH_COOKIE_PATH"],
        domain=jwt_settings["AUTH_COOKIE_DOMAIN"],
        samesite=jwt_settings["AUTH_COOKIE_SAMESITE"],
    )

    # Clear refresh token cookie
    response.delete_cookie(
        key=jwt_settings["AUTH_COOKIE_REFRESH"],
        path=jwt_settings["AUTH_COOKIE_PATH"],
        domain=jwt_settings["AUTH_COOKIE_DOMAIN"],
        samesite=jwt_settings["AUTH_COOKIE_SAMESITE"],
    )

    return response


class UserFilter(filters.FilterSet):
    """Filter for User model."""

    q = filters.CharFilter(method="filter_search")
    role = filters.ChoiceFilter(choices=User.ROLE_CHOICES)
    is_active = filters.BooleanFilter()

    class Meta:
        model = User
        fields = ["role", "is_active", "q"]

    def filter_search(self, queryset, name, value):
        """Search across email, first_name, last_name."""
        from django.db.models import Q
        return queryset.filter(
            Q(email__icontains=value) |
            Q(first_name__icontains=value) |
            Q(last_name__icontains=value)
        )


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users (Admin only).
    """

    queryset = User.objects.all()
    permission_classes = [IsAdminUser]
    filterset_class = UserFilter
    ordering_fields = ["email", "first_name", "last_name", "role", "created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get user statistics."""
        queryset = self.filter_queryset(self.get_queryset())
        
        total = queryset.count()
        admin_count = queryset.filter(role="admin").count()
        user_count = queryset.filter(role="user").count()
        active_count = queryset.filter(is_active=True).count()
        inactive_count = queryset.filter(is_active=False).count()

        return Response({
            "total": total,
            "by_role": {
                "admin": admin_count,
                "user": user_count,
            },
            "by_status": {
                "active": active_count,
                "inactive": inactive_count,
            },
        })
    
    @action(detail=False, methods=["get"])
    def dashboard_stats(self, request):
        """Get comprehensive dashboard statistics."""
        from django.utils import timezone
        from datetime import timedelta
        from django.contrib.auth.models import Group
        from reference_data.models import PipelineStage, LeadSource, ActivityType, ContactType
        from leads.models import Lead
        from contacts.models import Contact
        from organizations.models import Organization
        from activities.models import Activity
        
        # User stats
        users = User.objects.all()
        user_stats = {
            "total": users.count(),
            "active": users.filter(is_active=True).count(),
            "admins": users.filter(role="admin").count(),
            "users": users.filter(role="user").count(),
        }
        
        # Group/Role stats
        groups = Group.objects.all()
        role_stats = {
            "total": groups.count(),
            "with_users": sum(1 for g in groups if g.user_set.exists()),
        }
        
        # Reference data stats
        reference_data_stats = {
            "pipeline_stages": PipelineStage.objects.filter(is_active=True).count(),
            "lead_sources": LeadSource.objects.filter(is_active=True).count(),
            "activity_types": ActivityType.objects.filter(is_active=True).count(),
            "contact_types": ContactType.objects.filter(is_active=True).count(),
        }
        
        # CRM data stats
        crm_stats = {
            "total_leads": Lead.objects.count(),
            "total_contacts": Contact.objects.count(),
            "total_organizations": Organization.objects.count(),
            "total_activities": Activity.objects.count(),
        }
        
        # Recent activity (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_activity = {
            "new_leads": Lead.objects.filter(created_at__gte=seven_days_ago).count(),
            "new_contacts": Contact.objects.filter(created_at__gte=seven_days_ago).count(),
            "new_organizations": Organization.objects.filter(created_at__gte=seven_days_ago).count(),
            "new_activities": Activity.objects.filter(created_at__gte=seven_days_ago).count(),
            "new_users": User.objects.filter(created_at__gte=seven_days_ago).count(),
        }
        
        # System health indicators
        thirty_days_ago = timezone.now() - timedelta(days=30)
        system_health = {
            "active_users_30d": User.objects.filter(
                is_active=True,
                last_login__gte=thirty_days_ago
            ).count(),
            "total_users": users.count(),
        }
        
        return Response({
            "users": user_stats,
            "roles": role_stats,
            "reference_data": reference_data_stats,
            "crm": crm_stats,
            "recent_activity": recent_activity,
            "system_health": system_health,
        })
