# web-app Specification

## Purpose

Defines the web frontend of the monorepo: where it lives, how it is started, what its start page shows, and the checks and unit tests that guard its code.

## Requirements

### Requirement: Frontend project location and language
The frontend SHALL be a Next.js application in the `frontend/` directory of the repository, written in TypeScript, and part of the repository's pnpm workspace with a committed `pnpm-lock.yaml` at the repository root.

#### Scenario: Install frontend dependencies from the lock file
- **WHEN** a developer runs the pnpm install with a frozen lock file in a clean checkout
- **THEN** the installation succeeds without editing any file
- **AND** the lock file is unchanged afterwards

#### Scenario: Type check passes
- **WHEN** the frontend TypeScript type check runs on the code as delivered by this change
- **THEN** it exits with status 0

#### Scenario: Type error is reported
- **WHEN** a frontend source file assigns a number to a variable declared as a string and the type check runs
- **THEN** the check exits with a non-zero status
- **AND** its output names the file

### Requirement: Frontend serves on a configurable port
The frontend development server SHALL listen on port 3000 by default, and the port SHALL be overridable through the `FRONTEND_PORT` environment variable. When started on its own outside docker compose, it SHALL also read `FRONTEND_PORT` from the `.env` file at the repository root. If the configured port is already in use, the development server SHALL exit with a non-zero status and SHALL NOT serve on any other port.

#### Scenario: Frontend on the default port
- **WHEN** the frontend development server is started without `FRONTEND_PORT` set
- **THEN** it serves the start page on port 3000

#### Scenario: Frontend on an overridden port
- **WHEN** the frontend development server is started with `FRONTEND_PORT` set to 3100
- **THEN** it serves the start page on port 3100

#### Scenario: Frontend port from the root settings file
- **WHEN** the root `.env` sets `FRONTEND_PORT` to 3200, the shell does not set it, and the frontend development server is started on its own outside docker compose
- **THEN** it serves the start page on port 3200

#### Scenario: Frontend port already in use
- **WHEN** another program already listens on port 3000 and the frontend development server is started on its own without `FRONTEND_PORT` set
- **THEN** the development server process exits with a non-zero status
- **AND** it does not start serving on any other port
- **AND** its output states that port 3000 is already in use

### Requirement: Minimal start page
The frontend SHALL serve a minimal start page at its root address with one top-level heading (`h1`); the heading text is not fixed. The start page SHALL NOT call the backend.

#### Scenario: Start page opens
- **WHEN** a browser opens the frontend root address
- **THEN** the response status is 200
- **AND** the page contains exactly one `h1` element with non-empty text

#### Scenario: Start page works without the backend
- **WHEN** a browser opens the frontend root address while the backend is not running
- **THEN** the start page is shown without an error
- **AND** the browser makes no request to the backend's address

### Requirement: Frontend lint and format checks
The frontend SHALL have an ESLint lint check and a Prettier format check that report violations with a non-zero exit status.

#### Scenario: Clean frontend passes the checks
- **WHEN** the frontend lint and format checks run on the code as delivered by this change
- **THEN** both exit with status 0

#### Scenario: Format violation is reported
- **WHEN** a frontend source file is not formatted according to Prettier and the format check runs
- **THEN** the check exits with a non-zero status
- **AND** its output names the file

#### Scenario: Lint violation is reported
- **WHEN** a frontend source file declares a variable that is never used and the lint check runs
- **THEN** the check exits with a non-zero status
- **AND** its output names the file and the rule

### Requirement: Frontend unit tests
The frontend SHALL have a unit-test command using Vitest and React Testing Library that renders components in a simulated browser environment and reports failures with a non-zero exit status.

#### Scenario: Start page unit test passes
- **WHEN** the frontend unit-test command runs on the code as delivered by this change
- **THEN** a test that renders the start page and finds its `h1` heading passes
- **AND** the command exits with status 0

#### Scenario: Failing unit test is reported
- **WHEN** a frontend unit test fails
- **THEN** the unit-test command exits with a non-zero status
- **AND** its output names the failing test
