"""
Logging utilities for the CRM Backend.

This module provides helper functions and classes for consistent logging
across all applications in the CRM system.

Usage Examples:
---------------

1. Basic usage in a Django app:
    ```python
    from crm_backend.logging_utils import get_logger
    
    logger = get_logger(__name__)
    logger.info("User logged in successfully")
    logger.error("Failed to process payment", exc_info=True)
    ```

2. Logging with context (user, request, etc.):
    ```python
    from crm_backend.logging_utils import log_with_context
    
    log_with_context(
        logger,
        "info",
        "Lead created",
        user_id=request.user.id,
        lead_id=lead.id,
        request_id=request.META.get('HTTP_X_REQUEST_ID')
    )
    ```

3. Performance logging:
    ```python
    from crm_backend.logging_utils import log_performance
    
    @log_performance
    def expensive_operation():
        # Your code here
        pass
    ```

4. Logging API requests:
    ```python
    from crm_backend.logging_utils import log_api_request
    
    log_api_request(request, response, duration_ms=250)
    ```

Environment Variables:
---------------------
- LOG_LEVEL: Set the log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- LOG_TO_FILE: Enable/disable file logging (True/False)
- LOG_SQL: Enable SQL query logging (True/False) - only works in DEBUG mode
"""

import logging
import time
import functools
from typing import Any, Callable, Dict, Optional
from django.http import HttpRequest, HttpResponse


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for the specified module.
    
    This is a simple wrapper around logging.getLogger() but provides
    a centralized place for future enhancements.
    
    Args:
        name: The name of the logger (typically __name__)
        
    Returns:
        A configured logger instance
        
    Example:
        >>> logger = get_logger(__name__)
        >>> logger.info("Application started")
    """
    return logging.getLogger(name)


def log_with_context(
    logger: logging.Logger,
    level: str,
    message: str,
    **context: Any
) -> None:
    """
    Log a message with additional context information.
    
    Args:
        logger: The logger instance to use
        level: The log level ('debug', 'info', 'warning', 'error', 'critical')
        message: The log message
        **context: Additional context to include in the log
        
    Example:
        >>> log_with_context(
        ...     logger,
        ...     "info",
        ...     "User action",
        ...     user_id=123,
        ...     action="create_lead",
        ...     ip_address="192.168.1.1"
        ... )
    """
    log_method = getattr(logger, level.lower())
    context_str = " | ".join([f"{k}={v}" for k, v in context.items()])
    full_message = f"{message} | {context_str}" if context else message
    log_method(full_message)


def log_performance(func: Callable) -> Callable:
    """
    Decorator to log the execution time of a function.
    
    Args:
        func: The function to wrap
        
    Returns:
        The wrapped function
        
    Example:
        >>> @log_performance
        ... def process_data(data):
        ...     # Processing logic
        ...     pass
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger = get_logger(func.__module__)
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            duration_ms = (time.time() - start_time) * 1000
            logger.debug(
                f"Performance: {func.__name__} executed in {duration_ms:.2f}ms"
            )
            return result
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error(
                f"Performance: {func.__name__} failed after {duration_ms:.2f}ms",
                exc_info=True
            )
            raise
    
    return wrapper


def log_api_request(
    request: HttpRequest,
    response: HttpResponse,
    duration_ms: Optional[float] = None,
    extra_context: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log an API request with relevant information.
    
    Args:
        request: The Django HttpRequest object
        response: The Django HttpResponse object
        duration_ms: Optional request duration in milliseconds
        extra_context: Optional additional context to log
        
    Example:
        >>> log_api_request(request, response, duration_ms=125.5)
    """
    logger = get_logger("crm_backend.api")
    
    context = {
        "method": request.method,
        "path": request.path,
        "status": response.status_code,
        "user": getattr(request.user, "id", "anonymous"),
        "ip": get_client_ip(request),
    }
    
    if duration_ms is not None:
        context["duration_ms"] = f"{duration_ms:.2f}"
    
    if extra_context:
        context.update(extra_context)
    
    # Determine log level based on status code
    if response.status_code >= 500:
        level = "error"
    elif response.status_code >= 400:
        level = "warning"
    else:
        level = "info"
    
    log_with_context(logger, level, "API Request", **context)


def get_client_ip(request: HttpRequest) -> str:
    """
    Get the client IP address from the request.
    
    Args:
        request: The Django HttpRequest object
        
    Returns:
        The client IP address as a string
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', 'unknown')


def log_model_change(
    logger: logging.Logger,
    action: str,
    model_name: str,
    instance_id: Any,
    user_id: Optional[int] = None,
    changes: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log a model change (create, update, delete).
    
    Args:
        logger: The logger instance to use
        action: The action performed ('create', 'update', 'delete')
        model_name: The name of the model
        instance_id: The ID of the model instance
        user_id: Optional ID of the user who made the change
        changes: Optional dictionary of changes (for updates)
        
    Example:
        >>> log_model_change(
        ...     logger,
        ...     "update",
        ...     "Lead",
        ...     42,
        ...     user_id=1,
        ...     changes={"status": "qualified"}
        ... )
    """
    context = {
        "action": action,
        "model": model_name,
        "instance_id": instance_id,
    }
    
    if user_id:
        context["user_id"] = user_id
    
    if changes:
        context["changes"] = str(changes)
    
    log_with_context(
        logger,
        "info",
        f"Model {action}",
        **context
    )


class LoggingMiddleware:
    """
    Middleware to automatically log all API requests and responses.
    
    Add this to your MIDDLEWARE setting to enable automatic request logging:
    
    MIDDLEWARE = [
        ...
        'crm_backend.logging_utils.LoggingMiddleware',
        ...
    ]
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = get_logger("crm_backend.middleware")
    
    def __call__(self, request):
        start_time = time.time()
        
        # Log incoming request
        self.logger.debug(
            f"Request: {request.method} {request.path} | "
            f"User: {getattr(request.user, 'id', 'anonymous')} | "
            f"IP: {get_client_ip(request)}"
        )
        
        response = self.get_response(request)
        
        # Log response
        duration_ms = (time.time() - start_time) * 1000
        log_api_request(request, response, duration_ms)
        
        return response
    
    def process_exception(self, request, exception):
        """Log exceptions that occur during request processing."""
        self.logger.error(
            f"Exception during {request.method} {request.path}",
            exc_info=True,
            extra={
                "user": getattr(request.user, "id", "anonymous"),
                "ip": get_client_ip(request),
            }
        )


# Convenience aliases for common logging patterns
def log_user_action(user_id: int, action: str, details: Optional[Dict[str, Any]] = None) -> None:
    """Log a user action."""
    logger = get_logger("users")
    context = {"user_id": user_id, "action": action}
    if details:
        context.update(details)
    log_with_context(logger, "info", "User action", **context)


def log_security_event(event_type: str, details: Dict[str, Any]) -> None:
    """Log a security-related event."""
    logger = get_logger("django.security")
    log_with_context(logger, "warning", f"Security event: {event_type}", **details)


def log_db_error(operation: str, error: Exception, **context: Any) -> None:
    """Log a database operation error."""
    logger = get_logger("crm_backend.database")
    context["operation"] = operation
    context["error"] = str(error)
    log_with_context(logger, "error", "Database error", **context)
