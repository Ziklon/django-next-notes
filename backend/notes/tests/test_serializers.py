from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from notes.serializers import NoteSerializer, TagSerializer


class SerializerValidationTests(APITestCase):
    def test_validate_title_rejects_blank(self):
        with self.assertRaises(ValidationError):
            NoteSerializer().validate_title("   ")

    def test_validate_title_accepts_non_blank(self):
        self.assertEqual(NoteSerializer().validate_title("Hello"), "Hello")

    def test_validate_tags_strips_and_lowercases(self):
        result = NoteSerializer().validate_tags(["  Python  ", "WORK"])
        self.assertEqual(result, ["python", "work"])

    def test_validate_tags_rejects_blank_name(self):
        with self.assertRaises(ValidationError):
            NoteSerializer().validate_tags(["  "])

    def test_validate_tags_accepts_empty_list(self):
        self.assertEqual(NoteSerializer().validate_tags([]), [])


class TagSerializerTests(APITestCase):
    def test_validate_name_lowercases_and_strips(self):
        self.assertEqual(TagSerializer().validate_name("  Python  "), "python")
