from django.core.management import call_command
from rest_framework.test import APITestCase

from notes.models import Category, Note


class SeedCommandTests(APITestCase):
    def test_seed_creates_categories_and_notes(self):
        call_command("seed")
        self.assertEqual(Category.objects.count(), 3)
        self.assertEqual(Note.objects.count(), 7)

    def test_seed_is_idempotent_and_fresh_resets(self):
        call_command("seed")
        call_command("seed")  # second run should not duplicate
        self.assertEqual(Category.objects.count(), 3)
        self.assertEqual(Note.objects.count(), 7)

        call_command("seed", "--fresh")  # clears then reseeds
        self.assertEqual(Category.objects.count(), 3)
        self.assertEqual(Note.objects.count(), 7)
