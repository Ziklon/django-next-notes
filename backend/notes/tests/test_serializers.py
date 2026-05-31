from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from notes.serializers import NoteSerializer


class SerializerValidationTests(APITestCase):
    def test_validate_title_rejects_blank(self):
        with self.assertRaises(ValidationError):
            NoteSerializer().validate_title("   ")

    def test_validate_title_accepts_non_blank(self):
        self.assertEqual(NoteSerializer().validate_title("Hello"), "Hello")
