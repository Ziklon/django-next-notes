"""
Integration tests for the auth endpoints and JWT-protected resources.

These tests verify the full register → login → token-refresh cycle and
confirm that protected endpoints reject unauthenticated requests.
"""
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class RegistrationTests(APITestCase):
    URL = "/api/auth/register/"

    def test_register_creates_user_and_returns_tokens(self):
        resp = self.client.post(
            self.URL,
            {"email": "new@example.com", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)
        self.assertTrue(User.objects.filter(username="new@example.com").exists())

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(
            username="taken@example.com", email="taken@example.com", password="pass1234"
        )
        resp = self.client.post(
            self.URL,
            {"email": "taken@example.com", "password": "pass1234"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", resp.data)

    def test_password_shorter_than_8_chars_is_rejected(self):
        resp = self.client.post(
            self.URL, {"email": "x@x.com", "password": "short"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email_format_is_rejected(self):
        resp = self.client.post(
            self.URL, {"email": "not-an-email", "password": "testpass123"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):
    URL = "/api/auth/login/"

    def setUp(self):
        self.user = User.objects.create_user(
            username="user@example.com",
            email="user@example.com",
            password="correctpass",
        )

    def test_correct_credentials_return_tokens(self):
        resp = self.client.post(
            self.URL,
            {"email": "user@example.com", "password": "correctpass"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_wrong_password_is_rejected(self):
        resp = self.client.post(
            self.URL,
            {"email": "user@example.com", "password": "wrongpass"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unknown_email_is_rejected(self):
        resp = self.client.post(
            self.URL,
            {"email": "nobody@example.com", "password": "anypass"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class TokenRefreshTests(APITestCase):
    def _register(self, email="r@example.com", password="pass1234"):
        return self.client.post(
            "/api/auth/register/",
            {"email": email, "password": password},
            format="json",
        )

    def test_valid_refresh_token_returns_new_access_token(self):
        reg = self._register()
        resp = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": reg.data["refresh"]},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)

    def test_invalid_refresh_token_is_rejected(self):
        resp = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": "not-a-real-token"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class ProtectedEndpointTests(APITestCase):
    """Notes and categories require a valid Bearer token."""

    def test_unauthenticated_notes_request_returns_401(self):
        resp = self.client.get("/api/notes/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_categories_request_returns_401(self):
        resp = self.client.get("/api/categories/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_bearer_token_grants_access(self):
        reg = self.client.post(
            "/api/auth/register/",
            {"email": "a@example.com", "password": "pass1234"},
            format="json",
        )
        resp = self.client.get(
            "/api/notes/",
            HTTP_AUTHORIZATION=f"Bearer {reg.data['access']}",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
