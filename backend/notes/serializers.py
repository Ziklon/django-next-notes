from rest_framework import serializers

from .models import Category, Note, Tag


class CategorySerializer(serializers.ModelSerializer):
    note_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "color", "note_count", "created_at"]
        read_only_fields = ["id", "created_at"]


class TagSerializer(serializers.ModelSerializer):
    note_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Tag
        fields = ["id", "name", "note_count"]
        read_only_fields = ["id"]

    def validate_name(self, value: str) -> str:
        return value.strip().lower()


class TagNamesField(serializers.Field):
    """Serialize a Note's tags M2M as a sorted list of name strings.

    Reads from the M2M manager via .values_list(); writes accept a list of
    strings. Validation (strip, lowercase, blank check) runs in the serializer's
    validate_tags method so it can be unit-tested independently.
    """

    def to_representation(self, value):
        return sorted(value.values_list("name", flat=True))

    def to_internal_value(self, data):
        if not isinstance(data, list):
            raise serializers.ValidationError("Expected a list of tag names.")
        return data


class NoteSerializer(serializers.ModelSerializer):
    # Writable category id, plus a nested read-only representation for the UI.
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), allow_null=True, required=False
    )
    category_detail = CategorySerializer(source="category", read_only=True)
    tags = TagNamesField(required=False)

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "content",
            "category",
            "category_detail",
            "tags",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_tags(self, value: list) -> list:
        cleaned = []
        for name in value:
            stripped = name.strip().lower()
            if not stripped:
                raise serializers.ValidationError("Tag names cannot be blank.")
            cleaned.append(stripped)
        return cleaned

    def _sync_tags(self, instance, tag_names):
        user = self.context["request"].user
        tags = [Tag.objects.get_or_create(user=user, name=name)[0] for name in tag_names]
        instance.tags.set(tags)

    def create(self, validated_data):
        tag_names = validated_data.pop("tags", [])
        instance = super().create(validated_data)
        self._sync_tags(instance, tag_names)
        return instance

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tags", None)
        instance = super().update(instance, validated_data)
        if tag_names is not None:
            self._sync_tags(instance, tag_names)
        return instance

    def validate_title(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Title cannot be blank.")
        return value
