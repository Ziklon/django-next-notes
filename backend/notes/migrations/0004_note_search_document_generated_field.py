"""
State-only migration: reclassify search_document from SearchVectorField to
GeneratedField so Django's ORM excludes it from INSERT/UPDATE statements.

The database column was already created as GENERATED ALWAYS AS STORED in
migration 0003 — no DDL is needed here.
"""
import django.contrib.postgres.search
import django.db.models.expressions
import django.db.models.functions
from django.contrib.postgres.search import SearchVector
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("notes", "0003_note_search_document"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AlterField(
                    model_name="note",
                    name="search_document",
                    field=models.GeneratedField(
                        db_persist=True,
                        expression=(
                            SearchVector("title", weight="A", config="english")
                            + SearchVector("content", weight="B", config="english")
                        ),
                        output_field=django.contrib.postgres.search.SearchVectorField(),
                    ),
                ),
            ],
        ),
    ]
