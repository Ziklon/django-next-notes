#!/usr/bin/env bash
set -e

# Wait for Postgres when DATABASE_URL points at the db service.
if [[ "${DATABASE_URL:-}" == *"@db:"* ]]; then
  echo "Waiting for Postgres..."
  until python -c "import socket; socket.create_connection(('db', 5432), 2)" 2>/dev/null; do
    sleep 1
  done
  echo "Postgres is up."
fi

echo "Applying migrations..."
python manage.py migrate --no-input

if [[ "${SEED_DB:-false}" == "true" ]]; then
  echo "Seeding database..."
  python manage.py seed
fi

exec "$@"
