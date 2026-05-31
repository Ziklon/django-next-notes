# Notes backend

Django + Django REST Framework API for the Notes app. Dependencies are managed
with [uv](https://docs.astral.sh/uv/). See the repository root `README.md` for
full setup, Docker, and Make commands.

```bash
uv sync                              # create .venv and install deps
uv run python manage.py migrate
uv run python manage.py seed
uv run python manage.py runserver
uv run python manage.py test
```
