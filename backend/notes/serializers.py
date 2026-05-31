from rest_framework import serializers

from .models import Category, Note


class CategorySerializer(serializers.ModelSerializer):
    note_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "color", "note_count", "created_at"]
        read_only_fields = ["id", "created_at"]


class NoteSerializer(serializers.ModelSerializer):
    # Writable category id, plus a nested read-only representation for the UI.
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), allow_null=True, required=False
    )
    category_detail = CategorySerializer(source="category", read_only=True)

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "content",
            "category",
            "category_detail",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_title(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Title cannot be blank.")
        return value
