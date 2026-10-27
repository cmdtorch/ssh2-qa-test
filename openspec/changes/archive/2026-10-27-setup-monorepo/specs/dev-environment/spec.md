# Spec Delta

## Purpose

Defines the monorepo as a whole for developers: its layout, starting the full local stack with one command, the shared root commands, the pre-commit checks, the E2E check and the setup documentation.

## ADDED Requirements

### Requirement: Repository layout
The repository SHALL be a git repository whose root contains the `backend/` and `frontend/` projects, a README, a Makefile, the docker compose stack definition, the pnpm workspace definition, the pre-commit configuration and the example settings file.

#### Scenario: Top-level layout
- **WHEN** a developer lists the repository root after this change
- **THEN** it contains the `backend/` and `frontend/` directories, the README, the Makefile, the docker compose file, the pnpm workspace file, the pre-commit configuration and the example settings file
- **AND** the root is a git repository

#### Scenario: No CI configuration
- **WHEN** a developer looks for CI configuration in the repository after this change
- **THEN** there is no `.github/workflows/` directory and no other CI pipeline file

### Requirement: Start the full stack with one command
A single docker compose command SHALL start the backend, the frontend and PostgreSQL together. Each service SHALL use its default port (backend 8000, frontend 3000, PostgreSQL 5432) unless overridden by `BACKEND_PORT`, `FRONTEND_PORT` or `POSTGRES_PORT` in the settings file.

#### Scenario: Full stack starts
- **WHEN** a developer with only the example settings copied starts the stack
- **THEN** the frontend start page answers with status 200 on port 3000
- **AND** `GET /api/health/` answers with status 200 on port 8000
- **AND** PostgreSQL accepts connections on port 5432

#### Scenario: Overridden ports in the stack
- **WHEN** the settings file sets `BACKEND_PORT` to 8100, `FRONTEND_PORT` to 3100 and `POSTGRES_PORT` to 5532 and the stack is started
- **THEN** the backend, the frontend and PostgreSQL answer on 8100, 3100 and 5532 respectively

#### Scenario: Port already in use
- **WHEN** another program already listens on port 3000 and the stack is started with default ports
- **THEN** the stack start fails with an error that port 3000 is already allocated
- **AND** setting `FRONTEND_PORT` to a free port in the settings file lets the stack start

### Requirement: Backend waits for the database and migrates on start
When the backend starts in the stack, it SHALL wait up to 60 seconds until PostgreSQL accepts connections, then apply all pending migrations before it begins serving requests. If PostgreSQL is still unreachable after 60 seconds, or a migration fails, the backend SHALL stop with a non-zero exit status and SHALL NOT serve requests. Inside the stack the backend SHALL reach PostgreSQL through the stack's own network address, whatever host `DATABASE_URL` names in `.env`.

#### Scenario: Fresh database is migrated
- **WHEN** the stack is started against an empty PostgreSQL volume
- **THEN** all backend migrations are applied
- **AND** `GET /api/health/` answers with status 200

#### Scenario: Backend waits for a slow database
- **WHEN** the stack is started and PostgreSQL begins accepting connections only after the backend container has started
- **THEN** the backend applies migrations once PostgreSQL is ready
- **AND** `GET /api/health/` answers with status 200 without restarting the stack

#### Scenario: Database never becomes ready
- **WHEN** the stack is started and PostgreSQL does not accept connections for 60 seconds after the backend container has started
- **THEN** the backend container exits with a non-zero status
- **AND** the backend log contains `Database is unreachable after 60 seconds`

#### Scenario: Failed migration stops the backend
- **WHEN** a pending migration fails while the backend starts in the stack
- **THEN** the backend container exits with a non-zero status
- **AND** the backend port does not answer HTTP requests
- **AND** the backend log shows the migration error

#### Scenario: Restart keeps existing data
- **WHEN** an administrator is created, the stack is stopped and started again with no pending migrations
- **THEN** the backend starts without error
- **AND** that administrator can still sign in to the admin panel

### Requirement: Development mode with live code reload
The stack SHALL run the backend and the frontend from the source directories of the checkout, so that saved code changes take effect without rebuilding images or restarting the stack.

#### Scenario: Frontend change is picked up
- **WHEN** a developer changes the start page `h1` text while the stack is running
- **THEN** reloading the start page shows the new heading text

#### Scenario: Backend change is picked up
- **WHEN** a developer changes the backend code so that `GET /api/health/` returns an extra field while the stack is running
- **THEN** the next `GET /api/health/` response contains that field

#### Scenario: Backend recovers after a syntax error is fixed
- **WHEN** a developer saves a backend Python file with a syntax error while the stack is running, and then saves the fixed file
- **THEN** while the error is present the backend log shows the syntax error and `GET /api/health/` does not return status 200
- **AND** after the fix `GET /api/health/` returns status 200 without rebuilding images or restarting the stack

### Requirement: Root commands
The repository root SHALL provide a Makefile with commands to install everything (backend and frontend dependencies and the pre-commit hooks), start the stack, stop the stack, run all checks (backend and frontend lint and format checks and the frontend TypeScript type check), run all unit tests, and run the E2E check. Each command SHALL exit with a non-zero status when any step it runs fails.

#### Scenario: Install everything
- **WHEN** a developer runs the root install command in a clean checkout
- **THEN** the backend and frontend dependencies are installed from their lock files
- **AND** the pre-commit hooks are installed in the git repository
- **AND** the command exits with status 0

#### Scenario: A failing install step fails the root install command
- **WHEN** one step of the root install command fails, for example because the frontend lock file is out of date with its package manifest
- **THEN** the root install command exits with a non-zero status
- **AND** its output shows the failing step

#### Scenario: Repeated install and start
- **WHEN** a developer runs the root install command a second time, and runs the root start command while the stack is already running
- **THEN** both commands exit with status 0
- **AND** the stack keeps running with one container per service

#### Scenario: Run all checks
- **WHEN** a developer runs the root lint command on the code as delivered by this change
- **THEN** the backend lint and format checks, the frontend lint and format checks and the frontend type check all run
- **AND** the command exits with status 0

#### Scenario: Type error fails the root lint command
- **WHEN** a frontend source file has a type error and the developer runs the root lint command
- **THEN** the command exits with a non-zero status

#### Scenario: Run all unit tests
- **WHEN** a developer runs the root test command on the code as delivered by this change
- **THEN** the backend tests and the frontend unit tests both run
- **AND** the command exits with status 0

#### Scenario: A failing step fails the root command
- **WHEN** a backend test fails and the developer runs the root test command
- **THEN** the root test command exits with a non-zero status

#### Scenario: Start and stop the stack
- **WHEN** a developer runs the root start command and then the root stop command
- **THEN** after start the backend, the frontend and PostgreSQL are running
- **AND** after stop none of the stack's containers is running

### Requirement: Pre-commit checks
The repository SHALL provide pre-commit hooks that run the backend and frontend lint and format checks on the files being committed, and SHALL NOT run tests. A file that is not formatted SHALL be reformatted by the hook and the commit SHALL be blocked, so the developer stages the reformatted file and commits again.

#### Scenario: Clean commit passes
- **WHEN** a developer who has run the root install command commits files that pass the lint and format checks
- **THEN** the commit is created

#### Scenario: Commit with a backend lint violation is blocked
- **WHEN** a developer with the hooks installed commits a backend file containing an unused import
- **THEN** the commit is not created
- **AND** the hook output names the file and the violation

#### Scenario: Commit with a frontend lint violation is blocked
- **WHEN** a developer with the hooks installed commits a frontend file that declares a variable that is never used
- **THEN** the commit is not created
- **AND** the hook output names the file and the rule

#### Scenario: Unformatted frontend file is reformatted and the commit blocked
- **WHEN** a developer with the hooks installed commits an unformatted frontend file
- **THEN** the commit is not created
- **AND** the file in the working tree is now formatted
- **AND** staging the reformatted file and committing again creates the commit

#### Scenario: Unformatted backend file is reformatted and the commit blocked
- **WHEN** a developer with the hooks installed commits an unformatted backend Python file
- **THEN** the commit is not created
- **AND** the file in the working tree is now formatted
- **AND** staging the reformatted file and committing again creates the commit

### Requirement: E2E check on a throwaway stack
The root E2E command SHALL start its own separate stack with the real backend and a throwaway, empty PostgreSQL database volume, on ports different from the development stack's, run the Playwright browser check that the frontend start page opens, and always remove that stack and volume afterwards, also when the check fails. It SHALL NOT use or change the development stack's database and SHALL work while the development stack is running.

#### Scenario: Start page opens in the browser
- **WHEN** a developer runs the root E2E command
- **THEN** a browser opens the frontend start page of the E2E stack
- **AND** the page shows its `h1` heading
- **AND** the command exits with status 0

#### Scenario: E2E stack is removed afterwards
- **WHEN** the root E2E command has finished
- **THEN** no container or database volume of the E2E stack remains

#### Scenario: E2E stack is removed after a failed check
- **WHEN** the browser check fails during the root E2E command
- **THEN** the command exits with a non-zero status
- **AND** no container or database volume of the E2E stack remains

#### Scenario: E2E runs next to the development stack
- **WHEN** the development stack is running with an existing administrator and the developer runs the root E2E command
- **THEN** the E2E command exits with status 0
- **AND** the development stack keeps running on its ports
- **AND** that administrator can still sign in to the development stack's admin panel

### Requirement: Setup documentation
The root README SHALL describe the required tools on a developer machine, installation, starting and stopping the stack, starting the backend or the frontend on its own outside docker compose, creating an administrator, and running the checks, unit tests and the E2E check.

#### Scenario: New developer follows the README
- **WHEN** a developer with only the required tools installed follows the README on a clean checkout
- **THEN** the stack starts and the start page and `GET /api/health/` answer with status 200
- **AND** the root lint, test and E2E commands exit with status 0

#### Scenario: Developer starts a project on its own from the README
- **WHEN** a developer follows the README section for starting the backend and the frontend on their own outside docker compose
- **THEN** `GET /api/health/` on port 8000 returns status 200
- **AND** the frontend start page on port 3000 returns status 200
