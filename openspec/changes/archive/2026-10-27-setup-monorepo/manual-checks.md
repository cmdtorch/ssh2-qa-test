# Manual Checks

Manual test cases of `test-cases.md` for the developer (Linux, Docker, uv, Node.js 24, pnpm 10; `.env` copied from `.env.example`; administrator `admin` / `Adm1n-pass-2026` where needed).

The AI ran most of these in its sandbox during apply. The cases marked **[developer]** could not be run there (Docker bind mounts and published ports are unavailable in the sandbox) and must be run by the developer before tasks 4.3, 7.3 and 9.1 are ticked.

## backend-app

### Clean install from uv.lock
Scenario: Install backend dependencies from the lock file

- **Given** a fresh clone of the repository with no `backend/.venv` directory and the committed `backend/uv.lock`
- **When** the developer runs `uv sync --frozen` in `backend/`
- **Then** the command exits with status 0
- **And** `git status --porcelain backend/` prints nothing
- **And** `uv pip list` shows Django and Django REST Framework at the versions pinned in `backend/uv.lock`

### Lock file out of date with pyproject.toml
Scenario: Install backend dependencies from the lock file

- **Given** a fresh clone in which `backend/pyproject.toml` gains the dependency `requests` but `backend/uv.lock` is not updated
- **When** the developer runs `uv sync --locked` in `backend/`
- **Then** the command exits with a non-zero status
- **And** `backend/uv.lock` is unchanged

### Standalone backend with unchanged example settings **[developer]**
Scenario: Backend started on its own with the example settings

- **Given** the example settings file copied to `.env` at the repository root without changes, and only the PostgreSQL service of the stack running on port 5432
- **When** the developer starts the backend on its own from `backend/` outside docker compose
- **Then** `GET http://localhost:8000/api/health/` returns status 200 with body `{"status": "ok", "database": "ok"}`
- **And** `GET http://localhost:8000/does-not-exist/` returns the debug 404 page that lists the known URL patterns

### Standalone backend while PostgreSQL is stopped
Scenario: Backend started on its own with the example settings

- **Given** the example settings file copied to `.env` without changes and no PostgreSQL service running
- **When** the developer starts the backend on its own and sends `GET http://localhost:8000/api/health/`
- **Then** the response status is 503
- **And** the body is `{"status": "error", "database": "unavailable"}`

### Port 8000 without BACKEND_PORT
Scenario: Backend on the default port

- **Given** no `BACKEND_PORT` in the shell or in `.env`, and the other example settings in `.env`
- **When** the developer starts the backend on its own and sends `GET http://localhost:8000/api/health/`
- **Then** the response status is 200

### Port 8100 from the shell
Scenario: Backend on an overridden port

- **Given** `BACKEND_PORT=8100` exported in the shell and nothing on port 8100
- **When** the developer starts the backend on its own and sends `GET http://localhost:8100/api/health/`
- **Then** the response status is 200
- **And** a connection to `localhost:8000` is refused

### Port 8200 from .env
Scenario: Backend port from the root settings file

- **Given** `.env` at the root contains `BACKEND_PORT=8200` and the shell has no `BACKEND_PORT`
- **When** the developer starts the backend on its own outside docker compose and sends `GET http://localhost:8200/api/health/`
- **Then** the response status is 200

### Port 8000 taken by another program
Scenario: Backend port already in use

- **Given** another program listens on port 8000 (for example `python3 -m http.server 8000`) and neither the shell nor `.env` sets `BACKEND_PORT`
- **When** the developer starts the backend on its own
- **Then** the backend process exits with a non-zero status
- **And** `http://localhost:8000/` still answers from the other program
- **And** the backend output contains `Error: That port is already in use.`

### Built-in tables created in an empty database **[developer]**
Scenario: Migrations applied to PostgreSQL

- **Given** an empty PostgreSQL database `app` reachable through `DATABASE_URL` in `.env`
- **When** the developer applies the backend migrations
- **Then** the database contains the tables `auth_user`, `django_admin_log`, `django_session` and `django_content_type`
- **And** the migration check (`manage.py migrate --check`) exits with status 0

### Migrate while PostgreSQL is stopped **[developer]**
Scenario: Migrations with PostgreSQL unreachable

- **Given** `.env` with `DATABASE_URL=postgres://app:app@localhost:5432/app` and no PostgreSQL server listening on port 5432
- **When** the developer applies the backend migrations
- **Then** the command exits with a non-zero status
- **And** its error output contains `connection` and `localhost` and states that the connection failed

### Test run with no PostgreSQL server
Scenario: Backend tests without PostgreSQL

- **Given** no `.env` file at the root, no PostgreSQL server listening on the machine and no stack running
- **When** the developer runs the backend test command in `backend/`
- **Then** the command exits with status 0
- **And** the pytest summary reports 0 failed and 0 errors

### Test run while .env points at a stopped PostgreSQL
Scenario: Backend tests without PostgreSQL

- **Given** `.env` at the root with `DATABASE_URL=postgres://app:app@localhost:5432/app` and no PostgreSQL server listening on port 5432
- **When** the developer runs the backend test command in `backend/`
- **Then** the command exits with status 0
- **And** the pytest summary reports 0 failed and 0 errors

### Health check recovers when the database returns
Scenario: Database unavailable

- **Given** the backend running and `GET /api/health/` returning 503 because PostgreSQL is stopped
- **When** PostgreSQL is started again and a client sends `GET /api/health/`
- **Then** the response status is 200
- **And** the body is `{"status": "ok", "database": "ok"}`

### Admin stylesheet on the login page in the stack
Scenario: Admin panel styles are served in development

- **Given** the stack started with the example settings (`DEBUG=1`)
- **When** a browser opens `http://localhost:8000/admin/login/` with the network log open
- **Then** the page is shown with the Django admin styling (blue header bar with the text `Django administration`)
- **And** `GET http://localhost:8000/static/admin/css/base.css` returns status 200 with a `Content-Type` starting with `text/css`
- **And** the network log has no request under `/static/admin/` with status 404

### Admin index page assets after sign-in
Scenario: Admin panel styles are served in development

- **Given** the stack started with the example settings and an administrator `admin` with password `Adm1n-pass-2026`
- **When** the administrator signs in at `http://localhost:8000/admin/login/` and the admin panel index page loads, with the network log open
- **Then** every request of the index page under `/static/admin/` returns status 200
- **And** the network log has no request under `/static/admin/` with status 404

### Admin stylesheet with the backend started on its own
Scenario: Admin panel styles are served in development

- **Given** the example settings copied to `.env`, only the PostgreSQL service of the stack running, and the backend started on its own outside docker compose
- **When** a browser opens `http://localhost:8000/admin/login/` with the network log open
- **Then** `GET http://localhost:8000/static/admin/css/base.css` returns status 200 with a `Content-Type` starting with `text/css`
- **And** the network log has no request under `/static/admin/` with status 404

## web-app

### Clean install with a frozen lock file
Scenario: Install frontend dependencies from the lock file

- **Given** a fresh clone with no `node_modules` directories and the committed `pnpm-lock.yaml` at the root
- **When** the developer runs `pnpm install --frozen-lockfile` at the repository root
- **Then** the command exits with status 0
- **And** `git status --porcelain` prints nothing

### Lock file out of date
Scenario: Install frontend dependencies from the lock file

- **Given** a fresh clone in which `frontend/package.json` gains the dependency `lodash` but `pnpm-lock.yaml` is not updated
- **When** the developer runs `pnpm install --frozen-lockfile`
- **Then** the command exits with a non-zero status
- **And** `pnpm-lock.yaml` is unchanged

### Port 3000 without FRONTEND_PORT
Scenario: Frontend on the default port

- **Given** no `FRONTEND_PORT` in the shell or in `.env`
- **When** the developer starts the frontend development server on its own and opens `http://localhost:3000/`
- **Then** the response status is 200 and the start page is shown

### Port 3100 from the shell
Scenario: Frontend on an overridden port

- **Given** `FRONTEND_PORT=3100` exported in the shell
- **When** the developer starts the frontend development server on its own and opens `http://localhost:3100/`
- **Then** the response status is 200 and the start page is shown
- **And** a connection to `localhost:3000` is refused

### Port 3200 from .env
Scenario: Frontend port from the root settings file

- **Given** `.env` at the root contains `FRONTEND_PORT=3200` and the shell has no `FRONTEND_PORT`
- **When** the developer starts the frontend development server on its own outside docker compose and opens `http://localhost:3200/`
- **Then** the response status is 200 and the start page is shown

### Port 3000 taken by another program
Scenario: Frontend port already in use

- **Given** another program listens on port 3000 (for example `python3 -m http.server 3000`) and neither the shell nor `.env` sets `FRONTEND_PORT`
- **When** the developer starts the frontend development server on its own
- **Then** the development server process exits with a non-zero status
- **And** `http://localhost:3000/` keeps answering from the other program, and `http://localhost:3001/` refuses the connection
- **And** the development server output states that port 3000 is already in use

### Start page with the backend stopped
Scenario: Start page works without the backend

- **Given** the frontend running on port 3000 and nothing listening on port 8000
- **When** a browser opens `http://localhost:3000/`
- **Then** the page shows its `h1` heading
- **And** the browser console has no error entries
- **And** the browser's network log has no request to `localhost:8000`

### Start page unit test on delivered code
Scenario: Start page unit test passes

- **Given** the frontend code exactly as delivered by this change
- **When** the developer runs the frontend unit-test command
- **Then** the output lists a passing test that renders the start page and finds its `h1`
- **And** the command exits with status 0

### Deliberately failing unit test
Scenario: Failing unit test is reported

- **Given** a frontend test file `frontend/src/fail.test.ts` with a test named `always fails` that asserts `expect(1).toBe(2)`
- **When** the developer runs the frontend unit-test command
- **Then** the command exits with a non-zero status
- **And** the output contains `always fails`

## dev-environment

### Root contents after the change
Scenario: Top-level layout

- **Given** a fresh clone of the repository
- **When** the developer lists the repository root
- **Then** it contains `backend/`, `frontend/`, `README.md`, `Makefile`, the docker compose file, `pnpm-workspace.yaml`, `.pre-commit-config.yaml` and the example settings file
- **And** `git rev-parse --is-inside-work-tree` prints `true`

### No CI pipeline files
Scenario: No CI configuration

- **Given** a fresh clone of the repository
- **When** the developer looks for `.github/workflows/`, `.gitlab-ci.yml`, `.circleci/` and `Jenkinsfile`
- **Then** none of them exists

### Stack with the example settings
Scenario: Full stack starts

- **Given** the example settings file copied to `.env` without changes, nothing on ports 3000, 8000 and 5432, and no existing stack volumes
- **When** the developer starts the stack with the root start command
- **Then** `http://localhost:3000/` returns status 200
- **And** `GET http://localhost:8000/api/health/` returns status 200 with body `{"status": "ok", "database": "ok"}`
- **And** `pg_isready -h localhost -p 5432` reports `accepting connections`

### Stack on ports 8100, 3100 and 5532
Scenario: Overridden ports in the stack

- **Given** `.env` sets `BACKEND_PORT=8100`, `FRONTEND_PORT=3100` and `POSTGRES_PORT=5532`
- **When** the developer starts the stack
- **Then** `GET http://localhost:8100/api/health/` returns status 200 with body `{"status": "ok", "database": "ok"}`
- **And** `http://localhost:3100/` returns status 200
- **And** `pg_isready -h localhost -p 5532` reports `accepting connections`
- **And** connections to `localhost:8000`, `localhost:3000` and `localhost:5432` are refused

### Port 3000 taken by another program
Scenario: Port already in use

- **Given** another program listens on port 3000 (for example `python3 -m http.server 3000`) and `.env` has no port overrides
- **When** the developer starts the stack
- **Then** the start fails with an error that mentions port 3000 and that it is already allocated
- **And** after setting `FRONTEND_PORT=3001` in `.env` and starting again, `http://localhost:3001/` returns status 200

### First start on an empty volume
Scenario: Fresh database is migrated

- **Given** no PostgreSQL volume of the stack exists
- **When** the developer starts the stack
- **Then** the backend log lists the applied migrations of the apps `admin`, `auth`, `contenttypes` and `sessions`
- **And** `GET http://localhost:8000/api/health/` returns status 200

### PostgreSQL ready 20 seconds after the backend starts
Scenario: Backend waits for a slow database

- **Given** the stack's PostgreSQL service delayed so that it accepts connections 20 seconds after the backend container starts
- **When** the developer starts the stack
- **Then** the backend applies its migrations after PostgreSQL is ready
- **And** within 30 seconds of PostgreSQL becoming ready, `GET http://localhost:8000/api/health/` returns status 200 without a stack restart

### PostgreSQL never accepts connections
Scenario: Database never becomes ready

- **Given** the stack's PostgreSQL service configured so that it never accepts connections
- **When** the developer starts the stack and waits 70 seconds
- **Then** the backend container has exited with a non-zero status
- **And** the backend log contains `Database is unreachable after 60 seconds`
- **And** a connection to `localhost:8000` is refused

### PostgreSQL ready just after the limit
Scenario: Database never becomes ready

- **Given** the stack's PostgreSQL service delayed so that it accepts connections 65 seconds after the backend container starts
- **When** the developer starts the stack and waits 70 seconds
- **Then** the backend container has exited with a non-zero status
- **And** the backend log contains `Database is unreachable after 60 seconds`

### PostgreSQL ready just before the limit
Scenario: Database never becomes ready

- **Given** the stack's PostgreSQL service delayed so that it accepts connections 55 seconds after the backend container starts
- **When** the developer starts the stack
- **Then** the backend container keeps running
- **And** `GET http://localhost:8000/api/health/` returns status 200

### Migration raising an error
Scenario: Failed migration stops the backend

- **Given** a temporary backend migration that raises an error when applied, and the stack stopped
- **When** the developer starts the stack
- **Then** the backend container exits with a non-zero status
- **And** a connection to `localhost:8000` is refused
- **And** the backend log contains the error raised by that migration

### Administrator survives a restart
Scenario: Restart keeps existing data

- **Given** the stack running and an administrator `admin` with password `Adm1n-pass-2026` created with the standard command
- **When** the developer runs the root stop command and then the root start command
- **Then** the backend log shows no unapplied migrations being applied
- **And** signing in at `http://localhost:8000/admin/` as `admin` with `Adm1n-pass-2026` shows the heading `Site administration`

### New heading text without rebuild **[developer]**
Scenario: Frontend change is picked up

- **Given** the stack running and the start page showing its current `h1`
- **When** the developer changes the `h1` text in the start page source to `Reload check 2026` and saves the file
- **Then** within 10 seconds, reloading `http://localhost:3000/` shows the `h1` text `Reload check 2026`
- **And** no image was rebuilt and no container was restarted by hand

### Extra field in the health response without rebuild **[developer]**
Scenario: Backend change is picked up

- **Given** the stack running and `GET http://localhost:8000/api/health/` returning `{"status": "ok", "database": "ok"}`
- **When** the developer changes the backend code to add the field `"reload": "check"` to the health response and saves the file
- **Then** within 10 seconds, `GET http://localhost:8000/api/health/` returns a body that contains `"reload": "check"`
- **And** no image was rebuilt and no container was restarted by hand

### Syntax error saved and then fixed **[developer]**
Scenario: Backend recovers after a syntax error is fixed

- **Given** the stack running and `GET http://localhost:8000/api/health/` returning 200
- **When** the developer adds the line `def broken(:` to the backend file that defines the health-check view, saves it and, after checking the backend, removes that line and saves again
- **Then** while the line is present the backend log contains `SyntaxError` and `GET http://localhost:8000/api/health/` does not return 200
- **And** within 10 seconds of the fix `GET http://localhost:8000/api/health/` returns 200, with no image rebuilt and no container restarted by hand

### Root install in a fresh clone
Scenario: Install everything

- **Given** a fresh clone with no backend virtual environment, no `node_modules` and no `.git/hooks/pre-commit`
- **When** the developer runs `make install`
- **Then** the command exits with status 0
- **And** the backend environment and `node_modules` exist
- **And** `.git/hooks/pre-commit` exists

### Frontend lock file out of date
Scenario: A failing install step fails the root install command

- **Given** a fresh clone in which `frontend/package.json` gains the dependency `lodash` but `pnpm-lock.yaml` is not updated
- **When** the developer runs `make install`
- **Then** the command exits with a non-zero status
- **And** the output shows the failing pnpm install step

### Second make install
Scenario: Repeated install and start

- **Given** `make install` already done once in this clone
- **When** the developer runs `make install` again
- **Then** the command exits with status 0
- **And** `git status --porcelain` prints nothing

### Start while the stack is running
Scenario: Repeated install and start

- **Given** the stack already started with the root start command
- **When** the developer runs the root start command again
- **Then** the command exits with status 0
- **And** `docker compose ps` lists exactly one running container each for the backend, the frontend and PostgreSQL

### Root lint on delivered code
Scenario: Run all checks

- **Given** the code exactly as delivered by this change and `make install` done
- **When** the developer runs the root lint command
- **Then** the output shows the backend lint check, the backend format check, the frontend lint check, the frontend format check and the frontend type check running
- **And** the command exits with status 0

### Backend lint violation fails the root lint command
Scenario: Run all checks

- **Given** a backend Python file with an unused `import os`
- **When** the developer runs the root lint command
- **Then** the command exits with a non-zero status
- **And** the output contains the file path and `F401`

### Type error in a frontend file
Scenario: Type error fails the root lint command

- **Given** `frontend/src/broken.ts` contains `const title: string = 42;` and all other checks pass
- **When** the developer runs the root lint command
- **Then** the command exits with a non-zero status
- **And** the output contains `broken.ts`

### Root test on delivered code
Scenario: Run all unit tests

- **Given** the code exactly as delivered by this change and `make install` done
- **When** the developer runs the root test command
- **Then** the output shows the pytest summary of the backend and the Vitest summary of the frontend
- **And** the command exits with status 0

### Failing backend test
Scenario: A failing step fails the root command

- **Given** a backend test `test_always_fails` that asserts `1 == 2`
- **When** the developer runs the root test command
- **Then** the command exits with a non-zero status
- **And** the output contains `test_always_fails`

### Failing frontend test
Scenario: A failing step fails the root command

- **Given** a frontend test named `always fails` that asserts `expect(1).toBe(2)` and all backend tests passing
- **When** the developer runs the root test command
- **Then** the command exits with a non-zero status
- **And** the output contains `always fails`

### Start then stop
Scenario: Start and stop the stack

- **Given** no container of the stack running
- **When** the developer runs the root start command, then the root stop command
- **Then** after start, `docker compose ps` lists the backend, frontend and PostgreSQL services as running
- **And** after stop, `docker compose ps` lists no running container of the stack

### Commit of a clean file
Scenario: Clean commit passes

- **Given** `make install` done and a new backend file `backend/clean_example.py` that passes the lint and format checks, staged
- **When** the developer runs `git commit -m "Add clean example"`
- **Then** the commit is created and `git log -1 --format=%s` prints `Add clean example`

### Hooks do not run tests
Scenario: Clean commit passes

- **Given** `make install` done, a backend test `test_always_fails` that asserts `1 == 2` already in the repository, and a clean staged file
- **When** the developer commits the staged file
- **Then** the commit is created
- **And** the hook output contains no pytest or Vitest output

### Unused import in a committed backend file
Scenario: Commit with a backend lint violation is blocked

- **Given** hooks installed and a staged backend file `backend/bad_import.py` containing `import os` that is never used
- **When** the developer runs `git commit -m "Bad import"`
- **Then** the commit is not created and `git log -1 --format=%s` does not print `Bad import`
- **And** the hook output contains `bad_import.py` and `F401`

### Unused variable in a committed frontend file
Scenario: Commit with a frontend lint violation is blocked

- **Given** hooks installed and a staged frontend file `frontend/src/unused.ts` containing `const unusedValue = 1; export {};`
- **When** the developer runs `git commit -m "Unused var"`
- **Then** the commit is not created
- **And** the hook output contains `unused.ts` and `no-unused-vars`

### Prettier rewrites a committed frontend file
Scenario: Unformatted frontend file is reformatted and the commit blocked

- **Given** hooks installed and a staged frontend file `frontend/src/ugly.ts` containing `export const a   =   {b:1}`
- **When** the developer runs `git commit -m "Ugly file"`
- **Then** the commit is not created
- **And** `frontend/src/ugly.ts` in the working tree now passes the frontend format check
- **And** after `git add frontend/src/ugly.ts` and the same commit command, the commit is created

### ruff format rewrites a committed backend file
Scenario: Unformatted backend file is reformatted and the commit blocked

- **Given** hooks installed and a staged backend file `backend/ugly.py` containing `x  =  {'a':1}`
- **When** the developer runs `git commit -m "Ugly backend file"`
- **Then** the commit is not created
- **And** `backend/ugly.py` in the working tree now contains `x = {"a": 1}`
- **And** after `git add backend/ugly.py` and the same commit command, the commit is created

### Nothing left after a passing run
Scenario: E2E stack is removed afterwards

- **Given** a list of docker containers and volumes taken before the run
- **When** the root E2E command has finished with status 0
- **Then** `docker ps -a` and `docker volume ls` show no container or volume that was not in the list before the run

### Nothing left after a failing run
Scenario: E2E stack is removed after a failed check

- **Given** the start page temporarily changed to have no `h1`, so the browser check fails, and a list of docker containers and volumes taken before the run
- **When** the developer runs the root E2E command
- **Then** the command exits with a non-zero status
- **And** `docker ps -a` and `docker volume ls` show no container or volume that was not in the list before the run

### E2E with the development stack running
Scenario: E2E runs next to the development stack

- **Given** the development stack running on ports 8000, 3000 and 5432 with an administrator `admin` / `Adm1n-pass-2026`
- **When** the developer runs the root E2E command
- **Then** the command exits with status 0
- **And** afterwards `GET http://localhost:8000/api/health/` still returns status 200 and `http://localhost:3000/` still returns 200
- **And** signing in at `http://localhost:8000/admin/` as `admin` with `Adm1n-pass-2026` still shows `Site administration`

### Fresh setup by the README **[developer]**
Scenario: New developer follows the README

- **Given** a machine with only the tools the README lists as required, and a fresh clone
- **When** a developer who has not worked on the project follows the README from top to bottom
- **Then** the stack starts, `http://localhost:3000/` returns 200 and `GET http://localhost:8000/api/health/` returns 200
- **And** the root lint, test and E2E commands each exit with status 0
- **And** the developer needed no step that is not in the README

### Standalone start by the README **[developer]**
Scenario: Developer starts a project on its own from the README

- **Given** a fresh clone, `make install` done and no stack running
- **When** the developer follows the README section for starting the backend and the frontend on their own outside docker compose
- **Then** `GET http://localhost:8000/api/health/` returns status 200
- **And** `http://localhost:3000/` returns status 200
