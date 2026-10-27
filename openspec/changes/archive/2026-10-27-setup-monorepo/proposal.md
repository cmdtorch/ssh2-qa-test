# Proposal

## Why

The project has no application code yet; before any product feature can be built it needs a monorepo with a Django backend and a React + Next.js frontend [desc]. This change lays down that skeleton, its local environment and its quality tooling so later changes start from a working, checked base [desc][Q2][Q10].

## What Changes

- Add a monorepo with two top-level projects: `backend/` and `frontend/` [Q3].
- Add an empty Django backend project with Django REST Framework installed, no business endpoints [Q2][Q8][Q12].
- Manage backend Python dependencies and environment with uv (`pyproject.toml` + lock file) [Q6].
- Configure the backend to use PostgreSQL for local work, and SQLite for the backend's own automated tests [Q7][Q15].
- Add an empty Next.js frontend project written in TypeScript; it does not call the backend [Q2][Q4][Q14].
- Use pnpm with workspaces at the repository root for the frontend packages [Q5].
- Add a docker compose setup that starts the backend, the frontend and PostgreSQL together; each project can also be started on its own [Q9][Q14].
- Add code-quality tooling: ruff and pytest for the backend; ESLint, Prettier, Vitest and React Testing Library for the frontend; pre-commit hooks running the checks [Q10][Q16].
- Initialise a git repository; no CI configuration in this change [Q11].
- Add a Playwright E2E check, run against the real backend started locally on an empty PostgreSQL test database from docker compose, that only verifies the frontend start page opens [Q13][Q14][Q15].

Out of scope: authentication and users, business models and product pages, deployment and production configuration, a UI library or design system [Q12].

## Capabilities

### New Capabilities

- `backend-app`: the Django backend project — how it starts, which database it uses in each environment, its API framework baseline and its own test and lint commands [Q2][Q6][Q7][Q8][Q10][Q15].
- `web-app`: the Next.js frontend project — how it starts, its start page, and its own lint, format and unit-test commands [Q2][Q4][Q5][Q10][Q16].
- `dev-environment`: the monorepo as a whole — repository layout, starting everything with docker compose, pre-commit checks, the git repository and the E2E check of the running stack [Q3][Q9][Q10][Q11][Q13][Q14].

### Modified Capabilities

None.

## Impact

- New code: `backend/`, `frontend/`, root workspace and docker compose files, pre-commit configuration, E2E test setup [Q3][Q5][Q9][Q10][Q13].
- New dependencies: Django, Django REST Framework, PostgreSQL driver, ruff, pytest (backend); Next.js, React, TypeScript, ESLint, Prettier, Vitest, React Testing Library, Playwright (frontend / E2E) [Q4][Q6][Q8][Q10][Q13][Q16].
- Developer machines need Docker, uv, Node.js and pnpm to work with the repository [Q5][Q6][Q9].
- The directory becomes a git repository [Q11].

## Assumptions & Open Questions

- [assumption] The frontend start page is the minimal page from the Next.js scaffold, without design work.
- [assumption] Exact versions of Python, Django, Node.js and Next.js, and the Next.js router, are chosen in the design stage (current stable versions).
- [assumption] Because the frontend does not call the backend, the E2E check does not exercise the backend through the interface; the backend is verified by its own tests.
