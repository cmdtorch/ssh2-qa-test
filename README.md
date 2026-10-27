# ssh2-qa-test

Monorepo with a Django REST Framework backend (`backend/`), a Next.js frontend (`frontend/`), PostgreSQL and Playwright E2E checks (`e2e/`).

## Required tools

- Docker with the docker compose plugin (v2)
- [uv](https://docs.astral.sh/uv/) and Python 3.13
- Node.js 24 LTS and pnpm 10 (for example via `corepack enable`)
- GNU make, git

## Installation

```sh
cp .env.example .env
make install
```

`make install` installs the backend dependencies from `backend/uv.lock`, the frontend and E2E dependencies from `pnpm-lock.yaml`, and the pre-commit hooks. It fails when a lock file is out of date with its manifest.

## Full stack (docker compose)

```sh
make up     # docker compose up -d
make down   # docker compose down
```

| Service    | URL                                    | Port setting    |
| ---------- | -------------------------------------- | --------------- |
| Frontend   | http://localhost:3000/                 | `FRONTEND_PORT` |
| Backend    | http://localhost:8000/api/health/      | `BACKEND_PORT`  |
| Admin      | http://localhost:8000/admin/           | `BACKEND_PORT`  |
| PostgreSQL | `localhost:5432`                       | `POSTGRES_PORT` |

Change the ports in `.env` if they are taken. The backend waits up to 60 seconds for PostgreSQL, applies migrations and then starts. Source changes in `backend/` and `frontend/` reload without rebuilding. After changing dependencies, rebuild the images with `docker compose up -d --build --renew-anon-volumes`.

Create an administrator in the stack:

```sh
docker compose exec backend python manage.py createsuperuser
```

## Running a project on its own

Backend (needs PostgreSQL, for example the one from the stack):

```sh
docker compose up -d db
make backend            # http://localhost:8000/api/health/
```

The backend reads `DATABASE_URL` from `.env`. It points at `localhost:5432`; if you change `POSTGRES_PORT`, change the port in `DATABASE_URL` too. To create an administrator: `cd backend && uv run python manage.py createsuperuser`.

Frontend:

```sh
make frontend           # http://localhost:3000/
```

Both read their port from `BACKEND_PORT` / `FRONTEND_PORT` (shell or `.env`) and exit with an error if the port is already in use.

## Checks

```sh
make lint          # ruff check, ruff format --check, ESLint, Prettier --check, tsc --noEmit
make test          # backend pytest and frontend Vitest unit tests
make test-tooling  # tests that run the lint/format/type tools on fixture files
make e2e           # Playwright against a throwaway stack
```

`make e2e` installs the Playwright Chromium browser if needed (on Linux, missing system libraries can be installed once with `pnpm --filter e2e exec playwright install --with-deps chromium`), starts a separate stack (project `setup-monorepo-e2e`, ports 13000, 18000 and 15432, its own database volume), runs Playwright against http://localhost:13000 and always removes that stack and its volume. It works while the development stack is running.

`make e2e-serve` starts the same E2E stack in the foreground and removes it with its volume when it stops (Ctrl+C or SIGTERM). Playwright uses it as its `webServer` when you run the tests directly (`pnpm --filter e2e exec playwright test` without `E2E_BASE_URL`); with `E2E_BASE_URL` set, Playwright tests that address instead.

The pre-commit hooks run ruff, ESLint and Prettier on staged files. A hook that reformats a file blocks the commit; stage the file and commit again.
