"""Custom middleware for the Notes backend."""
import json
import logging
import time
import uuid


class JsonFormatter(logging.Formatter):
    """Emit each log record as a single JSON line."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "message": record.getMessage(),
        }
        for field in ("trace_id", "user_id", "method", "path", "status", "duration_ms"):
            value = getattr(record, field, None)
            if value is not None:
                payload[field] = value
        return json.dumps(payload)


class TraceIdMiddleware:
    """
    Propagate or generate a trace ID for every request.

    Reads X-Trace-Id from the incoming headers (so a client or gateway can
    inject its own ID) or generates a new UUID4. The value is stored on
    request.trace_id and echoed back in the X-Trace-Id response header so
    the caller can correlate its logs with the server's.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.trace_id = request.headers.get("X-Trace-Id") or str(uuid.uuid4())
        response = self.get_response(request)
        response["X-Trace-Id"] = request.trace_id
        return response


logger = logging.getLogger("api.timing")


class RequestTimingMiddleware:
    """
    Log how long each /api/ request takes and expose it as a header.

    Placed after TraceIdMiddleware so request.trace_id is already set.
    Emits a structured JSON log line per request including the trace ID,
    authenticated user ID, method, path, status, and duration.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()
        response = self.get_response(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        response["X-Response-Time-ms"] = f"{duration_ms:.2f}"

        if request.path.startswith("/api/"):
            user = getattr(request, "user", None)
            user_id = user.pk if user and user.is_authenticated else None
            logger.info(
                "%s %s -> %s (%.2f ms)",
                request.method,
                request.get_full_path(),
                response.status_code,
                duration_ms,
                extra={
                    "trace_id": getattr(request, "trace_id", None),
                    "user_id": user_id,
                    "method": request.method,
                    "path": request.get_full_path(),
                    "status": response.status_code,
                    "duration_ms": duration_ms,
                },
            )
        return response
