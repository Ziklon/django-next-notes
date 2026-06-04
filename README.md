# Notes App — Full Stack Challenge

A monorepo notes board application built with a **Django + Django REST Framework** backend and a **Next.js (App Router) + TypeScript + Tailwind CSS** frontend. It reproduces a warm-cream design prototype with color-coded note cards, category filtering, and a full-screen markdown editor.

## Features

- **CRUD Notes** — create, read, update, and delete notes with title and markdown content
- **Categories** — organize notes into color-coded categories managed from the database
- **Tags** — free-form, per-user tags on notes; chip input in the editor, filter from the sidebar
- **Category & Tag Filtering** — sidebar with live note counts; click to filter the board
- **Full-Screen Editor** — opens on click with a category dropdown, tag input, "Last Edited" timestamp, and autosave on blur/close
- **Markdown Support** — GitHub-flavored markdown with emoji shortcodes (`:tada:`) via `react-markdown` + `remark-gfm` + `remark-emoji`
- **Masonry Layout** — CSS-column staggered card grid with no JS layout library
- **Full-Text Search** — Postgres `tsvector` GIN index with prefix matching (`backen` finds "backend"); results ranked by relevance
- **User Authentication** — JWT-based register/login with per-user note scoping
- **Dark Mode** — toggleable via the user menu; preference persisted in `localStorage`
- **API Documentation** — auto-generated OpenAPI 3.0 schema via `drf-spectacular`; Swagger UI + ReDoc served at `/api/schema/`
- **Structured Request Logging** — every `/api/` request emits a JSON log line with trace ID, user, method, path, status, and duration
- **Django Admin** — built-in admin panel for managing notes, categories, and tags

## Tech Stack

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Backend    | Django 5.2 LTS, Django REST Framework, django-filter, CORS   |
| Runtime    | Python 3.13 (`.python-version`, Docker `python:3.13-slim`)   |
| Database   | PostgreSQL (default); driven by `DATABASE_URL`               |
| Frontend   | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3 |
| Testing    | Django `APITestCase` (backend), Jest + React Testing Library  |
| Tooling    | uv (Python deps), pnpm 9 (JS deps), Docker / docker-compose  |

## Repository Structure

```
django-next-notes/
├── backend/                    # Django + DRF API
│   ├── config/                 # project settings, urls, wsgi
│   ├── notes/                  # models, serializers, views, tests
│   │   └── management/commands/seed.py  # sample data matching the design
│   ├── Dockerfile
│   ├── entrypoint.sh           # Docker startup script (migrate + seed + serve)
│   ├── pyproject.toml          # uv-managed dependencies
│   └── .env.example
├── frontend/                   # Next.js app
│   └── src/
│       ├── app/                # App Router entry (layout, page, globals.css)
│       ├── components/         # BoardHeader, NotesGrid, Sidebar, NoteCard,
│       │                       # NoteView, NoteToolbar, NoteEditor, NotePreview,
│       │                       # CategorySelect, TagInput, Markdown
│       ├── hooks/              # useNotesBoard, useNoteEditor (state + logic)
│       └── lib/                # typed API client, types, date helpers
├── docker-compose.yml          # Postgres + backend + frontend, one command
├── docker-compose.override.yml # hot-reload overrides (volume mounts + runserver)
├── Makefile                    # common dev commands
└── README.md
```

## Architecture

```mermaid
graph TD
    Browser["🌐 Browser"]

    subgraph Frontend["Next.js — localhost:3000"]
        AuthCtx["AuthContext\nJWT tokens"]
        BoardCtx["BoardContext\nshared board state"]
        Hooks["useNotesBoard · useNoteEditor · useTheme"]
        UI["Components\nBoardHeader · Sidebar · NotesGrid\nNoteView · NoteCard · SearchBar · UserMenu"]
    end

    subgraph Backend["Django + DRF — localhost:8000"]
        Auth["accounts/\nregister · login · refresh"]
        Notes["notes/\nNoteViewSet · CategoryViewSet · TagViewSet"]
        Search["_build_search_query\nprefix + full-text"]
        Middleware["TraceIdMiddleware → RequestTimingMiddleware\nX-Trace-Id · X-Response-Time-ms · JSON logs"]
        Docs["drf-spectacular\n/api/schema/ · swagger · redoc"]
    end

    subgraph DB["PostgreSQL"]
        NoteTable["notes_note\nsearch_document tsvector"]
        GIN["GIN index\nO(log n) search"]
    end

    Browser -->|"HTTP + JWT Bearer"| Frontend
    AuthCtx -->|"fetch /api/auth/"| Auth
    Hooks -->|"fetch /api/notes/ · /api/categories/ · /api/tags/"| Notes
    Notes --> Search
    Search -->|"@@ tsquery"| GIN
    GIN --- NoteTable
    Frontend --> BoardCtx
    BoardCtx --> Hooks
    Hooks --> UI
    Backend --> Middleware
```

```
Browser
  │
  ▼
Next.js (App Router)                        localhost:3000
  ├── app/                                  layout, auth pages
  ├── contexts/
  │   ├── AuthContext      JWT tokens, login/signup/logout
  │   └── BoardContext     shared board state (notes, categories, tags, editing)
  ├── hooks/
  │   ├── useNotesBoard    data fetching, category/tag filtering, CRUD operations
  │   ├── useNoteEditor    per-note form state, autosave, tag management, mode toggle
  │   └── useTheme         dark mode toggle + localStorage persistence
  └── components/
      ├── BoardHeader      layout only — composes SearchBar + UserMenu + New Note
      ├── SearchBar        debounced input → URL param → API query
      ├── UserMenu         profile dropdown (dark mode toggle, logout)
      ├── Sidebar          categories + tags with live note counts; click to filter
      ├── NotesGrid        masonry card grid
      ├── NoteCard         single card (color from category, tag chips)
      ├── NoteView         full-screen overlay
      ├── NoteToolbar      category picker, tag input, preview/edit toggle, delete, close
      ├── TagInput         chip-based free-form tag editor
      ├── NoteEditor       title + content inputs
      └── NotePreview      markdown renderer
  │
  │  HTTP + JWT Bearer token
  ▼
Django + DRF                                localhost:8000
  ├── config/
  │   ├── settings.py      env-driven config (DATABASE_URL, JWT, CORS, drf-spectacular)
  │   └── middleware.py    TraceIdMiddleware → RequestTimingMiddleware → JSON logs
  ├── accounts/            register / login / token refresh endpoints
  └── notes/
      ├── models.py        Category, Tag (per-user), Note (tags M2M, search_document)
      ├── serializers.py   TagNamesField, category_detail + tags on Note responses
      ├── views.py         NoteViewSet · CategoryViewSet · TagViewSet
      │                    ?tag= filter, prefetch_related("tags")
      └── management/
          └── seed.py      idempotent sample data loader (with tags)
  │
  ▼
PostgreSQL                                  port 5432
  ├── notes_tag                             per-user tags (unique constraint user+name)
  ├── notes_note_tags                       Note ↔ Tag M2M join table
  ├── notes_note.search_document            GENERATED ALWAYS AS STORED tsvector
  └── notes_note_search_document_gin        GIN index for O(log n) search
```

### Request flow — search

```
User types "project backen"
  → SearchBar debounces 500 ms
  → URL: /?search=project+backen
  → useNotesBoard calls GET /api/notes/?search=project+backen
  → _build_search_query splits words:
      completed = ["project"]  → SearchQuery("project", type="plain")
      last      = "backen"     → SearchQuery("backen:*", type="raw")
      combined  = full_query & prefix_query
  → WHERE search_document @@ (to_tsquery('english','project') && to_tsquery('english','backen:*'))
  → GIN index lookup → ranked results
  → JSON response → NotesGrid re-renders
```

### Auth flow

```
POST /api/auth/register/  or  /api/auth/login/
  → returns { access, refresh }
  → stored in cookies (auth.ts)
  → every API request sends Authorization: Bearer <access>
  → on 401 → silent refresh via /api/auth/token/refresh/
  → on refresh failure → redirect to /login
```

## Quick Start (Docker — Recommended)

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

Starts Postgres, runs migrations, seeds sample data, and serves:

| Service       | URL                                        |
| ------------- | ------------------------------------------ |
| Frontend      | http://localhost:3000                      |
| API           | http://localhost:8000/api                  |
| Admin         | http://localhost:8000/admin                |
| Swagger UI    | http://localhost:8000/api/schema/swagger/  |
| ReDoc         | http://localhost:8000/api/schema/redoc/    |
| OpenAPI JSON  | http://localhost:8000/api/schema/          |

Admin credentials when seeded: **admin / admin**

Demo user (seeded for the notes board): **demo@notes.app / demo1234**

## Makefile Shortcuts

```bash
make start          # build + run the full stack via Docker
make down           # stop and remove the stack
make test           # run backend + frontend test suites
make migrate        # apply migrations (local, non-Docker)
make seed           # load sample notes (local)
make help           # list all available targets
```

## Manual Setup

Requires a running Postgres instance. Run `docker compose up db -d` to start just the database, then:

### Backend

```bash
make backend-install                              # create .venv and install Python deps
make migrate                                      # apply database migrations
make seed                                         # optional: load sample notes
cd backend && uv run python manage.py runserver   # http://localhost:8000
```

### Frontend

```bash
make frontend-install                             # install JS deps
cd frontend && pnpm dev                           # http://localhost:3000
```

## Environment Variables

### Backend (`backend/.env.example`)

| Variable                | Default                                        | Description                         |
| ----------------------- | ---------------------------------------------- | ----------------------------------- |
| `DJANGO_SECRET_KEY`     | `change-me-in-production`                      | Django secret key                   |
| `DJANGO_DEBUG`          | `True`                                         | Debug mode                          |
| `DJANGO_ALLOWED_HOSTS`  | `localhost,127.0.0.1,0.0.0.0`                 | Comma-separated allowed hosts       |
| `CORS_ALLOWED_ORIGINS`  | `http://localhost:3000,http://127.0.0.1:3000`  | CORS origins for the frontend       |
| `DATABASE_URL`          | _(unset — uses SQLite)_                        | Postgres connection string          |
| `SEED_DB`               | _(unset)_                                      | Set to `true` to auto-seed on start |

### Frontend (`frontend/.env.local.example`)

| Variable               | Default                        | Description      |
| ---------------------- | ------------------------------ | ---------------- |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:8000/api`    | Backend API base URL |

## API Reference

Interactive documentation is available once the stack is running:

- **Swagger UI** — http://localhost:8000/api/schema/swagger/
- **ReDoc** — http://localhost:8000/api/schema/redoc/
- **OpenAPI 3.0 schema** (JSON/YAML) — http://localhost:8000/api/schema/

All endpoints except the auth ones require a `Bearer <access_token>` header.

| Method             | Endpoint                    | Auth | Description                           |
| ------------------ | --------------------------- | ---- | ------------------------------------- |
| `GET`              | `/api/health/`              | No   | Liveness probe                        |
| `POST`             | `/api/auth/register/`       | No   | Create account → returns JWT tokens   |
| `POST`             | `/api/auth/login/`          | No   | Login → returns JWT tokens            |
| `POST`             | `/api/auth/token/refresh/`  | No   | Refresh access token                  |
| `GET` / `POST`     | `/api/categories/`          | Yes  | List (with `note_count`) / create     |
| `GET/PUT/PATCH/DEL`| `/api/categories/{id}/`     | Yes  | Retrieve / update / delete            |
| `GET` / `POST`     | `/api/tags/`                | Yes  | List user's tags (with `note_count`) / create |
| `GET/PUT/PATCH/DEL`| `/api/tags/{id}/`           | Yes  | Retrieve / update / delete            |
| `GET` / `POST`     | `/api/notes/`               | Yes  | List (scoped to user) / create        |
| `GET/PUT/PATCH/DEL`| `/api/notes/{id}/`          | Yes  | Retrieve / update / delete            |

Notes query params: `?category=<id>`, `?tag=<name>`, `?search=<text>` (prefix + full-text), `?ordering=updated_at|created_at|title`.

Responses are paginated (`{ count, next, previous, results }`, default page size 50).

Every `/api/` request is timed — logged to console as `METHOD path -> status (X.XX ms)` and returned in the `X-Response-Time-ms` response header.

## Data Models

### Category

| Field        | Type        | Notes                             |
| ------------ | ----------- | --------------------------------- |
| `id`         | integer     | auto                              |
| `name`       | string(80)  | unique                            |
| `color`      | string(7)   | hex color, default `#F4C77B`      |
| `created_at` | datetime    | auto                              |
| `note_count` | integer     | annotated read-only field         |

### Note

| Field             | Type        | Notes                                                      |
| ----------------- | ----------- | ---------------------------------------------------------- |
| `id`              | integer     | auto                                                       |
| `user`            | FK          | `CASCADE` on user delete; scopes all queries               |
| `title`           | string(255) | required                                                   |
| `content`         | text        | markdown, optional                                         |
| `category`        | FK          | `SET_NULL` on category delete                              |
| `search_document` | tsvector    | `GENERATED ALWAYS AS STORED`; weighted A/B; GIN indexed    |
| `created_at`      | datetime    | auto                                                       |
| `updated_at`      | datetime    | auto, default ordering (`-updated_at`)                     |

The serializer exposes both `category` (writable PK) and `category_detail` (nested read-only) so the client renders color/name without an extra request. Tags are exposed as a sorted list of name strings (`["python", "work"]`); writing accepts the same format and auto-creates tags that don't exist. PATCH without `tags` preserves existing tags; PATCH with `"tags": []` clears them.

### Tag

| Field        | Type        | Notes                                  |
| ------------ | ----------- | -------------------------------------- |
| `id`         | integer     | auto                                   |
| `user`       | FK          | `CASCADE` on user delete; user-scoped  |
| `name`       | string(50)  | normalised to lowercase; unique per user |
| `note_count` | integer     | annotated read-only field              |

## Tests

```bash
make test            # run backend + frontend suites with coverage
make test-backend    # backend only (pytest + coverage, 95% minimum enforced)
make test-frontend   # frontend only (Jest + coverage, 95% minimum enforced)
```

## Key Design Decisions

- **Monorepo** — backend and frontend in one repo for a single source of truth and a one-command Docker setup, while staying cleanly separated so either could be deployed independently.
- **Category colour on the model** — each `Category` stores a hex `color`, so card tints and sidebar dots are data-driven; adding a category needs no frontend change.
- **`note_count` annotated in the queryset** — `Count("notes")` keeps the sidebar a single query instead of N+1.
- **Environment-driven database** — `dj-database-url` reads `DATABASE_URL`; defaults to a local Postgres instance matching the docker-compose credentials.
- **`on_delete=SET_NULL`** — deleting a category keeps its notes rather than cascading.
- **Full-text search with prefix matching** — `search_document` is a `GENERATED ALWAYS AS STORED` tsvector (title weight A, content weight B) backed by a GIN index. Queries combine full stemming for completed words and `:*` prefix for the last word, so "backen" matches "backend" without a sequential scan.
- **Single Responsibility components** — `BoardHeader` composes `SearchBar`, `UserMenu`, and the New Note button; each has its own test file.
- **CSS variable theming** — all colors are CSS variables in `globals.css`; dark mode flips them via `[data-theme="dark"]`, so every component adapts without per-component overrides.
- **Thin, typed API client** — `src/lib/api.ts` centralises fetch logic and error handling; components stay presentational.
- **Hooks/components split** — state and side effects live in `useNotesBoard`, `useNoteEditor`, and `useTheme`; components are thin and independently testable.
- **CSS-column masonry** — reproduces the staggered card layout without a JS layout library.
- **Autosave** — note changes save on blur and on editor close; creating a note skips empty titles and promotes a new note to an existing one on first save.
- **Tags as free-form strings on the wire** — the API accepts and returns tags as `["python", "work"]` rather than PKs, auto-creating `Tag` rows via `get_or_create`. This keeps the client simple and avoids a separate tag-fetch before editing.
- **Per-user tag namespace** — `Tag` has a `UniqueConstraint(user, name)`, so two users can both have a "work" tag without collision. Tags are scoped the same way notes are.
- **`TagNamesField` custom DRF field** — DRF's built-in `ListField` iterates the value directly and cannot handle a M2M `ManyRelatedManager`. A thin custom field calls `.values_list("name", flat=True)` on read and returns plain strings on write, keeping the serializer simple.
- **Trace ID middleware** — `TraceIdMiddleware` runs first in the stack, propagating or generating a UUID4 per request. `RequestTimingMiddleware` reads it to enrich the structured JSON log line, so every request is traceable across logs.
- **OpenAPI schema via `drf-spectacular`** — auto-generates an OpenAPI 3.0 spec from DRF viewsets. Swagger UI and ReDoc are served at runtime, so the docs are always in sync with the code.
- **Hot-reload via `docker-compose.override.yml`** — source folders are volume-mounted into containers; the backend switches to `runserver` and the frontend uses `WATCHPACK_POLLING=true` for reliable change detection on macOS. The override is auto-merged by Docker Compose and ignored in production deploys that pass `-f docker-compose.yml` explicitly.
- **Request timing middleware** — logs and exposes response time on every API call for quick inspection.
- **Test coverage** — backend 100% coverage (pytest + testcontainers); frontend 95%+ across statements, branches, functions, and lines.
