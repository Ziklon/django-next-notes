from rest_framework.test import APITestCase


class MiddlewareTests(APITestCase):
    def test_timing_header_on_api_path(self):
        resp = self.client.get("/api/notes/")
        self.assertIn("X-Response-Time-ms", resp)
        # Header value must be a parseable, non-negative number of ms.
        self.assertGreaterEqual(float(resp["X-Response-Time-ms"]), 0.0)

    def test_timing_header_on_non_api_path(self):
        # A non-/api/ path still gets the timing header but is not logged.
        resp = self.client.get("/")
        self.assertIn("X-Response-Time-ms", resp)
