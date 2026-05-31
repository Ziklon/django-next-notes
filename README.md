# Notes App — Turbo AI Full Stack Challenge

A small notes application built as a monorepo: a **Django + Django REST Framework**
API and a **Next.js (App Router) + TypeScript + Tailwind** frontend that reproduces
the provided design prototype.

This first iteration focuses on a single page — the notes board — with full CRUD
for notes, category filtering, and a sidebar of categories with live note counts.

> The UI reproduces the provided design prototype: a warm cream board with
> colour-coded note cards in a masonry layout and a category sidebar.

## Tech stack

| Layer     | Choice                                                        |
| --------- | ------------------------------------------------------------- |
| Backend   | Django 5.2 LTS, Django REST Framework, django-filter, CORS    |
| Runtime   | Python 3.13 (`.python-version`, Docker `python:3.13-slim`)     |
| Database  | SQLite by default; Postgres via `DATABASE_URL` (docker)       |
| Frontend  | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3 |
| Testing   | Django `APITestCase` (backend), Jest + React Testing Library  |
| Tooling   | uv (Python deps), pnpm (JS deps), Docker / docker-compose     |

## Repository structure

```
NotesApp/
├── backend/                # Django + DRF API
│   ├── config/             # project settings, urls, wsgi
│   ├── notes/              # the notes app: models, serializers, views, tests
│   │   └── management/commands/seed.py   # sample data matching the design
│   ├── Dockerfile
│   ├── pyproject.toml      # uv-managed dependencies
│   └── uv.lock
├── frontend/               # Next.js app
│   └── src/
│       ├── app/            # App Router entry (layout, page, globals.css)
│       ├── components/     # presentational: BoardHeader, NotesGrid, Sidebar,
│       │                   #   NoteCard, NoteView, NoteToolbar, NoteEditor,
│       │                   #   NotePreview, CategorySelect, Markdown
│       ├── hooks/          # useNotesBoard, useNoteEditor (state + logic)
│       └── lib/            # typed API client, types, date helpers
├── docker-compose.yml      # Postgres + backend + frontend, one command
└── README.md
```

## Quick start (Docker — recommended)

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

This starts Postgres, runs migrations, seeds sample data, and serves:

- Frontend: http://localhost:3000
- API:      http://localhost:8000/api
- Admin:    http://localhost:8000/admin

## Make shortcuts

A `Makefile` wraps the common commands:

```bash
make start          # build + run the full stack via Docker
make down           # stop and remove the stack
make test           # run backend + frontend test suites
make help           # list all available targets
```

## Manual setup

### Backend

Dependencies are managed with [uv](https://docs.astral.sh/uv/).

```bash
cd backend
uv sync                              # create .venv and install from uv.lock
uv run python manage.py migrate
uv run python manage.py seed         # optional: load sample notes
uv run python manage.py runserver    # http://localhost:8000
```

By default this uses SQLite. To use Postgres, set `DATABASE_URL`
(e.g. `export DATABASE_URL=postgres://user:pass@localhost:5432/notes`).

### Frontend

```bash
cd frontend
pnpm install
pnpm dev                       # http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL` if the API is not at `http://localhost:8000/api`.

## API

| Method            | Endpoint               | Description                          |
| ----------------- | ---------------------- | ------------------------------------ |
| GET               | `/api/health/`         | Liveness probe                       |
| GET / POST        | `/api/categories/`     | List (with `note_count`) / create    |
| GET/PUT/PATCH/DEL | `/api/categories/{id}/`| Retrieve / update / delete           |
| GET / POST        | `/api/notes/`          | List / create                        |
| GET/PUT/PATCH/DEL | `/api/notes/{id}/`     | Retrieve / update / delete           |

Notes support query params: `?category=<id>`, `?search=<text>`,
`?ordering=updated_at|created_at|title`.

## Tests

```bash
# Backend (models, API, seed, middleware, serializer validation)
cd backend && uv run python manage.py test

# Backend coverage (coverage.py, enforced 95% min via fail_under)
cd backend && uv run coverage run manage.py test && uv run coverage report

# Frontend (Jest + RTL: components, hooks, API client, helpers)
cd frontend && pnpm test

# Frontend coverage (enforced: 95% min on lines/branches/funcs/stmts)
cd frontend && pnpm test:coverage
```

## Key design & technical decisions

- **Monorepo.** Backend and frontend live in one repo for a single source of
  truth and a one-command Docker setup, while staying cleanly separated so
  either could be deployed independently.
- **Category colour lives on the model.** Each `Category` stores a hex `color`,
  so card tints and sidebar dots are data-driven rather than hard-coded in the
  UI — adding a category needs no frontend change.
- **`note_count` is annotated in the queryset** (`Count("notes")`) instead of
  computed per-row, keeping the sidebar a single query.
- **Database is environment-driven.** `dj-database-url` means the same code runs
  on SQLite (zero-config local review) and Postgres (docker / production) by
  toggling `DATABASE_URL`.
- **Serializer exposes both `category` (writable id) and `category_detail`
  (nested read-only)** so the client can render colour/name without an extra
  request while still posting a simple id.
- **Thin, typed API client** (`src/lib/api.ts`) centralises fetch logic and
  error handling; components stay focused on presentation and local state.
- **CSS-column masonry** reproduces the staggered card board without a JS layout
  library.
- **Single-responsibility components.** UI state and side effects live in hooks (`useNotesBoard`, `useNoteEditor`); the components are thin and presentational (`BoardHeader`, `NotesGrid`, `NoteToolbar`, `NoteEditor`, `NotePreview`). This keeps each unit small and independently testable — the hooks are tested with `renderHook`, the components in isolation.
- **Markdown + emoji content.** Notes render as GitHub-flavored markdown (`react-markdown` + `remark-gfm`) on the board cards and in the note view, with a Write/Preview toggle. Emoji shortcodes like `:tada:` are supported via `remark-emoji` (literal emoji work too). In unit tests `react-markdown` is mocked (it is ESM-only); real rendering is covered by the production build.
- **Full-screen note view with autosave.** Opening or creating a note shows a full-screen editor (matching the prototype) with a category dropdown and a “Last Edited” timestamp. Changes save automatically on blur and on close (no Save button); creating skips empty-title notes, and the first save turns a new note into an editable existing one.
- **Request timing middleware** logs every `/api/` call as `METHOD path -> status (X.XX ms)` and adds an `X-Response-Time-ms` response header for quick client-side inspection.
- **`on_delete=SET_NULL`** for a note's category — deleting a category keeps its
  notes rather than cascading them away.

## How AI tools were used

This project was built with AI assistance (Anthropic's Claude):

- **Scaffolding & boilerplate:** generating the Django app, DRF serializers/
  viewsets, the Next.js component tree, and Docker/compose configuration.
- **Test authoring:** drafting the backend `APITestCase` suite and the Jest +
  React Testing Library tests, then iterating until green.
- **Design translation:** turning the prototype screenshot into the colour
  palette, typography, and masonry layout.
- **Review:** sanity-checking edge cases (blank-title validation, category
  deletion behaviour, pagination handling in the client).

All generated code was reviewed, run, and verified locally (migrations applied,
both test suites passing, production build succeeding) before being committed.

## Possible next steps

Multi-page support (note detail/edit routes), authentication and per-user notes,
optimistic UI updates, full-text search UI, and CI running both test suites.
# django-next-notes
