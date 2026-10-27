# Design

## Context

The repository holds only OpenSpec planning files and is not yet a git repository; there is no application code to integrate with or migrate [desc][Q11]. See proposal.md — Why for the motivation. The change is cross-cutting (two applications, a container stack, shared tooling) and adds many new dependencies, so the main forks were settled in the Design round [Q42][Q43][Q44][Q45]. The behaviour to build is in `specs/backend-app`, `specs/web-app` and `specs/dev-environment`; the cases QA accepted are in `test-cases.md` [Q13].

## Goals / Non-Goals

**Goals:**
- One layout and one set of root commands that every later change reuses: `backend/`, `frontend/`, `e2e/` and a Makefile [Q3][Q13][Q23].
- The same settings file (`.env` at the root) works for the container stack and for each project started on its own [Q14][Q36].
- Every check (lint, format, types, unit tests, E2E) runs from the root and fails with a non-zero exit status [Q10][Q23][Q34].

**Non-Goals:**
- No production images, web server, static-file serving with debug off, or deployment configuration [Q12].
- No CI pipeline [Q11].
- No connection between the frontend and the backend; no API client, CORS or proxy setup [Q14].

## Decisions

### D1. Repository layout and workspace
`backend/` (Django project), `frontend/` (Next.js app) and `e2e/` (Playwright tests) sit at the root. The pnpm workspace (`pnpm-workspace.yaml`) contains `frontend` and `e2e` with one `pnpm-lock.yaml` at the root [Q3][Q5][Q13]. The backend is not part of the pnpm workspace; it is a uv project with `backend/pyproject.toml` and `backend/uv.lock` [Q6].
*Alternative:* putting the Playwright tests inside `frontend/` — rejected, because the E2E check drives the whole stack and has its own dependencies and configuration [Q13][Q28].

### D2. Platform versions
Python 3.13, Django 5.2 LTS, Node.js 24 LTS, PostgreSQL 17, the current Next.js major version and pnpm 10, pinned in `pyproject.toml`, `package.json` (`engines`, `packageManager`) and the Docker images [Q43].
*Alternative:* the newest release of every platform — rejected in favour of long-term support [Q43].

### D3. Next.js App Router
The frontend uses the App Router: `frontend/app/layout.tsx` and `frontend/app/page.tsx` render the start page with a single `h1`; the page is a static server component that makes no network request [Q42][Q14].
*Alternative:* Pages Router — rejected [Q42].

### D4. Backend settings with django-environ
One settings module, `backend/config/settings.py`, loads the root `.env` with django-environ when the file exists and reads `DATABASE_URL`, `SECRET_KEY`, `DEBUG` and `ALLOWED_HOSTS` from the environment; real environment variables win over the file, as django-environ does by default [Q18][Q36][Q37][Q45].
- `DEBUG` is parsed by our own code: on only for `1` or `true` (any case), off for any other value or when unset. django-environ's boolean parser is not used because it also accepts `yes` and `on` [Q29][Q37].
- With debug off, a missing or empty `SECRET_KEY` or `DATABASE_URL` raises Django's `ImproperlyConfigured` with the message `Set the <NAME> environment variable`, so start-up stops and names the variable [Q30].
- With debug on, a missing `SECRET_KEY` falls back to a fixed development key; a missing `DATABASE_URL` still raises the same error [Q38].
- `ALLOWED_HOSTS` is a comma-separated list appended to `localhost` and `127.0.0.1` [Q35].
*Alternatives:* pydantic-settings, or the standard library with python-dotenv — rejected [Q45].

### D5. Health check and API baseline
Django REST Framework is installed with the browsable-API login not wired in; `config/urls.py` mounts `/admin/` and `/api/health/` only, so every other `/api/` path returns 404 [Q8][Q27][Q32]. The health view is a DRF `APIView` with only `get` defined, so other methods return 405; it runs `SELECT 1` on the default database connection and returns 200 `{"status": "ok", "database": "ok"}` or, on any database error, 503 `{"status": "error", "database": "unavailable"}` [Q19][Q27]. It needs no authentication [Q19].

### D6. Admin panel
Django's standard admin at `/admin/` with `django.contrib.staticfiles`; with debug on, Django's development server serves `/static/admin/` itself, in the stack and standalone, so no extra static-file server is added [Q20][Q26][Q12]. Administrators are created with `manage.py createsuperuser`, documented in the README [Q20][Q25].

### D7. Backend start-up in the stack
The backend container runs an entrypoint with three steps [Q21][Q33][Q39]:
1. a management command `wait_for_db` that retries a database connection every second for up to 60 seconds and, if it never succeeds, prints `Database is unreachable after 60 seconds` and exits with status 1 [Q39];
2. `manage.py migrate --noinput`; a failure stops the entrypoint with its non-zero status, so the server never starts [Q33];
3. `manage.py runserver 0.0.0.0:8000` with Django's auto-reloader, which also recovers after a saved syntax error is fixed [Q22].
*Alternative:* relying on docker compose `depends_on: condition: service_healthy` — rejected as the only mechanism, because the spec requires the backend itself to wait, time out after 60 seconds and report it [Q33][Q39]. PostgreSQL still has a healthcheck, used by `docker compose up --wait` in the E2E command (D11).

### D8. docker compose stack
`docker-compose.yml` at the root defines `db` (postgres:17 with a named volume), `backend` and `frontend` [Q9]. The backend and frontend mount their source directories and run development servers, so saved changes reload without rebuilding [Q22]; the frontend sets `WATCHPACK_POLLING=true` so file changes are seen through the mount on every host OS [Q22]. All services read `.env` (`env_file`), and the backend's `environment` sets its own `DATABASE_URL` with host `db` and port 5432, overriding the host and port the file gives for standalone use [Q36]. Host ports are mapped from `${BACKEND_PORT:-8000}`, `${FRONTEND_PORT:-3000}` and `${POSTGRES_PORT:-5432}` to the fixed container ports 8000, 3000 and 5432 [Q17].

### D9. Standalone start
- Backend: `make backend` runs `uv run python manage.py runserver`, with a small override of Django's `runserver` command whose default port is `BACKEND_PORT` from the environment or `.env` (8000 if unset). Django's server already exits with `Error: That port is already in use.` when the port is taken [Q14][Q17][Q36].
- Frontend: `make frontend` runs the `dev` script of `frontend/package.json`, a small Node script that loads the root `.env` (the shell wins over the file) and starts `next dev -p <FRONTEND_PORT or 3000>`. With an explicit port, Next.js exits with an "address already in use" error instead of moving to the next port [Q14][Q17][Q44].
The example settings file's `DATABASE_URL` points at `localhost:5432`; the README tells developers who change `POSTGRES_PORT` to change that URL too [Q36][Q25].

### D10. Backend tests on SQLite
pytest with pytest-django and a test settings module `config/settings_test.py` that imports the main settings with debug-off defaults satisfied and replaces `DATABASES` with an in-memory SQLite database, regardless of `DATABASE_URL` [Q7][Q15]. Settings-parsing cases (missing variables, `DEBUG` values) start the settings in a subprocess with a controlled environment, so the process exit and the error text can be asserted [Q29][Q30][Q37][Q38].

### D11. E2E stack
`make e2e` runs `docker compose -p setup-monorepo-e2e -f docker-compose.yml -f docker-compose.e2e.yml up -d --build --wait`; the override file maps host ports 18000, 13000 and 15432 and uses a separate volume, so the run neither touches nor clashes with the development stack [Q28][Q40]. Playwright in `e2e/` opens the start page at `http://localhost:13000/` [Q13]. The Makefile target runs `down -v` for that project in every case (a shell `trap`), so the stack and its volume are removed also after a failed check, and the target returns the Playwright exit status [Q40].

### D12. Code-quality tooling
- Backend: ruff for linting and formatting, configured in `backend/pyproject.toml` [Q10].
- Frontend: ESLint (Next.js flat config with `@typescript-eslint/no-unused-vars` as an error), Prettier, `tsc --noEmit`, Vitest with jsdom and React Testing Library [Q10][Q16][Q34].
- pre-commit framework with `.pre-commit-config.yaml`: ruff check, ruff format, ESLint and Prettier on the staged files; formatters rewrite the file and fail the hook, which blocks the commit — pre-commit's standard behaviour. No test hooks [Q24][Q31].

### D13. Makefile
Targets: `install` (`uv sync` in `backend/`, `pnpm install --frozen-lockfile`, `pre-commit install`), `up`, `down`, `lint` (ruff check, ruff format --check, ESLint, Prettier --check, `tsc --noEmit`), `test` (pytest, Vitest), `e2e` (D11), `backend` and `frontend` (D9) [Q23][Q34][Q41]. A separate target `test-tooling` runs pytest and Vitest tests that call ruff, ESLint, Prettier and `tsc` on the delivered code and on temporary fixture files with known violations [Q47]. Each recipe runs with the shell's fail-fast behaviour, so the first failing step sets a non-zero exit status [Q23]. `up` uses `docker compose up -d`, which leaves an already running stack as it is [Q23].

### D14. Repository basics
`git init` at the root; `.gitignore` adds `.env`, `backend/.venv/`, `node_modules/`, `.next/` and Playwright reports to the existing entries; the example settings file is `.env.example` [Q11][Q18]. The root README covers required tools, installation, the stack, standalone start, creating an administrator and every check [Q25].

## Risks / Trade-offs

- [Risk] Tests on SQLite can miss PostgreSQL-specific behaviour → the E2E stack and the health check run on PostgreSQL, and no business models exist yet [Q15].
- [Risk] File watching through Docker mounts is slow or misses changes on some hosts → polling is enabled for the frontend; Django's reloader polls by default when inotify is unavailable [Q22].
- [Risk] A developer who overrides `POSTGRES_PORT` forgets to update `DATABASE_URL` for standalone use → the README states it, and the health check reports `database: unavailable` instead of failing silently [Q36][Q25].
- [Risk] Version pins go stale → LTS lines were chosen to keep that slow; upgrades are separate changes [Q43].
- [Trade-off] The development server is used inside the stack instead of a production server → matches the development-mode answer; production serving is out of scope [Q22][Q12].

## Assumptions & Open Questions

- [assumption] If one of the named versions is not available at implementation time, the nearest long-term-support version of the same line is used.
- [assumption] The frontend start page is the minimal page from the Next.js scaffold, without design work.
- [assumption] The single example settings file at the root is used by docker compose and by each project started on its own.
