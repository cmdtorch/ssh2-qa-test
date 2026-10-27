# Tasks

Every test that comes from a spec scenario carries `@scenario <capability> :: <Scenario name>`, and every test that proves an `automated` case of `test-cases.md` carries `@case <capability> :: <case name>` (`openspec/protocols/testing.md` §3).

## 1. Repository scaffolding

- [x] 1.1 Run `git init` at the root and extend `.gitignore` with `.env`, `backend/.venv/`, `node_modules/`, `.next/`, `e2e/test-results/`, `e2e/playwright-report/` and `e2e/blob-report/` (D14); verify `git status` lists the planning files and `git check-ignore .env` prints `.env`
- [x] 1.2 Add `.env.example` with `DEBUG=1`, a development `SECRET_KEY`, `DATABASE_URL=postgres://app:app@localhost:5432/app`, `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`, `ALLOWED_HOSTS=` and `BACKEND_PORT`/`FRONTEND_PORT`/`POSTGRES_PORT` (D4, D8, D9); verify every variable the specs name is present
- [x] 1.3 Add the root `package.json` (`private`, `packageManager: pnpm@10.x`, `engines.node: >=24 <25`) and `pnpm-workspace.yaml` with `frontend` and `e2e` (D1, D2); verify `pnpm -v` and `pnpm install` run at the root without errors

## 2. Backend project and settings

- [x] 2.1 Create the uv project in `backend/` (Python 3.13, Django 5.2, djangorestframework, django-environ, psycopg; dev: pytest, pytest-django, ruff) with a committed `uv.lock` and the Django project `config` (D1, D2); verify `uv sync --frozen` succeeds and leaves `uv.lock` unchanged
- [x] 2.2 Write failing tests in `backend/tests/test_settings.py` that start the settings in a subprocess with a controlled environment (D10) for "Debug variable unset", "Debug enabled with a true value", "Debug enabled with 1", "Unrecognised debug value", "Missing secret key outside debug mode", "Missing database address outside debug mode", "Missing secret key in debug mode", "Missing database address in debug mode", "Request to an allowed host", "Request to a host that is not allowed", "Extra allowed host" and "Real settings file is not tracked", with `@case` references for their automated cases; verify they fail because the settings do not exist yet
- [x] 2.3 Implement `config/settings.py` per D4 (root `.env` loading, our own `DEBUG` parsing, `ImproperlyConfigured("Set the <NAME> environment variable")`, development key fallback, `ALLOWED_HOSTS` extension) and `config/settings_test.py` on in-memory SQLite (D10); verify the tests of 2.2 pass
- [x] 2.4 Configure pytest-django in `backend/pyproject.toml` with `DJANGO_SETTINGS_MODULE=config.settings_test`; verify `uv run pytest` passes with no PostgreSQL server reachable ("Backend tests without PostgreSQL")

## 3. Health check, API baseline and admin panel

- [x] 3.1 Write failing tests in `backend/tests/test_health.py`, `test_api.py` and `test_admin.py` for "Healthy backend", "Database unavailable", "Method other than GET", "Unknown API address", "Anonymous visitor is sent to the admin login", "Administrator signs in to the admin panel", "Wrong administrator password", "Administrator with an existing username" and "No sign-in or registration outside the admin panel", with `@case` references for their automated cases (administrator `admin` / `Adm1n-pass-2026`); verify they fail for the missing views and URLs
- [x] 3.2 Implement the health `APIView` (`SELECT 1`, 200 / 503 bodies), DRF settings without the browsable-API login, and `config/urls.py` with only `/admin/` and `/api/health/` (D5); verify the health and API tests of 3.1 pass
- [x] 3.3 Enable `django.contrib.admin` and `django.contrib.staticfiles` with `STATIC_URL = "/static/"` (D6); verify the admin tests of 3.1 pass

## 4. Backend start-up commands

- [x] 4.1 Add the `runserver` override whose default port comes from `BACKEND_PORT` in the environment or the root `.env` (8000 if unset) (D9); verify by hand "Backend on the default port", "Backend on an overridden port", "Backend port from the root settings file" and "Backend port already in use"
- [x] 4.2 Add the `wait_for_db` management command (retry every second, 60 seconds, `Database is unreachable after 60 seconds`, exit 1) with a helper unit test that patches the connection and the clock, and `backend/entrypoint.sh` running `wait_for_db`, `migrate --noinput` and `runserver 0.0.0.0:8000` with fail-fast (D7); verify the helper test passes and the script stops at the first failing step
- [x] 4.3 Verify by hand against a local PostgreSQL 17 "Migrations applied to PostgreSQL" (`showmigrations` reports nothing unapplied), "Migrations with PostgreSQL unreachable" and "Backend started on its own with the example settings"

## 5. Frontend application

- [x] 5.1 Scaffold the Next.js App Router app in `frontend/` with TypeScript, Vitest with jsdom and React Testing Library (D3, D12), committed in the root `pnpm-lock.yaml`; verify `pnpm install --frozen-lockfile` succeeds and leaves the lock file unchanged ("Install frontend dependencies from the lock file")
- [x] 5.2 Write the failing unit test `frontend/app/page.test.tsx` for "Start page opens" (`@case web-app :: Start page has exactly one heading`); verify it fails while the page has no `h1`
- [x] 5.3 Implement `app/layout.tsx` and `app/page.tsx` as a static server component with exactly one non-empty `h1` and no network request (D3); verify the test of 5.2 passes, and verify by hand "Start page unit test passes", "Failing unit test is reported" and "Start page works without the backend"
- [x] 5.4 Add the `dev` script (a Node script that loads the root `.env`, the shell winning, and runs `next dev -p <FRONTEND_PORT or 3000>`) (D9); verify by hand "Frontend on the default port", "Frontend on an overridden port", "Frontend port from the root settings file" and "Frontend port already in use"

## 6. Code-quality tooling

- [x] 6.1 Write failing tooling tests that run the tools on the delivered code and on temporary fixture files: pytest `backend/tests/tooling/` (marker `tooling`, excluded from the default run) for "Clean backend passes the checks", "Lint violation is reported" and "Format violation is reported" of `backend-app`; Vitest `frontend/tooling/` (separate config) for "Clean frontend passes the checks", "Format violation is reported", "Lint violation is reported", "Type check passes" and "Type error is reported" of `web-app`; each with `@case` references for its automated cases; verify they fail because the tools are not configured yet
- [x] 6.2 Configure ruff lint and format in `backend/pyproject.toml`, ESLint flat config with `@typescript-eslint/no-unused-vars` as an error, Prettier and the `typecheck` script (`tsc --noEmit`) in `frontend/` (D12); verify the tooling tests of 6.1 pass and the delivered code is clean
- [x] 6.3 Add `.pre-commit-config.yaml` with ruff check, ruff format, ESLint and Prettier on staged files and no test hooks (D12); verify by hand "Clean commit passes", "Commit with a backend lint violation is blocked", "Commit with a frontend lint violation is blocked", "Unformatted frontend file is reformatted and the commit blocked" and "Unformatted backend file is reformatted and the commit blocked"

## 7. docker compose stack and root commands

- [x] 7.1 Add `backend/Dockerfile`, `frontend/Dockerfile` and `docker-compose.yml` (`db` postgres:17 with a named volume and a healthcheck, source mounts, `WATCHPACK_POLLING=true`, the backend's own `DATABASE_URL` to `db:5432`, port mappings from `BACKEND_PORT`/`FRONTEND_PORT`/`POSTGRES_PORT`) (D8); verify `docker compose config` succeeds and `docker compose up -d` serves the start page and `/api/health/` with status 200
- [x] 7.2 Add the Makefile with `install`, `up`, `down`, `lint`, `test`, `test-tooling`, `e2e`, `backend` and `frontend` and fail-fast recipes (D13); verify `make lint`, `make test` and `make test-tooling` exit 0 and a deliberately failing backend test makes `make test` exit non-zero
- [x] 7.3 Verify by hand on Linux "Full stack starts", "Overridden ports in the stack", "Port already in use", "Fresh database is migrated", "Backend waits for a slow database", "Database never becomes ready", "Failed migration stops the backend", "Restart keeps existing data", "Frontend change is picked up", "Backend change is picked up", "Backend recovers after a syntax error is fixed" and "Admin panel styles are served in development"
- [x] 7.4 Verify by hand "Install everything", "A failing install step fails the root install command", "Repeated install and start", "Run all checks", "Type error fails the root lint command", "Run all unit tests", "A failing step fails the root command" and "Start and stop the stack"

## 8. E2E infrastructure

- [x] 8.1 Create the `e2e/` package with `@playwright/test`, `playwright.config.ts` (`retries: 0`, Chromium only, `baseURL` from `E2E_BASE_URL` or `http://localhost:13000`) and its gitignore entries (D11, `openspec/protocols/e2e.md` §3); verify `pnpm --filter e2e exec playwright --version` runs
- [x] 8.2 Add `docker-compose.e2e.yml` (host ports 18000/13000/15432, a separate volume) and the `make e2e` recipe with project `setup-monorepo-e2e`, `up -d --build --wait`, Playwright and `trap` with `down -v` returning the Playwright status (D11); verify the stack comes up on the E2E ports and nothing of project `setup-monorepo-e2e` remains after the target ends, with the development stack still running ("E2E stack is removed afterwards", "E2E runs next to the development stack"). The start-page test itself is written in the E2E stage

## 9. Documentation and repository checks

- [x] 9.1 Write the root README: required tools, `make install`, the stack, standalone start of each project (including the `DATABASE_URL` note for a changed `POSTGRES_PORT`), `createsuperuser`, and every check (D14, D9); verify by hand "New developer follows the README" and "Developer starts a project on its own from the README"
- [x] 9.2 Verify by hand "Top-level layout", "No CI configuration", "Install backend dependencies from the lock file" on a fresh clone

## 10. Integration

- [x] 10.1 Run the `test-reviewer` subagent and fix its blocker and major findings (`openspec/protocols/review-tests.md`)
- [x] 10.2 Run the full suite and quality checks (`make lint`, `make test`, `make test-tooling`), fix what fails and report the commands and results
- [x] 10.3 List the manual checks for the developer: every `manual` scenario of `verification-plan.md` and every `manual` case of `test-cases.md` with its steps and expected Then
- [x] 10.4 Run `node openspec/tooling/checks/check-traceability.mjs --change setup-monorepo --markers` and fix every reported gap

## Workflow follow-up

- E2E stage (`openspec/protocols/e2e.md`): write `e2e.md` (`Mode: real backend`, `Tests: e2e/`), the Playwright test for `@case dev-environment :: E2E check of the start page` and `@case web-app :: Start page has exactly one heading`, run it only through `node openspec/tooling/bin/e2e-run.mjs --change setup-monorepo`, and verify "Start page opens in the browser" and "E2E stack is removed after a failed check".
- Run `node openspec/tooling/checks/check-e2e.mjs --change setup-monorepo --mode archive`, then archive with `/opsx:archive`.
