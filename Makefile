SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

E2E_COMPOSE := docker compose -p setup-monorepo-e2e -f docker-compose.yml -f docker-compose.e2e.yml

.PHONY: install up down lint test test-tooling e2e e2e-serve backend frontend

install:
	cd backend && uv sync --locked
	pnpm install --frozen-lockfile
	uv run --project backend pre-commit install

up:
	docker compose up -d

down:
	docker compose down

lint:
	cd backend && uv run ruff check .
	cd backend && uv run ruff format --check .
	pnpm --filter frontend lint
	pnpm --filter frontend format:check
	pnpm --filter frontend typecheck

test:
	cd backend && uv run pytest
	pnpm --filter frontend test

test-tooling:
	cd backend && uv run pytest -m tooling
	pnpm --filter frontend test:tooling

e2e:
	pnpm --filter e2e exec playwright install chromium
	trap '$(E2E_COMPOSE) down -v' EXIT; \
	$(E2E_COMPOSE) up -d --build --wait; \
	E2E_BASE_URL=http://localhost:13000 pnpm --filter e2e exec playwright test

e2e-serve:
	trap '$(E2E_COMPOSE) down -v' EXIT; \
	trap 'exit 143' TERM; \
	trap 'exit 130' INT; \
	$(E2E_COMPOSE) up --build

backend:
	cd backend && uv run python manage.py runserver

frontend:
	pnpm --filter frontend dev
