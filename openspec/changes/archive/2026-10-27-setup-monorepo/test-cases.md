# Test Cases

## backend-app

### Scenario: Install backend dependencies from the lock file

#### Case: Clean install from uv.lock
Labels: manual
- **Given** a fresh clone of the repository with no `backend/.venv` directory and the committed `backend/uv.lock`
- **When** the developer runs `uv sync --frozen` in `backend/`
- **Then** the command exits with status 0
- **And** `git status --porcelain backend/` prints nothing
- **And** `uv pip list` shows Django and Django REST Framework at the versions pinned in `backend/uv.lock`

#### Case: Lock file out of date with pyproject.toml
Labels: manual
- **Given** a fresh clone in which `backend/pyproject.toml` gains the dependency `requests` but `backend/uv.lock` is not updated
- **When** the developer runs `uv sync --locked` in `backend/`
- **Then** the command exits with a non-zero status
- **And** `backend/uv.lock` is unchanged

### Scenario: Backend started on its own with the example settings

#### Case: Standalone backend with unchanged example settings
Labels: manual
- **Given** the example settings file copied to `.env` at the repository root without changes, and only the PostgreSQL service of the stack running on port 5432
- **When** the developer starts the backend on its own from `backend/` outside docker compose
- **Then** `GET http://localhost:8000/api/health/` returns status 200 with body `{"status": "ok", "database": "ok"}`
- **And** `GET http://localhost:8000/does-not-exist/` returns the debug 404 page that lists the known URL patterns

#### Case: Standalone backend while PostgreSQL is stopped
Labels: manual
- **Given** the example settings file copied to `.env` without changes and no PostgreSQL service running
- **When** the developer starts the backend on its own and sends `GET http://localhost:8000/api/health/`
- **Then** the response status is 503
- **And** the body is `{"status": "error", "database": "unavailable"}`

### Scenario: Real settings file is not tracked

#### Case: .env at the root is ignored
Labels: automated
- **Given** a clean working tree at the repository root
- **When** the developer creates `.env` containing `SECRET_KEY=local-secret` and runs `git status --porcelain`
- **Then** the output does not list `.env`
- **And** `git check-ignore .env` prints `.env`

#### Case: Example settings file is tracked
Labels: automated
- **Given** the repository after this change
- **When** the developer runs `git ls-files` at the root
- **Then** the output lists the example settings file
- **And** the output does not list `.env`

### Scenario: Debug variable unset

#### Case: Standard 404 page with DEBUG unset
Labels: automated
- **Given** the backend running with `SECRET_KEY=test-secret-key`, a reachable `DATABASE_URL` and no `DEBUG` variable
- **When** a client sends `GET /no-such-page/` with header `Host: localhost`
- **Then** the response status is 404
- **And** the body does not contain the text `URLconf` and does not list the URL patterns `admin/` and `api/health/`

#### Case: Empty DEBUG value means off
Labels: automated
- **Given** the backend running with `SECRET_KEY=test-secret-key`, a reachable `DATABASE_URL` and `DEBUG=` (empty string)
- **When** a client sends `GET /no-such-page/` with header `Host: localhost`
- **Then** the response status is 404
- **And** the body does not contain the text `URLconf`

### Scenario: Debug enabled with a true value

#### Case: DEBUG=TRUE turns debug on
Labels: automated
- **Given** the backend running with a reachable `DATABASE_URL` and `DEBUG=TRUE`
- **When** a client sends `GET /no-such-page/` with header `Host: localhost`
- **Then** the response status is 404
- **And** the body lists the URL patterns `admin/` and `api/health/`

#### Case: DEBUG=true and DEBUG=True turn debug on
Labels: automated
- **Given** the backend started twice with a reachable `DATABASE_URL`, once with `DEBUG=true` and once with `DEBUG=True`
- **When** in each run a client sends `GET /no-such-page/` with header `Host: localhost`
- **Then** both responses have status 404
- **And** both bodies list the URL patterns `admin/` and `api/health/`

### Scenario: Debug enabled with 1

#### Case: DEBUG=1 turns debug on
Labels: automated
- **Given** the backend running with a reachable `DATABASE_URL` and `DEBUG=1`
- **When** a client sends `GET /no-such-page/` with header `Host: localhost`
- **Then** the response status is 404
- **And** the body lists the URL patterns `admin/` and `api/health/`

### Scenario: Unrecognised debug value

#### Case: DEBUG=yes means off
Labels: automated
- **Given** the backend running with `SECRET_KEY=test-secret-key`, a reachable `DATABASE_URL` and `DEBUG=yes`
- **When** a client sends `GET /no-such-page/` with header `Host: localhost`
- **Then** the response status is 404
- **And** the body does not contain the text `URLconf`

#### Case: DEBUG=0 and DEBUG=false mean off
Labels: automated
- **Given** the backend started twice with `SECRET_KEY=test-secret-key` and a reachable `DATABASE_URL`, once with `DEBUG=0` and once with `DEBUG=false`
- **When** in each run a client sends `GET /no-such-page/` with header `Host: localhost`
- **Then** neither body contains the text `URLconf`

### Scenario: Missing secret key outside debug mode

#### Case: Start refused without SECRET_KEY
Labels: automated
- **Given** the environment has `DATABASE_URL=postgres://app:app@localhost:5432/app`, no `SECRET_KEY` and no `DEBUG`
- **When** the backend is started
- **Then** the process exits with a non-zero status without serving requests
- **And** its error output contains `SECRET_KEY`

#### Case: Empty SECRET_KEY counts as missing
Labels: automated
- **Given** the environment has `DATABASE_URL=postgres://app:app@localhost:5432/app`, `SECRET_KEY=` (empty string) and `DEBUG=0`
- **When** the backend is started
- **Then** the process exits with a non-zero status
- **And** its error output contains `SECRET_KEY`

### Scenario: Missing database address outside debug mode

#### Case: Start refused without DATABASE_URL
Labels: automated
- **Given** the environment has `SECRET_KEY=test-secret-key`, no `DATABASE_URL` and no `DEBUG`
- **When** the backend is started
- **Then** the process exits with a non-zero status without serving requests
- **And** its error output contains `DATABASE_URL`

#### Case: Empty DATABASE_URL counts as missing
Labels: automated
- **Given** the environment has `SECRET_KEY=test-secret-key`, `DATABASE_URL=` (empty string) and `DEBUG=0`
- **When** the backend is started
- **Then** the process exits with a non-zero status
- **And** its error output contains `DATABASE_URL`

#### Case: Both settings missing
Labels: automated
- **Given** the environment has neither `SECRET_KEY` nor `DATABASE_URL` and no `DEBUG`
- **When** the backend is started
- **Then** the process exits with a non-zero status
- **And** its error output contains `SECRET_KEY` or `DATABASE_URL`

### Scenario: Missing secret key in debug mode

#### Case: Development key used when SECRET_KEY is missing
Labels: automated
- **Given** the environment has `DEBUG=1`, `DATABASE_URL` pointing at a running PostgreSQL database and no `SECRET_KEY`
- **When** the backend is started and a client sends `GET /api/health/` with header `Host: localhost`
- **Then** the response status is 200
- **And** the body is `{"status": "ok", "database": "ok"}`

#### Case: Empty SECRET_KEY in debug mode uses the development key
Labels: automated
- **Given** the environment has `DEBUG=1`, `DATABASE_URL` pointing at a running PostgreSQL database and `SECRET_KEY=` (empty string)
- **When** the backend is started and a client sends `GET /api/health/` with header `Host: localhost`
- **Then** the response status is 200

### Scenario: Missing database address in debug mode

#### Case: Start refused without DATABASE_URL in debug mode
Labels: automated
- **Given** the environment has `DEBUG=1`, `SECRET_KEY=test-secret-key` and no `DATABASE_URL`
- **When** the backend is started
- **Then** the process exits with a non-zero status without serving requests
- **And** its error output contains `DATABASE_URL`

#### Case: Empty DATABASE_URL in debug mode
Labels: automated
- **Given** the environment has `DEBUG=1`, `SECRET_KEY=test-secret-key` and `DATABASE_URL=` (empty string)
- **When** the backend is started
- **Then** the process exits with a non-zero status
- **And** its error output contains `DATABASE_URL`

### Scenario: Request to an allowed host

#### Case: Host 127.0.0.1 is accepted
Labels: automated
- **Given** the backend running with debug mode off, `SECRET_KEY` and a reachable `DATABASE_URL` set, and the optional host variable unset
- **When** a client sends `GET /api/health/` with header `Host: 127.0.0.1`
- **Then** the response status is 200

#### Case: Host localhost is accepted
Labels: automated
- **Given** the backend running with debug mode off and the optional host variable unset
- **When** a client sends `GET /api/health/` with header `Host: localhost`
- **Then** the response status is 200

### Scenario: Request to a host that is not allowed

#### Case: Host example.com is rejected
Labels: automated
- **Given** the backend running with debug mode off and the optional host variable unset
- **When** a client sends `GET /api/health/` with header `Host: example.com`
- **Then** the response status is 400

#### Case: Host with a localhost-like prefix is rejected
Labels: automated
- **Given** the backend running with debug mode off and the optional host variable unset
- **When** a client sends `GET /api/health/` with header `Host: localhost.example.com`
- **Then** the response status is 400

### Scenario: Extra allowed host

#### Case: example.com allowed by the optional variable
Labels: automated
- **Given** the backend running with debug mode off and the optional host variable listing `example.com`
- **When** a client sends `GET /api/health/` with header `Host: example.com`
- **Then** the response status is 200

#### Case: Defaults still allowed next to the extra host
Labels: automated
- **Given** the backend running with debug mode off and the optional host variable listing `example.com`
- **When** a client sends `GET /api/health/` with header `Host: localhost`
- **Then** the response status is 200

### Scenario: Backend on the default port

#### Case: Port 8000 without BACKEND_PORT
Labels: manual
- **Given** no `BACKEND_PORT` in the shell or in `.env`, and the other example settings in `.env`
- **When** the developer starts the backend on its own and sends `GET http://localhost:8000/api/health/`
- **Then** the response status is 200

### Scenario: Backend on an overridden port

#### Case: Port 8100 from the shell
Labels: manual
- **Given** `BACKEND_PORT=8100` exported in the shell and nothing on port 8100
- **When** the developer starts the backend on its own and sends `GET http://localhost:8100/api/health/`
- **Then** the response status is 200
- **And** a connection to `localhost:8000` is refused

### Scenario: Backend port from the root settings file

#### Case: Port 8200 from .env
Labels: manual
- **Given** `.env` at the root contains `BACKEND_PORT=8200` and the shell has no `BACKEND_PORT`
- **When** the developer starts the backend on its own outside docker compose and sends `GET http://localhost:8200/api/health/`
- **Then** the response status is 200

### Scenario: Backend port already in use

#### Case: Port 8000 taken by another program
Labels: manual
- **Given** another program listens on port 8000 (for example `python3 -m http.server 8000`) and neither the shell nor `.env` sets `BACKEND_PORT`
- **When** the developer starts the backend on its own
- **Then** the backend process exits with a non-zero status
- **And** `http://localhost:8000/` still answers from the other program
- **And** the backend output contains `Error: That port is already in use.`

### Scenario: Migrations applied to PostgreSQL

#### Case: Built-in tables created in an empty database
Labels: manual
- **Given** an empty PostgreSQL database `app` reachable through `DATABASE_URL` in `.env`
- **When** the developer applies the backend migrations
- **Then** the database contains the tables `auth_user`, `django_admin_log`, `django_session` and `django_content_type`
- **And** the migration check (`manage.py migrate --check`) exits with status 0

### Scenario: Migrations with PostgreSQL unreachable

#### Case: Migrate while PostgreSQL is stopped
Labels: manual
- **Given** `.env` with `DATABASE_URL=postgres://app:app@localhost:5432/app` and no PostgreSQL server listening on port 5432
- **When** the developer applies the backend migrations
- **Then** the command exits with a non-zero status
- **And** its error output contains `connection` and `localhost` and states that the connection failed

### Scenario: Backend tests without PostgreSQL

#### Case: Test run with no PostgreSQL server
Labels: manual
- **Given** no `.env` file at the root, no PostgreSQL server listening on the machine and no stack running
- **When** the developer runs the backend test command in `backend/`
- **Then** the command exits with status 0
- **And** the pytest summary reports 0 failed and 0 errors

#### Case: Test run while .env points at a stopped PostgreSQL
Labels: manual
- **Given** `.env` at the root with `DATABASE_URL=postgres://app:app@localhost:5432/app` and no PostgreSQL server listening on port 5432
- **When** the developer runs the backend test command in `backend/`
- **Then** the command exits with status 0
- **And** the pytest summary reports 0 failed and 0 errors

### Scenario: Healthy backend

#### Case: Health check with a reachable database
Labels: automated
- **Given** the backend running with a reachable database
- **When** a client sends `GET /api/health/` without credentials
- **Then** the response status is 200
- **And** the `Content-Type` header starts with `application/json`
- **And** the body is `{"status": "ok", "database": "ok"}`

#### Case: Health check with debug mode off
Labels: automated
- **Given** the backend running with debug mode off, `SECRET_KEY=test-secret-key` and a reachable database
- **When** a client sends `GET /api/health/` with header `Host: localhost`
- **Then** the response status is 200
- **And** the body is `{"status": "ok", "database": "ok"}`

### Scenario: Database unavailable

#### Case: Health check with the database down
Labels: automated
- **Given** the backend running and its database connection failing (database server stopped)
- **When** a client sends `GET /api/health/`
- **Then** the response status is 503
- **And** the `Content-Type` header starts with `application/json`
- **And** the body is `{"status": "error", "database": "unavailable"}`

#### Case: Health check recovers when the database returns
Labels: manual
- **Given** the backend running and `GET /api/health/` returning 503 because PostgreSQL is stopped
- **When** PostgreSQL is started again and a client sends `GET /api/health/`
- **Then** the response status is 200
- **And** the body is `{"status": "ok", "database": "ok"}`

### Scenario: Method other than GET

#### Case: POST to the health check
Labels: automated
- **Given** the backend running
- **When** a client sends `POST /api/health/` with body `{}`
- **Then** the response status is 405

#### Case: PUT and DELETE to the health check
Labels: automated
- **Given** the backend running
- **When** a client sends `PUT /api/health/` and then `DELETE /api/health/`
- **Then** both responses have status 405

### Scenario: Unknown API address

#### Case: Unknown address under /api/
Labels: automated
- **Given** the backend running
- **When** a client sends `GET /api/does-not-exist/`
- **Then** the response status is 404

#### Case: API root has no endpoint list
Labels: automated
- **Given** the backend running
- **When** a client sends `GET /api/`
- **Then** the response status is 404

### Scenario: Anonymous visitor is sent to the admin login

#### Case: Redirect from /admin/ to the login page
Labels: automated
- **Given** a client with no session cookie
- **When** the client sends `GET /admin/`
- **Then** the response status is 302
- **And** the `Location` header is `/admin/login/?next=/admin/`

### Scenario: Administrator signs in to the admin panel

#### Case: Sign-in with correct credentials
Labels: automated
- **Given** an administrator `admin` with password `Adm1n-pass-2026` created with Django's standard create-superuser command
- **When** the administrator submits the admin login form with username `admin` and password `Adm1n-pass-2026`
- **Then** the browser is redirected to `/admin/`
- **And** the page shows the heading `Site administration`

### Scenario: Wrong administrator password

#### Case: Correct username, wrong password
Labels: automated
- **Given** an administrator `admin` with password `Adm1n-pass-2026`
- **When** someone submits the admin login form with username `admin` and password `wrong-pass`
- **Then** the response is the login page again, not `/admin/`
- **And** the page shows the message `Please enter the correct username and password for a staff account. Note that both fields may be case-sensitive.`

#### Case: Unknown username
Labels: automated
- **Given** no user `ghost` exists
- **When** someone submits the admin login form with username `ghost` and password `Adm1n-pass-2026`
- **Then** the admin panel index page is not shown
- **And** the page shows the message `Please enter the correct username and password for a staff account. Note that both fields may be case-sensitive.`

#### Case: Empty login form
Labels: automated
- **Given** the admin login page
- **When** someone submits the form with an empty username and an empty password
- **Then** the admin panel index page is not shown
- **And** the page shows `This field is required.` for both fields

### Scenario: Admin panel styles are served in development

#### Case: Admin stylesheet on the login page in the stack
Labels: manual
- **Given** the stack started with the example settings (`DEBUG=1`)
- **When** a browser opens `http://localhost:8000/admin/login/` with the network log open
- **Then** the page is shown with the Django admin styling (blue header bar with the text `Django administration`)
- **And** `GET http://localhost:8000/static/admin/css/base.css` returns status 200 with a `Content-Type` starting with `text/css`
- **And** the network log has no request under `/static/admin/` with status 404

#### Case: Admin index page assets after sign-in
Labels: manual
- **Given** the stack started with the example settings and an administrator `admin` with password `Adm1n-pass-2026`
- **When** the administrator signs in at `http://localhost:8000/admin/login/` and the admin panel index page loads, with the network log open
- **Then** every request of the index page under `/static/admin/` returns status 200
- **And** the network log has no request under `/static/admin/` with status 404

#### Case: Admin stylesheet with the backend started on its own
Labels: manual
- **Given** the example settings copied to `.env`, only the PostgreSQL service of the stack running, and the backend started on its own outside docker compose
- **When** a browser opens `http://localhost:8000/admin/login/` with the network log open
- **Then** `GET http://localhost:8000/static/admin/css/base.css` returns status 200 with a `Content-Type` starting with `text/css`
- **And** the network log has no request under `/static/admin/` with status 404

### Scenario: Administrator with an existing username

#### Case: Second administrator named admin
Labels: automated
- **Given** an administrator `admin` already exists
- **When** the standard create-superuser command is run non-interactively with username `admin`, e-mail `admin2@example.com` and password `Second-pass-2026`
- **Then** the command exits with a non-zero status and its output contains `That username is already taken.`
- **And** the database still has exactly one user with the username `admin`

### Scenario: No sign-in or registration outside the admin panel

#### Case: Common sign-in and registration addresses return 404
Labels: automated
- **Given** the backend running
- **When** a client sends `GET` to `/api-auth/login/`, `/accounts/login/`, `/accounts/signup/` and `/register/`
- **Then** each of the four responses has status 404

### Scenario: Clean backend passes the checks

#### Case: ruff check and ruff format on delivered code
Labels: automated
- **Given** the backend code exactly as delivered by this change
- **When** the developer runs the backend lint check and the backend format check
- **Then** both commands exit with status 0

### Scenario: Lint violation is reported

#### Case: Unused import in a backend file
Labels: automated
- **Given** `backend/` contains a Python file whose first line is `import os` and `os` is not used
- **When** the developer runs the backend lint check
- **Then** the command exits with a non-zero status
- **And** the output contains the file path and the rule code `F401`

### Scenario: Format violation is reported

#### Case: Badly formatted backend file
Labels: automated
- **Given** a backend Python file contains the line `x  =  {'a':1}` (extra spaces, single quotes)
- **When** the developer runs the backend format check
- **Then** the command exits with a non-zero status
- **And** the output contains the file path

## web-app

### Scenario: Install frontend dependencies from the lock file

#### Case: Clean install with a frozen lock file
Labels: manual
- **Given** a fresh clone with no `node_modules` directories and the committed `pnpm-lock.yaml` at the root
- **When** the developer runs `pnpm install --frozen-lockfile` at the repository root
- **Then** the command exits with status 0
- **And** `git status --porcelain` prints nothing

#### Case: Lock file out of date
Labels: manual
- **Given** a fresh clone in which `frontend/package.json` gains the dependency `lodash` but `pnpm-lock.yaml` is not updated
- **When** the developer runs `pnpm install --frozen-lockfile`
- **Then** the command exits with a non-zero status
- **And** `pnpm-lock.yaml` is unchanged

### Scenario: Type check passes

#### Case: Type check on delivered code
Labels: automated
- **Given** the frontend code exactly as delivered by this change
- **When** the developer runs the frontend type check
- **Then** the command exits with status 0

### Scenario: Type error is reported

#### Case: Number assigned to a string variable
Labels: automated
- **Given** a frontend file `frontend/src/broken.ts` contains `const title: string = 42;`
- **When** the developer runs the frontend type check
- **Then** the command exits with a non-zero status
- **And** the output contains `broken.ts`

### Scenario: Frontend on the default port

#### Case: Port 3000 without FRONTEND_PORT
Labels: manual
- **Given** no `FRONTEND_PORT` in the shell or in `.env`
- **When** the developer starts the frontend development server on its own and opens `http://localhost:3000/`
- **Then** the response status is 200 and the start page is shown

### Scenario: Frontend on an overridden port

#### Case: Port 3100 from the shell
Labels: manual
- **Given** `FRONTEND_PORT=3100` exported in the shell
- **When** the developer starts the frontend development server on its own and opens `http://localhost:3100/`
- **Then** the response status is 200 and the start page is shown
- **And** a connection to `localhost:3000` is refused

### Scenario: Frontend port from the root settings file

#### Case: Port 3200 from .env
Labels: manual
- **Given** `.env` at the root contains `FRONTEND_PORT=3200` and the shell has no `FRONTEND_PORT`
- **When** the developer starts the frontend development server on its own outside docker compose and opens `http://localhost:3200/`
- **Then** the response status is 200 and the start page is shown

### Scenario: Frontend port already in use

#### Case: Port 3000 taken by another program
Labels: manual
- **Given** another program listens on port 3000 (for example `python3 -m http.server 3000`) and neither the shell nor `.env` sets `FRONTEND_PORT`
- **When** the developer starts the frontend development server on its own
- **Then** the development server process exits with a non-zero status
- **And** `http://localhost:3000/` keeps answering from the other program, and `http://localhost:3001/` refuses the connection
- **And** the development server output states that port 3000 is already in use

### Scenario: Start page opens

#### Case: Start page has exactly one heading
Labels: automated, e2e
- **Given** the frontend running
- **When** a browser opens the frontend root address `/`
- **Then** the response status is 200
- **And** the page contains exactly one `h1` element
- **And** the `h1` text is not empty after trimming spaces

### Scenario: Start page works without the backend

#### Case: Start page with the backend stopped
Labels: manual
- **Given** the frontend running on port 3000 and nothing listening on port 8000
- **When** a browser opens `http://localhost:3000/`
- **Then** the page shows its `h1` heading
- **And** the browser console has no error entries
- **And** the browser's network log has no request to `localhost:8000`

### Scenario: Clean frontend passes the checks

#### Case: ESLint and Prettier on delivered code
Labels: automated
- **Given** the frontend code exactly as delivered by this change
- **When** the developer runs the frontend lint check and the frontend format check
- **Then** both commands exit with status 0

### Scenario: Format violation is reported

#### Case: Badly formatted frontend file
Labels: automated
- **Given** a frontend file `frontend/src/ugly.ts` contains `export const a   =   {b:1}`
- **When** the developer runs the frontend format check
- **Then** the command exits with a non-zero status
- **And** the output contains `ugly.ts`

### Scenario: Lint violation is reported

#### Case: Unused variable in a frontend file
Labels: automated
- **Given** a frontend file `frontend/src/unused.ts` contains `const unusedValue = 1; export {};`
- **When** the developer runs the frontend lint check
- **Then** the command exits with a non-zero status
- **And** the output contains `unused.ts` and the rule name `no-unused-vars`

### Scenario: Start page unit test passes

#### Case: Start page unit test on delivered code
Labels: manual
- **Given** the frontend code exactly as delivered by this change
- **When** the developer runs the frontend unit-test command
- **Then** the output lists a passing test that renders the start page and finds its `h1`
- **And** the command exits with status 0

### Scenario: Failing unit test is reported

#### Case: Deliberately failing unit test
Labels: manual
- **Given** a frontend test file `frontend/src/fail.test.ts` with a test named `always fails` that asserts `expect(1).toBe(2)`
- **When** the developer runs the frontend unit-test command
- **Then** the command exits with a non-zero status
- **And** the output contains `always fails`

## dev-environment

### Scenario: Top-level layout

#### Case: Root contents after the change
Labels: manual
- **Given** a fresh clone of the repository
- **When** the developer lists the repository root
- **Then** it contains `backend/`, `frontend/`, `README.md`, `Makefile`, the docker compose file, `pnpm-workspace.yaml`, `.pre-commit-config.yaml` and the example settings file
- **And** `git rev-parse --is-inside-work-tree` prints `true`

### Scenario: No CI configuration

#### Case: No CI pipeline files
Labels: manual
- **Given** a fresh clone of the repository
- **When** the developer looks for `.github/workflows/`, `.gitlab-ci.yml`, `.circleci/` and `Jenkinsfile`
- **Then** none of them exists

### Scenario: Full stack starts

#### Case: Stack with the example settings
Labels: manual
- **Given** the example settings file copied to `.env` without changes, nothing on ports 3000, 8000 and 5432, and no existing stack volumes
- **When** the developer starts the stack with the root start command
- **Then** `http://localhost:3000/` returns status 200
- **And** `GET http://localhost:8000/api/health/` returns status 200 with body `{"status": "ok", "database": "ok"}`
- **And** `pg_isready -h localhost -p 5432` reports `accepting connections`

### Scenario: Overridden ports in the stack

#### Case: Stack on ports 8100, 3100 and 5532
Labels: manual
- **Given** `.env` sets `BACKEND_PORT=8100`, `FRONTEND_PORT=3100` and `POSTGRES_PORT=5532`
- **When** the developer starts the stack
- **Then** `GET http://localhost:8100/api/health/` returns status 200 with body `{"status": "ok", "database": "ok"}`
- **And** `http://localhost:3100/` returns status 200
- **And** `pg_isready -h localhost -p 5532` reports `accepting connections`
- **And** connections to `localhost:8000`, `localhost:3000` and `localhost:5432` are refused

### Scenario: Port already in use

#### Case: Port 3000 taken by another program
Labels: manual
- **Given** another program listens on port 3000 (for example `python3 -m http.server 3000`) and `.env` has no port overrides
- **When** the developer starts the stack
- **Then** the start fails with an error that mentions port 3000 and that it is already allocated
- **And** after setting `FRONTEND_PORT=3001` in `.env` and starting again, `http://localhost:3001/` returns status 200

### Scenario: Fresh database is migrated

#### Case: First start on an empty volume
Labels: manual
- **Given** no PostgreSQL volume of the stack exists
- **When** the developer starts the stack
- **Then** the backend log lists the applied migrations of the apps `admin`, `auth`, `contenttypes` and `sessions`
- **And** `GET http://localhost:8000/api/health/` returns status 200

### Scenario: Backend waits for a slow database

#### Case: PostgreSQL ready 20 seconds after the backend starts
Labels: manual
- **Given** the stack's PostgreSQL service delayed so that it accepts connections 20 seconds after the backend container starts
- **When** the developer starts the stack
- **Then** the backend applies its migrations after PostgreSQL is ready
- **And** within 30 seconds of PostgreSQL becoming ready, `GET http://localhost:8000/api/health/` returns status 200 without a stack restart

### Scenario: Database never becomes ready

#### Case: PostgreSQL never accepts connections
Labels: manual
- **Given** the stack's PostgreSQL service configured so that it never accepts connections
- **When** the developer starts the stack and waits 70 seconds
- **Then** the backend container has exited with a non-zero status
- **And** the backend log contains `Database is unreachable after 60 seconds`
- **And** a connection to `localhost:8000` is refused

#### Case: PostgreSQL ready just after the limit
Labels: manual
- **Given** the stack's PostgreSQL service delayed so that it accepts connections 65 seconds after the backend container starts
- **When** the developer starts the stack and waits 70 seconds
- **Then** the backend container has exited with a non-zero status
- **And** the backend log contains `Database is unreachable after 60 seconds`

#### Case: PostgreSQL ready just before the limit
Labels: manual
- **Given** the stack's PostgreSQL service delayed so that it accepts connections 55 seconds after the backend container starts
- **When** the developer starts the stack
- **Then** the backend container keeps running
- **And** `GET http://localhost:8000/api/health/` returns status 200

### Scenario: Failed migration stops the backend

#### Case: Migration raising an error
Labels: manual
- **Given** a temporary backend migration that raises an error when applied, and the stack stopped
- **When** the developer starts the stack
- **Then** the backend container exits with a non-zero status
- **And** a connection to `localhost:8000` is refused
- **And** the backend log contains the error raised by that migration

### Scenario: Restart keeps existing data

#### Case: Administrator survives a restart
Labels: manual
- **Given** the stack running and an administrator `admin` with password `Adm1n-pass-2026` created with the standard command
- **When** the developer runs the root stop command and then the root start command
- **Then** the backend log shows no unapplied migrations being applied
- **And** signing in at `http://localhost:8000/admin/` as `admin` with `Adm1n-pass-2026` shows the heading `Site administration`

### Scenario: Frontend change is picked up

#### Case: New heading text without rebuild
Labels: manual
- **Given** the stack running and the start page showing its current `h1`
- **When** the developer changes the `h1` text in the start page source to `Reload check 2026` and saves the file
- **Then** within 10 seconds, reloading `http://localhost:3000/` shows the `h1` text `Reload check 2026`
- **And** no image was rebuilt and no container was restarted by hand

### Scenario: Backend change is picked up

#### Case: Extra field in the health response without rebuild
Labels: manual
- **Given** the stack running and `GET http://localhost:8000/api/health/` returning `{"status": "ok", "database": "ok"}`
- **When** the developer changes the backend code to add the field `"reload": "check"` to the health response and saves the file
- **Then** within 10 seconds, `GET http://localhost:8000/api/health/` returns a body that contains `"reload": "check"`
- **And** no image was rebuilt and no container was restarted by hand

### Scenario: Backend recovers after a syntax error is fixed

#### Case: Syntax error saved and then fixed
Labels: manual
- **Given** the stack running and `GET http://localhost:8000/api/health/` returning 200
- **When** the developer adds the line `def broken(:` to the backend file that defines the health-check view, saves it and, after checking the backend, removes that line and saves again
- **Then** while the line is present the backend log contains `SyntaxError` and `GET http://localhost:8000/api/health/` does not return 200
- **And** within 10 seconds of the fix `GET http://localhost:8000/api/health/` returns 200, with no image rebuilt and no container restarted by hand

### Scenario: Install everything

#### Case: Root install in a fresh clone
Labels: manual
- **Given** a fresh clone with no backend virtual environment, no `node_modules` and no `.git/hooks/pre-commit`
- **When** the developer runs `make install`
- **Then** the command exits with status 0
- **And** the backend environment and `node_modules` exist
- **And** `.git/hooks/pre-commit` exists

### Scenario: A failing install step fails the root install command

#### Case: Frontend lock file out of date
Labels: manual
- **Given** a fresh clone in which `frontend/package.json` gains the dependency `lodash` but `pnpm-lock.yaml` is not updated
- **When** the developer runs `make install`
- **Then** the command exits with a non-zero status
- **And** the output shows the failing pnpm install step

### Scenario: Repeated install and start

#### Case: Second make install
Labels: manual
- **Given** `make install` already done once in this clone
- **When** the developer runs `make install` again
- **Then** the command exits with status 0
- **And** `git status --porcelain` prints nothing

#### Case: Start while the stack is running
Labels: manual
- **Given** the stack already started with the root start command
- **When** the developer runs the root start command again
- **Then** the command exits with status 0
- **And** `docker compose ps` lists exactly one running container each for the backend, the frontend and PostgreSQL

### Scenario: Run all checks

#### Case: Root lint on delivered code
Labels: manual
- **Given** the code exactly as delivered by this change and `make install` done
- **When** the developer runs the root lint command
- **Then** the output shows the backend lint check, the backend format check, the frontend lint check, the frontend format check and the frontend type check running
- **And** the command exits with status 0

#### Case: Backend lint violation fails the root lint command
Labels: manual
- **Given** a backend Python file with an unused `import os`
- **When** the developer runs the root lint command
- **Then** the command exits with a non-zero status
- **And** the output contains the file path and `F401`

### Scenario: Type error fails the root lint command

#### Case: Type error in a frontend file
Labels: manual
- **Given** `frontend/src/broken.ts` contains `const title: string = 42;` and all other checks pass
- **When** the developer runs the root lint command
- **Then** the command exits with a non-zero status
- **And** the output contains `broken.ts`

### Scenario: Run all unit tests

#### Case: Root test on delivered code
Labels: manual
- **Given** the code exactly as delivered by this change and `make install` done
- **When** the developer runs the root test command
- **Then** the output shows the pytest summary of the backend and the Vitest summary of the frontend
- **And** the command exits with status 0

### Scenario: A failing step fails the root command

#### Case: Failing backend test
Labels: manual
- **Given** a backend test `test_always_fails` that asserts `1 == 2`
- **When** the developer runs the root test command
- **Then** the command exits with a non-zero status
- **And** the output contains `test_always_fails`

#### Case: Failing frontend test
Labels: manual
- **Given** a frontend test named `always fails` that asserts `expect(1).toBe(2)` and all backend tests passing
- **When** the developer runs the root test command
- **Then** the command exits with a non-zero status
- **And** the output contains `always fails`

### Scenario: Start and stop the stack

#### Case: Start then stop
Labels: manual
- **Given** no container of the stack running
- **When** the developer runs the root start command, then the root stop command
- **Then** after start, `docker compose ps` lists the backend, frontend and PostgreSQL services as running
- **And** after stop, `docker compose ps` lists no running container of the stack

### Scenario: Clean commit passes

#### Case: Commit of a clean file
Labels: manual
- **Given** `make install` done and a new backend file `backend/clean_example.py` that passes the lint and format checks, staged
- **When** the developer runs `git commit -m "Add clean example"`
- **Then** the commit is created and `git log -1 --format=%s` prints `Add clean example`

#### Case: Hooks do not run tests
Labels: manual
- **Given** `make install` done, a backend test `test_always_fails` that asserts `1 == 2` already in the repository, and a clean staged file
- **When** the developer commits the staged file
- **Then** the commit is created
- **And** the hook output contains no pytest or Vitest output

### Scenario: Commit with a backend lint violation is blocked

#### Case: Unused import in a committed backend file
Labels: manual
- **Given** hooks installed and a staged backend file `backend/bad_import.py` containing `import os` that is never used
- **When** the developer runs `git commit -m "Bad import"`
- **Then** the commit is not created and `git log -1 --format=%s` does not print `Bad import`
- **And** the hook output contains `bad_import.py` and `F401`

### Scenario: Commit with a frontend lint violation is blocked

#### Case: Unused variable in a committed frontend file
Labels: manual
- **Given** hooks installed and a staged frontend file `frontend/src/unused.ts` containing `const unusedValue = 1; export {};`
- **When** the developer runs `git commit -m "Unused var"`
- **Then** the commit is not created
- **And** the hook output contains `unused.ts` and `no-unused-vars`

### Scenario: Unformatted frontend file is reformatted and the commit blocked

#### Case: Prettier rewrites a committed frontend file
Labels: manual
- **Given** hooks installed and a staged frontend file `frontend/src/ugly.ts` containing `export const a   =   {b:1}`
- **When** the developer runs `git commit -m "Ugly file"`
- **Then** the commit is not created
- **And** `frontend/src/ugly.ts` in the working tree now passes the frontend format check
- **And** after `git add frontend/src/ugly.ts` and the same commit command, the commit is created

### Scenario: Unformatted backend file is reformatted and the commit blocked

#### Case: ruff format rewrites a committed backend file
Labels: manual
- **Given** hooks installed and a staged backend file `backend/ugly.py` containing `x  =  {'a':1}`
- **When** the developer runs `git commit -m "Ugly backend file"`
- **Then** the commit is not created
- **And** `backend/ugly.py` in the working tree now contains `x = {"a": 1}`
- **And** after `git add backend/ugly.py` and the same commit command, the commit is created

### Scenario: Start page opens in the browser

#### Case: E2E check of the start page
Labels: e2e
- **Given** no E2E stack running
- **When** the developer runs the root E2E command
- **Then** the Playwright test opens the start page of the E2E stack and finds exactly one `h1` with non-empty text
- **And** the Playwright report lists the start-page test as passed
- **And** the command exits with status 0

### Scenario: E2E stack is removed afterwards

#### Case: Nothing left after a passing run
Labels: manual
- **Given** a list of docker containers and volumes taken before the run
- **When** the root E2E command has finished with status 0
- **Then** `docker ps -a` and `docker volume ls` show no container or volume that was not in the list before the run

### Scenario: E2E stack is removed after a failed check

#### Case: Nothing left after a failing run
Labels: manual
- **Given** the start page temporarily changed to have no `h1`, so the browser check fails, and a list of docker containers and volumes taken before the run
- **When** the developer runs the root E2E command
- **Then** the command exits with a non-zero status
- **And** `docker ps -a` and `docker volume ls` show no container or volume that was not in the list before the run

### Scenario: E2E runs next to the development stack

#### Case: E2E with the development stack running
Labels: manual
- **Given** the development stack running on ports 8000, 3000 and 5432 with an administrator `admin` / `Adm1n-pass-2026`
- **When** the developer runs the root E2E command
- **Then** the command exits with status 0
- **And** afterwards `GET http://localhost:8000/api/health/` still returns status 200 and `http://localhost:3000/` still returns 200
- **And** signing in at `http://localhost:8000/admin/` as `admin` with `Adm1n-pass-2026` still shows `Site administration`

### Scenario: New developer follows the README

#### Case: Fresh setup by the README
Labels: manual
- **Given** a machine with only the tools the README lists as required, and a fresh clone
- **When** a developer who has not worked on the project follows the README from top to bottom
- **Then** the stack starts, `http://localhost:3000/` returns 200 and `GET http://localhost:8000/api/health/` returns 200
- **And** the root lint, test and E2E commands each exit with status 0
- **And** the developer needed no step that is not in the README

### Scenario: Developer starts a project on its own from the README

#### Case: Standalone start by the README
Labels: manual
- **Given** a fresh clone, `make install` done and no stack running
- **When** the developer follows the README section for starting the backend and the frontend on their own outside docker compose
- **Then** `GET http://localhost:8000/api/health/` returns status 200
- **And** `http://localhost:3000/` returns status 200

## General remarks

## Spec changes during test-case review

- Finding "No error case for backend-app/Backend serves on a configurable port" → added scenario "Backend port already in use" (backend-app)
- Finding "No error case for web-app/Frontend serves on a configurable port" → added scenario "Frontend port already in use" (web-app)
- Finding "No error case for backend-app/Backend uses PostgreSQL outside automated tests" → added scenario "Migrations with PostgreSQL unreachable" (backend-app)
- Finding "Duplicate entries not covered for backend-app/Built-in admin panel is the only sign-in" → added scenario "Administrator with an existing username" (backend-app)
- Finding "No error case for dev-environment/Development mode with live code reload" → added scenario "Backend recovers after a syntax error is fixed" (dev-environment)
- Finding "No error case for the root install command in dev-environment/Root commands" → added scenario "A failing install step fails the root install command" (dev-environment)
- Finding "Repeated submission not covered for dev-environment/Root commands" → added scenario "Repeated install and start" (dev-environment)
- QA remark "Нужна проверка что бы стили админ панели не были 404" → added requirement "Admin static files in development" with scenario "Admin panel styles are served in development" (backend-app)
- Design-round question Q44 "Что делает фронтенд при запуске без docker compose, если его порт уже занят?" (answer A) → changed scenario "Frontend port already in use" (web-app): the process exits with a non-zero status and does not move to another port
- Spec review finding "the no-fallback rule appears only in the scenario" (after Q44) → requirement "Frontend serves on a configurable port" now states that a busy configured port makes the development server exit with a non-zero status; scenario "Frontend port already in use" unchanged (web-app)
- Spec review finding "\"states that the database is unreachable\" has no fixed keyword" → changed scenario "Database never becomes ready" to require the log text `Database is unreachable after 60 seconds` (dev-environment), as decided in the Design round

## Stage result

Accepted findings:
- (none)

- Not reviewed by the AI QA reviewer: Lock file out of date with pyproject.toml (backend-app)
- Not reviewed by the AI QA reviewer: Port 8000 taken by another program (backend-app)
- Not reviewed by the AI QA reviewer: Second administrator named admin (backend-app)
- Not reviewed by the AI QA reviewer: Syntax error saved and then fixed (dev-environment)
- Not reviewed by the AI QA reviewer: Port 3000 taken by another program (web-app)
- Not reviewed by the AI QA reviewer: PostgreSQL never accepts connections (dev-environment)
- Not reviewed by the AI QA reviewer: PostgreSQL ready just after the limit (dev-environment)
- Not reviewed by the AI QA reviewer: ruff check and ruff format on delivered code (backend-app) — label changed from manual to automated after Verification-round answer Q47
- Not reviewed by the AI QA reviewer: Unused import in a backend file (backend-app) — label changed from manual to automated after Verification-round answer Q47
- Not reviewed by the AI QA reviewer: Badly formatted backend file (backend-app) — label changed from manual to automated after Verification-round answer Q47
- Not reviewed by the AI QA reviewer: Type check on delivered code (web-app) — label changed from manual to automated after Verification-round answer Q47
- Not reviewed by the AI QA reviewer: Number assigned to a string variable (web-app) — label changed from manual to automated after Verification-round answer Q47
- Not reviewed by the AI QA reviewer: ESLint and Prettier on delivered code (web-app) — label changed from manual to automated after Verification-round answer Q47
- Not reviewed by the AI QA reviewer: Badly formatted frontend file (web-app) — label changed from manual to automated after Verification-round answer Q47
- Not reviewed by the AI QA reviewer: Unused variable in a frontend file (web-app) — label changed from manual to automated after Verification-round answer Q47

Handed over to QA

[Answer]: Looks correct
