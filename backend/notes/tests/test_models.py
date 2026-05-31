from rest_framework.test import APITestCase

from notes.models import Category, Note


class CategoryModelTests(APITestCase):
    def test_str_and_default_color(self):
        cat = Category.objects.create(name="Work")
        self.assertEqual(str(cat), "Work")
        self.assertEqual(cat.color, "#F4C77B")

    def test_name_is_unique(self):
        Category.objects.create(name="Work")
        with self.assertRaises(Exception):
            Category.objects.create(name="Work")


class NoteModelTests(APITestCase):
    def test_str_and_default_ordering(self):
        cat = Category.objects.create(name="Personal")
        n1 = Note.objects.create(title="First", category=cat)
        n2 = Note.objects.create(title="Second", category=cat)
        self.assertEqual(str(n1), "First")
        # Default ordering is most-recently-updated first.
        self.assertEqual(list(Note.objects.all()), [n2, n1])

    def test_category_set_null_on_delete(self):
        cat = Category.objects.create(name="Temp")
        note = Note.objects.create(title="Orphan", category=cat)
        cat.delete()
        note.refresh_from_db()
        self.assertIsNone(note.category)
