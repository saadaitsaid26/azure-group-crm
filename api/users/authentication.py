"""
Custom JWT authentication for cookie-based tokens.
"""

from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that reads tokens from cookies instead of headers.
    """

    def authenticate(self, request):
        """
        Try to authenticate using cookie-based JWT token.
        Falls back to header-based authentication if no cookie is found.
        """
        # Try to get token from cookie first
        jwt_settings = settings.SIMPLE_JWT
        raw_token = request.COOKIES.get(jwt_settings["AUTH_COOKIE"])

        if raw_token is None:
            # Fall back to header-based authentication
            return super().authenticate(request)

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
