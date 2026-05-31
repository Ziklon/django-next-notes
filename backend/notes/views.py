from django.db.models import Count
from rest_framework import viewsets

from .models import Category, Note
from .serializers import CategorySerializer, NoteSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """CRUD for categories, annotated with a live note count for the sidebar."""

    serializer_class = CategorySerializer
    queryset = Category.objects.annotate(note_count=Count("notes")).order_by("name")


class NoteViewSet(viewsets.ModelViewSet):
    """CRUD for notes.

    Supports ``?category=<id>`` filtering, ``?search=`` over title/content and
    ``?ordering=`` (defaults to most-recently-updated first).
    """

    serializer_class = NoteSerializer
    queryset = Note.objects.select_related("category").all()
    filterset_fields = ["category"]
    search_fields = ["title", "content"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-updated_at"]
