from django.db.models import Count, Q
from rest_framework import viewsets

from .models import Category, Note
from .serializers import CategorySerializer, NoteSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """CRUD for categories, annotated with a live note count for the sidebar."""

    serializer_class = CategorySerializer

    def get_queryset(self):
        user_note_count = Count("notes", filter=Q(notes__user=self.request.user))
        return Category.objects.annotate(note_count=user_note_count).order_by("name")


class NoteViewSet(viewsets.ModelViewSet):
    """CRUD for notes scoped to the authenticated user."""

    serializer_class = NoteSerializer
    filterset_fields = ["category"]
    search_fields = ["title", "content"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).select_related("category")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
