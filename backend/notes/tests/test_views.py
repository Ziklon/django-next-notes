from django.contrib.auth.models import User
from django.contrib.postgres.search import CombinedSearchQuery, SearchQuery
from rest_framework import status
from rest_framework.test import APITestCase

from notes.models import Category, Note, Tag
from notes.views import _build_search_query


def make_user(username="test@example.com", password="pass1234"):
    return User.objects.create_user(
        username=username, email=username, password=password
    )


class BuildSearchQueryTests(APITestCase):
    def test_single_word_returns_prefix_query(self):
        q = _build_search_query("backen")
        self.assertIsInstance(q, SearchQuery)

    def test_multiple_words_combines_full_and_prefix(self):
        q = _build_search_query("project backen")
        self.assertIsInstance(q, CombinedSearchQuery)

    def test_single_complete_word_uses_prefix(self):
        q = _build_search_query("backend")
        self.assertIsInstance(q, SearchQuery)


class CategoryAPITests(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.client.force_authenticate(user=self.user)
        self.school = Category.objects.create(name="School", color="#F4CE7B")
        Note.objects.create(title="A", category=self.school, user=self.user)
        Note.objects.create(title="B", category=self.school, user=self.user)

    def test_list_includes_note_count(self):
        resp = self.client.get("/api/categories/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        school = next(c for c in resp.data["results"] if c["name"] == "School")
        self.assertEqual(school["note_count"], 2)

    def test_create_category(self):
        resp = self.client.post(
            "/api/categories/", {"name": "Ideas", "color": "#9CB7AE"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.filter(name="Ideas").count(), 1)


class NoteAPITests(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.client.force_authenticate(user=self.user)
        self.school = Category.objects.create(name="School")
        self.personal = Category.objects.create(name="Personal")
        self.n1 = Note.objects.create(
            title="Meeting", content="agenda", category=self.school, user=self.user
        )
        self.n2 = Note.objects.create(
            title="Books", content="reading list", category=self.personal, user=self.user
        )

    def test_list_notes(self):
        resp = self.client.get("/api/notes/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["count"], 2)

    def test_filter_by_category(self):
        resp = self.client.get(f"/api/notes/?category={self.school.id}")
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["title"], "Meeting")

    def test_search_notes(self):
        resp = self.client.get("/api/notes/?search=reading")
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["title"], "Books")

    def test_search_prefix_matches_partial_word(self):
        resp = self.client.get("/api/notes/?search=agen")
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["title"], "Meeting")

    def test_search_combined_full_and_prefix(self):
        resp = self.client.get("/api/notes/?search=meeting+agen")
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["title"], "Meeting")

    def test_create_note_returns_category_detail(self):
        resp = self.client.post(
            "/api/notes/",
            {"title": "New", "content": "body", "category": self.school.id},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["category_detail"]["name"], "School")

    def test_create_note_blank_title_rejected(self):
        resp = self.client.post(
            "/api/notes/", {"title": "   ", "content": "x"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", resp.data)

    def test_update_note(self):
        resp = self.client.patch(
            f"/api/notes/{self.n1.id}/", {"title": "Updated"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.n1.refresh_from_db()
        self.assertEqual(self.n1.title, "Updated")

    def test_delete_note(self):
        resp = self.client.delete(f"/api/notes/{self.n1.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Note.objects.filter(pk=self.n1.id).exists())

    def test_health_endpoint(self):
        resp = self.client.get("/api/health/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "ok")


class NoteOwnershipTests(APITestCase):
    """Notes are strictly scoped to the authenticated user."""

    def setUp(self):
        self.alice = make_user("alice@example.com")
        self.bob = make_user("bob@example.com")
        self.alice_note = Note.objects.create(title="Alice's note", user=self.alice)
        self.bob_note = Note.objects.create(title="Bob's note", user=self.bob)

    def test_user_only_sees_own_notes(self):
        self.client.force_authenticate(user=self.alice)
        resp = self.client.get("/api/notes/")
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["title"], "Alice's note")

    def test_user_cannot_read_another_users_note(self):
        self.client.force_authenticate(user=self.alice)
        resp = self.client.get(f"/api/notes/{self.bob_note.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_edit_another_users_note(self):
        self.client.force_authenticate(user=self.alice)
        resp = self.client.patch(
            f"/api/notes/{self.bob_note.id}/", {"title": "Hacked"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
        self.bob_note.refresh_from_db()
        self.assertEqual(self.bob_note.title, "Bob's note")

    def test_user_cannot_delete_another_users_note(self):
        self.client.force_authenticate(user=self.alice)
        resp = self.client.delete(f"/api/notes/{self.bob_note.id}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Note.objects.filter(pk=self.bob_note.id).exists())

    def test_created_note_is_owned_by_request_user(self):
        self.client.force_authenticate(user=self.alice)
        resp = self.client.post("/api/notes/", {"title": "New note"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Note.objects.get(pk=resp.data["id"]).user, self.alice)

    def test_unauthenticated_request_returns_401(self):
        resp = self.client.get("/api/notes/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class TagAPITests(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.client.force_authenticate(user=self.user)

    def test_create_tag(self):
        resp = self.client.post("/api/tags/", {"name": "Python"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["name"], "python")

    def test_list_tags_scoped_to_user(self):
        other = make_user("other@example.com")
        Tag.objects.create(user=self.user, name="mine")
        Tag.objects.create(user=other, name="theirs")
        resp = self.client.get("/api/tags/")
        names = [t["name"] for t in resp.data["results"]]
        self.assertIn("mine", names)
        self.assertNotIn("theirs", names)

    def test_tag_note_count(self):
        tag = Tag.objects.create(user=self.user, name="work")
        note = Note.objects.create(title="A", user=self.user)
        note.tags.add(tag)
        resp = self.client.get("/api/tags/")
        work = next(t for t in resp.data["results"] if t["name"] == "work")
        self.assertEqual(work["note_count"], 1)

    def test_delete_tag(self):
        tag = Tag.objects.create(user=self.user, name="tmp")
        resp = self.client.delete(f"/api/tags/{tag.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Tag.objects.filter(pk=tag.id).exists())


class NoteTagTests(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.client.force_authenticate(user=self.user)

    def test_create_note_with_tags(self):
        resp = self.client.post(
            "/api/notes/",
            {"title": "Tagged", "content": "", "tags": ["python", "work"]},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(sorted(resp.data["tags"]), ["python", "work"])
        self.assertEqual(Tag.objects.filter(user=self.user).count(), 2)

    def test_tags_normalised_to_lowercase(self):
        resp = self.client.post(
            "/api/notes/", {"title": "N", "tags": ["Python", "WORK"]}, format="json"
        )
        self.assertEqual(sorted(resp.data["tags"]), ["python", "work"])

    def test_create_note_without_tags_returns_empty_list(self):
        resp = self.client.post("/api/notes/", {"title": "Plain"}, format="json")
        self.assertEqual(resp.data["tags"], [])

    def test_update_replaces_tags(self):
        note = Note.objects.create(title="N", user=self.user)
        tag = Tag.objects.create(user=self.user, name="old")
        note.tags.add(tag)
        resp = self.client.put(
            f"/api/notes/{note.id}/",
            {"title": "N", "content": "", "category": None, "tags": ["new"]},
            format="json",
        )
        self.assertEqual(resp.data["tags"], ["new"])

    def test_patch_without_tags_preserves_existing(self):
        note = Note.objects.create(title="N", user=self.user)
        tag = Tag.objects.create(user=self.user, name="keep")
        note.tags.add(tag)
        resp = self.client.patch(f"/api/notes/{note.id}/", {"title": "Updated"}, format="json")
        self.assertEqual(resp.data["tags"], ["keep"])

    def test_patch_with_empty_tags_clears_them(self):
        note = Note.objects.create(title="N", user=self.user)
        tag = Tag.objects.create(user=self.user, name="gone")
        note.tags.add(tag)
        resp = self.client.patch(f"/api/notes/{note.id}/", {"tags": []}, format="json")
        self.assertEqual(resp.data["tags"], [])

    def test_filter_notes_by_tag(self):
        tag = Tag.objects.create(user=self.user, name="python")
        n1 = Note.objects.create(title="Python note", user=self.user)
        n1.tags.add(tag)
        Note.objects.create(title="Other note", user=self.user)
        resp = self.client.get("/api/notes/?tag=python")
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["title"], "Python note")

    def test_duplicate_tag_reuses_existing(self):
        Tag.objects.create(user=self.user, name="python")
        self.client.post("/api/notes/", {"title": "A", "tags": ["python"]}, format="json")
        self.client.post("/api/notes/", {"title": "B", "tags": ["python"]}, format="json")
        self.assertEqual(Tag.objects.filter(user=self.user, name="python").count(), 1)

    def test_blank_tag_name_rejected(self):
        resp = self.client.post(
            "/api/notes/", {"title": "N", "tags": ["  "]}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
