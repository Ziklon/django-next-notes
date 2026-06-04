from django.conf import settings
from django.contrib.postgres.search import SearchVector, SearchVectorField
from django.db import models


class Category(models.Model):
    """A grouping for notes (e.g. "School", "Personal").

    ``color`` is a hex value the frontend uses to tint note cards, keeping
    presentation data with the category instead of hard-coding it in the UI.
    """

    name = models.CharField(max_length=80, unique=True)
    color = models.CharField(max_length=7, default="#F4C77B")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Tag(models.Model):
    """A free-form label scoped to a single user."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tags",
    )
    name = models.CharField(max_length=50)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["user", "name"], name="unique_tag_per_user")
        ]

    def __str__(self) -> str:
        return self.name


class Note(models.Model):
    """A single note that optionally belongs to a category."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notes",
    )
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notes",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="notes")
    # PostgreSQL GENERATED ALWAYS AS STORED tsvector column (migration 0003).
    # Automatically updated by the database whenever title or content changes.
    # Backed by a GIN index for O(log n) full-text search.
    search_document = models.GeneratedField(
        expression=(
            SearchVector("title", weight="A", config="english")
            + SearchVector("content", weight="B", config="english")
        ),
        output_field=SearchVectorField(),
        db_persist=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Newest first - matches the board layout in the design.
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return self.title
