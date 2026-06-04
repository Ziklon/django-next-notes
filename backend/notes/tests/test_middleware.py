import uuid

from rest_framework.test import APITestCase


class MiddlewareTests(APITestCase):
    def test_timing_header_on_api_path(self):
        resp = self.client.get("/api/notes/")
        self.assertIn("X-Response-Time-ms", resp)
        self.assertGreaterEqual(float(resp["X-Response-Time-ms"]), 0.0)

    def test_timing_header_on_non_api_path(self):
        resp = self.client.get("/")
        self.assertIn("X-Response-Time-ms", resp)

    def test_trace_id_header_is_set_on_response(self):
        resp = self.client.get("/api/notes/")
        self.assertIn("X-Trace-Id", resp)
        # Must be a valid UUID4.
        uuid.UUID(resp["X-Trace-Id"], version=4)

    def test_trace_id_is_propagated_from_request(self):
        incoming = str(uuid.uuid4())
        resp = self.client.get("/api/notes/", HTTP_X_TRACE_ID=incoming)
        self.assertEqual(resp["X-Trace-Id"], incoming)

    def test_trace_id_is_generated_when_absent(self):
        resp1 = self.client.get("/api/notes/")
        resp2 = self.client.get("/api/notes/")
        self.assertNotEqual(resp1["X-Trace-Id"], resp2["X-Trace-Id"])
