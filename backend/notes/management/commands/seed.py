"""Seed the database with sample data that mirrors the design prototype."""
from datetime import timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from notes.models import Category, Note, Tag

DEMO_EMAIL = "demo@notes.app"
DEMO_PASSWORD = "demo1234"

CATEGORIES = [
    {"name": "Random Thoughts", "color": "#F0A875"},
    {"name": "School", "color": "#F4CE7B"},
    {"name": "Personal", "color": "#9CB7AE"},
]

NOTES = [
    {
        "title": "Grocery List",
        "category": "Random Thoughts",
        "days_ago": 0,
        "content": "- Milk\n- Eggs\n- Bread\n- Bananas\n- Spinach",
        "tags": ["shopping", "home"],
    },
    {
        "title": "Meeting with Team",
        "category": "School",
        "days_ago": 1,
        "content": (
            "Discuss project timeline and milestones. Review budget and "
            "resource allocation. Address any blockers and plan next steps."
        ),
        "tags": ["work", "planning"],
    },
    {
        "title": "Note Title",
        "category": "School",
        "days_ago": 12,
        "content": "Note content...",
        "tags": [],
    },
    {
        "title": "Vacation Ideas",
        "category": "Random Thoughts",
        "days_ago": 13,
        "content": (
            "- Visit Bali for beaches and culture\n"
            "- Explore the historic sites in Rome\n"
            "- Go hiking in the Swiss Alps\n"
            "- Relax in the hot springs of Iceland"
        ),
        "tags": ["travel", "ideas"],
    },
    {
        "title": "Note Title",
        "category": "Personal",
        "days_ago": 14,
        "content": (
            "Lately, I've been on a quest to discover new books to read. "
            "I've come across several recommendations that have piqued my "
            'interest. "The Alchemist" by Paulo Coelho is at the top of my '
            "list, given its reputation as a life-changing read. I've also "
            'heard great things about "Educated" by Tara Westover and '
            '"Becoming" by Michelle Obama. Each of these promises a unique '
            "perspective worth exploring."
        ),
    },
    {
        "title": (
            "A Deep and Contemplative Personal Reflection on the "
            "Multifaceted and Ever-Evolving Journey of Life"
        ),
        "category": "Random Thoughts",
        "days_ago": 15,
        "content": (
            "Life has been a whirlwind of events and emotions lately. "
            "I've been juggling work, relationships, and personal growth, "
            "and it's given me a lot to reflect on."
        ),
    },
    {
        "title": "Project X Updates",
        "category": "School",
        "days_ago": 16,
        "content": (
            "Finalized design mockups and received approval from stakeholders. "
            "Began development on the front-end. Backend integration is "
            "scheduled for next week. Team is on track to meet the deadline."
        ),
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample categories and notes."

    def add_arguments(self, parser):
        parser.add_argument(
            "--fresh",
            action="store_true",
            help="Delete existing notes and categories before seeding.",
        )

    def handle(self, *args, **options):
        if options["fresh"]:
            Note.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write("Cleared existing data.")

        demo_user, created_user = User.objects.get_or_create(
            username=DEMO_EMAIL,
            defaults={"email": DEMO_EMAIL},
        )
        if created_user:
            demo_user.set_password(DEMO_PASSWORD)
            demo_user.save()
            self.stdout.write(f"Created demo user: {DEMO_EMAIL} / {DEMO_PASSWORD}")

        cats = {}
        for c in CATEGORIES:
            obj, _ = Category.objects.get_or_create(
                name=c["name"], defaults={"color": c["color"]}
            )
            obj.color = c["color"]
            obj.save()
            cats[c["name"]] = obj

        now = timezone.now()
        created = 0
        for n in NOTES:
            note, was_created = Note.objects.get_or_create(
                title=n["title"],
                category=cats[n["category"]],
                user=demo_user,
                defaults={"content": n["content"]},
            )
            if was_created:
                ts = now - timedelta(days=n["days_ago"])
                Note.objects.filter(pk=note.pk).update(created_at=ts, updated_at=ts)
                for tag_name in n.get("tags", []):
                    tag, _ = Tag.objects.get_or_create(user=demo_user, name=tag_name)
                    note.tags.add(tag)
                created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete: {len(cats)} categories, {created} new notes."
            )
        )
