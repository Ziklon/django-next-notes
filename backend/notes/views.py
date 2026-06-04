from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db.models import Count, Q
from rest_framework import viewsets

from .models import Category, Note, Tag
from .serializers import CategorySerializer, NoteSerializer, TagSerializer


def _build_search_query(search: str) -> SearchQuery:
    """
    Build a tsquery that combines full stemming for completed words with a
    prefix match on the last (possibly incomplete) word:

        "project backen" →
            to_tsquery('english', 'project') && to_tsquery('english', 'backen:*')

    This lets the GIN index handle both halves while giving search-as-you-type
    behaviour for the word currently being typed.
    """
    words = search.split()
    *completed, last = words

    prefix_query = SearchQuery(f"{last}:*", search_type="raw", config="english")

    if not completed:
        return prefix_query

    full_query = SearchQuery(
        " & ".join(completed), search_type="plain", config="english"
    )
    return full_query & prefix_query


class CategoryViewSet(viewsets.ModelViewSet):
    """CRUD for categories, annotated with a live note count for the sidebar."""

    serializer_class = CategorySerializer

    def get_queryset(self):
        user_note_count = Count("notes", filter=Q(notes__user=self.request.user))
        return Category.objects.annotate(note_count=user_note_count).order_by("name")


class TagViewSet(viewsets.ModelViewSet):
    """CRUD for tags scoped to the authenticated user, with note counts."""

    serializer_class = TagSerializer

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user).annotate(
            note_count=Count("notes", filter=Q(notes__user=self.request.user))
        ).order_by("name")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NoteViewSet(viewsets.ModelViewSet):
    """CRUD for notes scoped to the authenticated user.

    Full-text search uses the pre-computed ``search_document`` tsvector column
    (GENERATED ALWAYS AS STORED, backed by a GIN index) so searches are
    O(log n) against the index rather than a sequential scan.
    Results are ranked by relevance: title matches (weight A) score higher
    than content matches (weight B).
    """

    serializer_class = NoteSerializer
    filterset_fields = ["category"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        qs = (
            Note.objects.filter(user=self.request.user)
            .select_related("category")
            .prefetch_related("tags")
        )

        tag = self.request.query_params.get("tag", "").strip()
        if tag:
            qs = qs.filter(tags__name=tag)

        search = self.request.query_params.get("search", "").strip()
        if not search:
            return qs

        query = _build_search_query(search)
        return (
            qs.filter(search_document=query)
            .annotate(rank=SearchRank("search_document", query))
            .order_by("-rank")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
