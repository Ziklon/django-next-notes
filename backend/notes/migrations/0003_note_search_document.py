"""
Add a PostgreSQL GENERATED ALWAYS AS STORED tsvector column (search_document)
to notes_note, backed by a GIN index for fast full-text search.

The column is computed automatically by PostgreSQL whenever title or content
changes — no application-level trigger or signal is needed.

SeparateDatabaseAndState is used so the raw SQL that creates the generated
column is kept separate from the Django migration state that tells the ORM
the field exists.
"""
import django.contrib.postgres.search
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("notes", "0002_add_user_to_note"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            # --- What actually runs on the database ---
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        ALTER TABLE notes_note
                            ADD COLUMN search_document tsvector
                            GENERATED ALWAYS AS (
                                setweight(to_tsvector('english', coalesce(title,   '')), 'A') ||
                                setweight(to_tsvector('english', coalesce(content, '')), 'B')
                            ) STORED;

                        CREATE INDEX notes_note_search_document_gin
                            ON notes_note
                            USING GIN (search_document);
                    """,
                    reverse_sql="""
                        DROP INDEX IF EXISTS notes_note_search_document_gin;
                        ALTER TABLE notes_note DROP COLUMN IF EXISTS search_document;
                    """,
                ),
            ],
            # --- What Django's migration state records ---
            state_operations=[
                migrations.AddField(
                    model_name="note",
                    name="search_document",
                    field=django.contrib.postgres.search.SearchVectorField(
                        null=True, editable=False
                    ),
                ),
            ],
        ),
    ]
