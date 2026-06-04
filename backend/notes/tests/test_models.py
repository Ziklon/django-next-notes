from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from notes.models import Category, Note, Tag


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


class TagModelTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tagger", password="pass")

    def test_str(self):
        tag = Tag.objects.create(user=self.user, name="python")
        self.assertEqual(str(tag), "python")

    def test_unique_per_user(self):
        Tag.objects.create(user=self.user, name="python")
        with self.assertRaises(Exception):
            Tag.objects.create(user=self.user, name="python")

    def test_same_name_allowed_across_users(self):
        other = User.objects.create_user(username="other", password="pass")
        Tag.objects.create(user=self.user, name="python")
        Tag.objects.create(user=other, name="python")
        self.assertEqual(Tag.objects.filter(name="python").count(), 2)

    def test_tags_cleared_when_user_deleted(self):
        Tag.objects.create(user=self.user, name="work")
        self.user.delete()
        self.assertEqual(Tag.objects.filter(name="work").count(), 0)
