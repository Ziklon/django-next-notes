"""Custom middleware for the Notes backend."""
import logging
import time

logger = logging.getLogger("api.timing")


class RequestTimingMiddleware:
    """Log how long each /api/ request takes and expose it as a header.

    Placed at the top of MIDDLEWARE so it wraps every inner middleware and the
    view, giving an end-to-end server-side timing in milliseconds.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()
        response = self.get_response(request)
        duration_ms = (time.perf_counter() - start) * 1000

        # Expose timing to clients (handy in browser dev tools / curl -i).
        response["X-Response-Time-ms"] = f"{duration_ms:.2f}"

        # Only log API traffic to keep the output focused.
        if request.path.startswith("/api/"):
            logger.info(
                "%s %s -> %s (%.2f ms)",
                request.method,
                request.get_full_path(),
                response.status_code,
                duration_ms,
            )
        return response
