"""
Spin up a throwaway PostgreSQL container and expose its URL via DATABASE_URL
before Django reads settings, so dj_database_url.config() picks it up
naturally.  The django_db_setup fixture then runs migrations and yields.
"""
import atexit
import os

import pytest
from testcontainers.postgres import PostgresContainer

_pg = PostgresContainer("postgres:16-alpine")
_pg.start()
atexit.register(_pg.stop)

_db_url = (
    f"postgres://{_pg.username}:{_pg.password}"
    f"@{_pg.get_container_host_ip()}:{_pg.get_exposed_port(5432)}/{_pg.dbname}"
)

# Set before django.setup() so settings.py reads it via dj_database_url.
os.environ["DATABASE_URL"] = _db_url


@pytest.fixture(scope="session")
def django_db_setup(django_test_environment, django_db_blocker):
    from django.conf import settings
    from django.core.management import call_command
    from django.db import connections

    # In case settings was evaluated before DATABASE_URL was set, patch
    # directly.  Use update() to preserve Django-added keys (OPTIONS, TEST…).
    settings.DATABASES["default"].update(
        {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": _pg.dbname,
            "USER": _pg.username,
            "PASSWORD": _pg.password,
            "HOST": _pg.get_container_host_ip(),
            "PORT": _pg.get_exposed_port(5432),
            "CONN_MAX_AGE": 0,
        }
    )

    # Close any open sockets and evict the cached wrapper so the next access
    # builds a fresh one from the updated settings.
    connections.close_all()
    try:
        del connections["default"]
    except (KeyError, AttributeError):
        pass

    with django_db_blocker.unblock():
        call_command("migrate", verbosity=0)

    yield
