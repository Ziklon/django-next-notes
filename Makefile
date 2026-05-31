# Notes App - common developer commands
# Usage: make <target>

.PHONY: help start up down build logs test test-backend test-frontend e2e \
        migrate seed backend-install frontend-install e2e-install clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

## ---- Docker (recommended) ----
start: ## Build and start the full stack (Postgres + API + frontend)
	docker compose up --build

up: ## Start the stack in the background
	docker compose up --build -d

down: ## Stop and remove the stack
	docker compose down

build: ## Build all images
	docker compose build

logs: ## Tail logs from all services
	docker compose logs -f

## ---- Tests ----
test: test-backend test-frontend ## Run backend and frontend test suites

test-backend: ## Run Django tests with coverage (fails under 95%)
	cd backend && uv run coverage run manage.py test
	cd backend && uv run coverage report

test-frontend: ## Run Jest tests with coverage (installs deps if needed)
	cd frontend && [ -d node_modules ] || pnpm install
	cd frontend && pnpm test:coverage

e2e: ## Run Playwright end-to-end tests (starts the Docker stack automatically)
	cd e2e && [ -d node_modules ] || pnpm install
	cd e2e && pnpm test

e2e-install: ## Install Playwright and browsers
	cd e2e && pnpm install
	cd e2e && pnpm exec playwright install chromium

## ---- Backend helpers (local, non-Docker) ----
migrate: ## Apply database migrations
	cd backend && uv run python manage.py migrate

seed: ## Load sample notes and categories
	cd backend && uv run python manage.py seed

backend-install: ## Install backend dependencies (uv)
	cd backend && uv sync

## ---- Frontend helpers ----
frontend-install: ## Install frontend dependencies
	cd frontend && pnpm install

clean: ## Remove local build artifacts and the SQLite db
	rm -rf frontend/.next backend/db.sqlite3 backend/staticfiles
	find backend -type d -name __pycache__ -prune -exec rm -rf {} +
