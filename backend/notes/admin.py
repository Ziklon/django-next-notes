from django.contrib import admin

from .models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "color", "created_at")
    search_fields = ("name",)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "updated_at")
    list_filter = ("category",)
    search_fields = ("title", "content")
