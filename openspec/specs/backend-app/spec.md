# backend-app Specification

## Purpose

Defines the backend web application of the monorepo: how it is configured and started, which database it uses, how its health is reported, and the checks that guard its code.

## Requirements

### Requirement: Backend project location and dependencies
The backend SHALL be a Django project in the `backend/` directory of the repository. Its Python dependencies SHALL be managed with uv, declared in `pyproject.toml` with a committed `uv.lock`, so that installing from the lock file reproduces the same dependency versions on every machine.

#### Scenario: Install backend dependencies from the lock file
- **WHEN** a developer runs the uv install from the committed lock file in a clean checkout
- **THEN** the installation succeeds without editing any file
- **AND** the lock file is unchanged afterwards

### Requirement: Backend configuration from environment variables
The backend SHALL read `DATABASE_URL` (the database address as one URL), `SECRET_KEY` and `DEBUG` from environment variables, and when started on its own SHALL also load them from the `.env` file at the repository root. The repository SHALL contain an example settings file at its root with safe development values for every variable, including `DEBUG` on and a `DATABASE_URL` pointing at PostgreSQL on `localhost` and `POSTGRES_PORT`. The `.env` file SHALL be excluded from version control.

#### Scenario: Backend started on its own with the example settings
- **WHEN** a developer copies the example settings file to `.env` without changes, starts only the PostgreSQL service of the stack, and starts the backend on its own outside docker compose
- **THEN** the backend starts with debug mode on
- **AND** `GET /api/health/` on port 8000 returns status 200

#### Scenario: Real settings file is not tracked
- **WHEN** a developer creates `.env` at the repository root
- **THEN** version control reports it as ignored, not as a new file to commit

### Requirement: Debug mode is off unless enabled
Debug mode SHALL be on only when `DEBUG` is `1` or `true`, compared without regard to case. Any other value, or `DEBUG` not set, SHALL mean debug mode off.

#### Scenario: Debug variable unset
- **WHEN** the backend is started with `SECRET_KEY` and `DATABASE_URL` set and `DEBUG` unset, and a client requests an unknown address with host `localhost`
- **THEN** the response status is 404
- **AND** the response is the standard 404 page without debug details

#### Scenario: Debug enabled with a true value
- **WHEN** the backend is started with `DATABASE_URL` set and `DEBUG` set to `TRUE`, and a client requests an unknown address with host `localhost`
- **THEN** the response status is 404
- **AND** the response is the debug 404 page that lists the known URL patterns

#### Scenario: Debug enabled with 1
- **WHEN** the backend is started with `DATABASE_URL` set and `DEBUG` set to `1`, and a client requests an unknown address with host `localhost`
- **THEN** the response status is 404
- **AND** the response is the debug 404 page that lists the known URL patterns

#### Scenario: Unrecognised debug value
- **WHEN** the backend is started with `SECRET_KEY` and `DATABASE_URL` set and `DEBUG` set to `yes`, and a client requests an unknown address with host `localhost`
- **THEN** the response is the standard 404 page without debug details

### Requirement: Required settings outside debug mode
With debug mode off, `SECRET_KEY` and `DATABASE_URL` SHALL be required. If either is missing, the backend SHALL refuse to start and its error output SHALL contain the name of the missing variable.

#### Scenario: Missing secret key outside debug mode
- **WHEN** the backend is started with debug mode off, `DATABASE_URL` set and `SECRET_KEY` not set
- **THEN** the backend does not start
- **AND** its error output contains `SECRET_KEY`

#### Scenario: Missing database address outside debug mode
- **WHEN** the backend is started with debug mode off, `SECRET_KEY` set and `DATABASE_URL` not set
- **THEN** the backend does not start
- **AND** its error output contains `DATABASE_URL`

### Requirement: Settings fallback in debug mode
With debug mode on, a missing `SECRET_KEY` SHALL be replaced by a development key, while a missing `DATABASE_URL` SHALL still stop the start-up.

#### Scenario: Missing secret key in debug mode
- **WHEN** the backend is started with debug mode on, `DATABASE_URL` pointing at a reachable PostgreSQL database and `SECRET_KEY` not set
- **THEN** the backend starts
- **AND** `GET /api/health/` returns status 200

#### Scenario: Missing database address in debug mode
- **WHEN** the backend is started with debug mode on and `DATABASE_URL` not set
- **THEN** the backend does not start
- **AND** its error output contains `DATABASE_URL`

### Requirement: Allowed host names
With debug mode off, the backend SHALL by default answer only requests addressed to `localhost` or `127.0.0.1`. An optional environment variable SHALL extend this list.

#### Scenario: Request to an allowed host
- **WHEN** the backend runs with debug mode off and the optional host variable unset, and a client sends `GET /api/health/` with host `127.0.0.1`
- **THEN** the response status is 200

#### Scenario: Request to a host that is not allowed
- **WHEN** the backend runs with debug mode off and the optional host variable unset, and a client sends `GET /api/health/` with host `example.com`
- **THEN** the response status is 400

#### Scenario: Extra allowed host
- **WHEN** the backend runs with debug mode off and the optional host variable lists `example.com`, and a client sends `GET /api/health/` with host `example.com`
- **THEN** the response status is 200

### Requirement: Backend serves on a configurable port
The backend SHALL listen on port 8000 by default, and the port SHALL be overridable through the `BACKEND_PORT` environment variable. When started on its own outside docker compose, it SHALL also read `BACKEND_PORT` from the `.env` file at the repository root.

#### Scenario: Backend on the default port
- **WHEN** the backend is started without `BACKEND_PORT` set
- **THEN** it accepts HTTP requests on port 8000

#### Scenario: Backend on an overridden port
- **WHEN** the backend is started with `BACKEND_PORT` set to 8100
- **THEN** it accepts HTTP requests on port 8100

#### Scenario: Backend port from the root settings file
- **WHEN** the root `.env` sets `BACKEND_PORT` to 8200, the shell does not set it, and the backend is started on its own outside docker compose
- **THEN** it accepts HTTP requests on port 8200

#### Scenario: Backend port already in use
- **WHEN** another program already listens on port 8000 and the backend is started on its own without `BACKEND_PORT` set
- **THEN** the backend does not start serving
- **AND** its error output states that the port is already in use

### Requirement: Backend uses PostgreSQL outside automated tests
For local development the backend SHALL store its data in the PostgreSQL database given by `DATABASE_URL`.

#### Scenario: Migrations applied to PostgreSQL
- **WHEN** the backend migrations are applied with the development settings
- **THEN** the tables of Django's built-in users, admin, sessions and content-types apps exist in the configured PostgreSQL database
- **AND** the migration check reports no unapplied migrations

#### Scenario: Migrations with PostgreSQL unreachable
- **WHEN** the backend migrations are applied while the PostgreSQL server named in `DATABASE_URL` is not running
- **THEN** the migration command exits with a non-zero status
- **AND** its error output states that the connection to the database failed

### Requirement: Backend automated tests use SQLite
The backend's own automated tests SHALL run with pytest against a SQLite database and SHALL NOT require a running PostgreSQL server.

#### Scenario: Backend tests without PostgreSQL
- **WHEN** the backend test command is run on a machine with no PostgreSQL server reachable
- **THEN** all backend tests run and pass

### Requirement: Health-check endpoint
The backend SHALL expose `GET /api/health/`, which requires no authentication, works with debug mode on or off, checks the database connection and returns a JSON body describing the result. Other HTTP methods SHALL be rejected.

#### Scenario: Healthy backend
- **WHEN** a client sends `GET /api/health/` while the database is reachable
- **THEN** the response status is 200
- **AND** the response has a JSON content type
- **AND** the body is `{"status": "ok", "database": "ok"}`

#### Scenario: Database unavailable
- **WHEN** a client sends `GET /api/health/` while the database is unreachable
- **THEN** the response status is 503
- **AND** the response has a JSON content type
- **AND** the body is `{"status": "error", "database": "unavailable"}`

#### Scenario: Method other than GET
- **WHEN** a client sends `POST /api/health/`
- **THEN** the response status is 405

### Requirement: REST API baseline without business endpoints
The backend SHALL serve its API through Django REST Framework under `/api/`, and SHALL expose no API endpoint other than the health check in this change.

#### Scenario: Unknown API address
- **WHEN** a client sends `GET /api/does-not-exist/`
- **THEN** the response status is 404

### Requirement: Built-in admin panel is the only sign-in
The backend SHALL enable Django's standard admin panel at `/admin/`, protected by its standard administrator login. An administrator account SHALL be created with Django's standard command. The admin login SHALL be the only sign-in page: the Django REST Framework browsable-API login SHALL NOT be enabled and no user sign-in or registration pages SHALL exist.

#### Scenario: Anonymous visitor is sent to the admin login
- **WHEN** a visitor who is not signed in opens `/admin/`
- **THEN** the visitor is redirected to the admin login page

#### Scenario: Administrator signs in to the admin panel
- **WHEN** an administrator created with the standard command signs in on the admin login page with correct credentials
- **THEN** the admin panel index page is shown

#### Scenario: Wrong administrator password
- **WHEN** someone signs in on the admin login page with a correct username and a wrong password
- **THEN** the admin panel index page is not shown
- **AND** the login page shows Django's standard invalid-credentials error message

#### Scenario: Administrator with an existing username
- **WHEN** an administrator `admin` exists and the standard command is run again to create an administrator with the username `admin`
- **THEN** the command reports that the username is already taken
- **AND** there is still exactly one user with the username `admin`

#### Scenario: No sign-in or registration outside the admin panel
- **WHEN** a client sends GET requests to `/api-auth/login/`, `/accounts/login/`, `/accounts/signup/` and `/register/`
- **THEN** each response status is 404

### Requirement: Admin static files in development
With debug mode on, in the stack and when started on its own, the backend SHALL serve the admin panel's static files (stylesheets, scripts, images) under `/static/admin/`. Serving static files with debug mode off is production configuration and is not required by this change.

#### Scenario: Admin panel styles are served in development
- **WHEN** the backend runs with debug mode on, in the stack or on its own, and a browser opens the admin login page and, after signing in, the admin panel index page
- **THEN** every request those pages make under `/static/admin/` returns status 200
- **AND** the admin stylesheet `/static/admin/css/base.css` returns status 200 with a `text/css` content type

### Requirement: Backend lint and format checks
The backend SHALL have a ruff lint check and a ruff format check that report violations with a non-zero exit status.

#### Scenario: Clean backend passes the checks
- **WHEN** the backend lint and format checks run on the code as delivered by this change
- **THEN** both exit with status 0

#### Scenario: Lint violation is reported
- **WHEN** a backend Python file contains an unused import and the lint check runs
- **THEN** the check exits with a non-zero status
- **AND** its output names the file and the violation

#### Scenario: Format violation is reported
- **WHEN** a backend Python file is not formatted according to ruff and the format check runs
- **THEN** the check exits with a non-zero status
- **AND** its output names the file
