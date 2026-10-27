# Verification Plan

## Scenario coverage

| Capability | Requirement | Scenario | Level | Critical | Test data / setup |
|---|---|---|---|---|---|
| backend-app | Backend project location and dependencies | Install backend dependencies from the lock file | manual | no | fresh clone, `backend/uv.lock` |
| backend-app | Backend configuration from environment variables | Backend started on its own with the example settings | manual | no | `.env` copied from `.env.example`; only the `db` service running |
| backend-app | Backend configuration from environment variables | Real settings file is not tracked | integration | no | temporary `.env` at the root; `git check-ignore`, `git ls-files` |
| backend-app | Debug mode is off unless enabled | Debug variable unset | integration | yes | subprocess with a controlled environment; `DEBUG` unset, empty, `TRUE`, `true`, `True`, `1`, `0`, `false`, `yes`; request `GET /no-such-page/` with `Host: localhost` |
| backend-app | Debug mode is off unless enabled | Debug enabled with a true value | integration | yes | subprocess with a controlled environment; `DEBUG` unset, empty, `TRUE`, `true`, `True`, `1`, `0`, `false`, `yes`; request `GET /no-such-page/` with `Host: localhost` |
| backend-app | Debug mode is off unless enabled | Debug enabled with 1 | integration | yes | subprocess with a controlled environment; `DEBUG` unset, empty, `TRUE`, `true`, `True`, `1`, `0`, `false`, `yes`; request `GET /no-such-page/` with `Host: localhost` |
| backend-app | Debug mode is off unless enabled | Unrecognised debug value | integration | yes | subprocess with a controlled environment; `DEBUG` unset, empty, `TRUE`, `true`, `True`, `1`, `0`, `false`, `yes`; request `GET /no-such-page/` with `Host: localhost` |
| backend-app | Required settings outside debug mode | Missing secret key outside debug mode | integration | yes | subprocess with a controlled environment; `SECRET_KEY` / `DATABASE_URL` missing or empty, `DEBUG` off |
| backend-app | Required settings outside debug mode | Missing database address outside debug mode | integration | yes | subprocess with a controlled environment; `SECRET_KEY` / `DATABASE_URL` missing or empty, `DEBUG` off |
| backend-app | Settings fallback in debug mode | Missing secret key in debug mode | integration | yes | subprocess with a controlled environment; `DEBUG=1`, `SECRET_KEY` missing or empty, `DATABASE_URL` missing or empty |
| backend-app | Settings fallback in debug mode | Missing database address in debug mode | integration | yes | subprocess with a controlled environment; `DEBUG=1`, `SECRET_KEY` missing or empty, `DATABASE_URL` missing or empty |
| backend-app | Allowed host names | Request to an allowed host | integration | yes | debug off; `Host` values `localhost`, `127.0.0.1`, `example.com`, `localhost.example.com`; `ALLOWED_HOSTS=example.com` |
| backend-app | Allowed host names | Request to a host that is not allowed | integration | yes | debug off; `Host` values `localhost`, `127.0.0.1`, `example.com`, `localhost.example.com`; `ALLOWED_HOSTS=example.com` |
| backend-app | Allowed host names | Extra allowed host | integration | yes | debug off; `Host` values `localhost`, `127.0.0.1`, `example.com`, `localhost.example.com`; `ALLOWED_HOSTS=example.com` |
| backend-app | Backend serves on a configurable port | Backend on the default port | manual | no | `BACKEND_PORT` 8100 (shell), 8200 (`.env`); another program on 8000 |
| backend-app | Backend serves on a configurable port | Backend on an overridden port | manual | no | `BACKEND_PORT` 8100 (shell), 8200 (`.env`); another program on 8000 |
| backend-app | Backend serves on a configurable port | Backend port from the root settings file | manual | no | `BACKEND_PORT` 8100 (shell), 8200 (`.env`); another program on 8000 |
| backend-app | Backend serves on a configurable port | Backend port already in use | manual | no | `BACKEND_PORT` 8100 (shell), 8200 (`.env`); another program on 8000 |
| backend-app | Backend uses PostgreSQL outside automated tests | Migrations applied to PostgreSQL | manual | no | empty PostgreSQL 17 database `app`; PostgreSQL stopped |
| backend-app | Backend uses PostgreSQL outside automated tests | Migrations with PostgreSQL unreachable | manual | no | empty PostgreSQL 17 database `app`; PostgreSQL stopped |
| backend-app | Backend automated tests use SQLite | Backend tests without PostgreSQL | manual | no | no PostgreSQL listening; with and without `.env` |
| backend-app | Health-check endpoint | Healthy backend | integration | yes | Django test client on SQLite; database error simulated by a failing connection; methods GET, POST, PUT, DELETE |
| backend-app | Health-check endpoint | Database unavailable | integration | yes | Django test client on SQLite; database error simulated by a failing connection; methods GET, POST, PUT, DELETE |
| backend-app | Health-check endpoint | Method other than GET | integration | yes | Django test client on SQLite; database error simulated by a failing connection; methods GET, POST, PUT, DELETE |
| backend-app | REST API baseline without business endpoints | Unknown API address | integration | no | Django test client; `/api/does-not-exist/`, `/api/` |
| backend-app | Built-in admin panel is the only sign-in | Anonymous visitor is sent to the admin login | integration | yes | administrator `admin` / `Adm1n-pass-2026`; `/api-auth/login/`, `/accounts/login/`, `/accounts/signup/`, `/register/` |
| backend-app | Built-in admin panel is the only sign-in | Administrator signs in to the admin panel | integration | yes | administrator `admin` / `Adm1n-pass-2026`; `/api-auth/login/`, `/accounts/login/`, `/accounts/signup/`, `/register/` |
| backend-app | Built-in admin panel is the only sign-in | Wrong administrator password | integration | yes | administrator `admin` / `Adm1n-pass-2026`; `/api-auth/login/`, `/accounts/login/`, `/accounts/signup/`, `/register/` |
| backend-app | Built-in admin panel is the only sign-in | Administrator with an existing username | integration | no | existing administrator `admin`; non-interactive create-superuser with `admin` / `Second-pass-2026` |
| backend-app | Built-in admin panel is the only sign-in | No sign-in or registration outside the admin panel | integration | yes | administrator `admin` / `Adm1n-pass-2026`; `/api-auth/login/`, `/accounts/login/`, `/accounts/signup/`, `/register/` |
| backend-app | Admin static files in development | Admin panel styles are served in development | manual | no | stack and standalone backend with `DEBUG=1`; administrator `admin` |
| backend-app | Backend lint and format checks | Clean backend passes the checks | integration | no | delivered code; temporary fixture files with `import os` unused and `x  =  {'a':1}` |
| backend-app | Backend lint and format checks | Lint violation is reported | integration | no | delivered code; temporary fixture files with `import os` unused and `x  =  {'a':1}` |
| backend-app | Backend lint and format checks | Format violation is reported | integration | no | delivered code; temporary fixture files with `import os` unused and `x  =  {'a':1}` |
| web-app | Frontend project location and language | Install frontend dependencies from the lock file | manual | no | fresh clone, root `pnpm-lock.yaml` |
| web-app | Frontend project location and language | Type check passes | integration | no | delivered frontend code |
| web-app | Frontend project location and language | Type error is reported | integration | no | temporary fixture `broken.ts` with `const title: string = 42;` |
| web-app | Frontend serves on a configurable port | Frontend on the default port | manual | no | `FRONTEND_PORT` 3100 (shell), 3200 (`.env`); another program on 3000 |
| web-app | Frontend serves on a configurable port | Frontend on an overridden port | manual | no | `FRONTEND_PORT` 3100 (shell), 3200 (`.env`); another program on 3000 |
| web-app | Frontend serves on a configurable port | Frontend port from the root settings file | manual | no | `FRONTEND_PORT` 3100 (shell), 3200 (`.env`); another program on 3000 |
| web-app | Frontend serves on a configurable port | Frontend port already in use | manual | no | `FRONTEND_PORT` 3100 (shell), 3200 (`.env`); another program on 3000 |
| web-app | Minimal start page | Start page opens | unit | yes | start page rendered with React Testing Library; one non-empty `h1` |
| web-app | Minimal start page | Start page works without the backend | manual | no | frontend on 3000, nothing on 8000, browser network log |
| web-app | Frontend lint and format checks | Clean frontend passes the checks | integration | no | delivered code; temporary fixture files `ugly.ts`, `unused.ts` |
| web-app | Frontend lint and format checks | Format violation is reported | integration | no | delivered code; temporary fixture files `ugly.ts`, `unused.ts` |
| web-app | Frontend lint and format checks | Lint violation is reported | integration | no | delivered code; temporary fixture files `ugly.ts`, `unused.ts` |
| web-app | Frontend unit tests | Start page unit test passes | manual | no | delivered code; temporary failing test `always fails` |
| web-app | Frontend unit tests | Failing unit test is reported | manual | no | delivered code; temporary failing test `always fails` |
| dev-environment | Repository layout | Top-level layout | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Repository layout | No CI configuration | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Start the full stack with one command | Full stack starts | manual | yes | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Start the full stack with one command | Overridden ports in the stack | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Start the full stack with one command | Port already in use | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Backend waits for the database and migrates on start | Fresh database is migrated | manual | yes | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Backend waits for the database and migrates on start | Backend waits for a slow database | manual | yes | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Backend waits for the database and migrates on start | Database never becomes ready | manual | yes | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Backend waits for the database and migrates on start | Failed migration stops the backend | manual | yes | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Backend waits for the database and migrates on start | Restart keeps existing data | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Development mode with live code reload | Frontend change is picked up | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Development mode with live code reload | Backend change is picked up | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Development mode with live code reload | Backend recovers after a syntax error is fixed | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Root commands | Install everything | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Root commands | A failing install step fails the root install command | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Root commands | Repeated install and start | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Root commands | Run all checks | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Root commands | Type error fails the root lint command | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Root commands | Run all unit tests | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Root commands | A failing step fails the root command | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Root commands | Start and stop the stack | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Pre-commit checks | Clean commit passes | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Pre-commit checks | Commit with a backend lint violation is blocked | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Pre-commit checks | Commit with a frontend lint violation is blocked | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Pre-commit checks | Unformatted frontend file is reformatted and the commit blocked | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Pre-commit checks | Unformatted backend file is reformatted and the commit blocked | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | E2E check on a throwaway stack | Start page opens in the browser | manual | yes | E2E stack on ports 18000/13000/15432 with an empty volume; covered by the Playwright E2E test of the E2E stage |
| dev-environment | E2E check on a throwaway stack | E2E stack is removed afterwards | manual | no | `docker ps -a` / `docker volume ls` before and after |
| dev-environment | E2E check on a throwaway stack | E2E stack is removed after a failed check | manual | no | start page temporarily without `h1` |
| dev-environment | E2E check on a throwaway stack | E2E runs next to the development stack | manual | no | development stack running with administrator `admin` |
| dev-environment | Setup documentation | New developer follows the README | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |
| dev-environment | Setup documentation | Developer starts a project on its own from the README | manual | no | Linux machine with Docker; `.env` from `.env.example`; steps of the matching test cases |

## Exclusions

| Capability | Scenario | Reason |
|---|---|---|
| — | — | None. |

## Requirement trace

| Capability | Requirement | Sources |
|---|---|---|
| backend-app | Backend project location and dependencies | [desc][Q3][Q6] |
| backend-app | Backend configuration from environment variables | [Q14][Q18][Q36][Q37] |
| backend-app | Debug mode is off unless enabled | [Q29][Q37] |
| backend-app | Required settings outside debug mode | [Q30] |
| backend-app | Settings fallback in debug mode | [Q38] |
| backend-app | Allowed host names | [Q35] |
| backend-app | Backend serves on a configurable port | [Q14][Q17][Q36]; "Spec changes during test-case review": "Backend port already in use" |
| backend-app | Backend uses PostgreSQL outside automated tests | [Q7]; "Spec changes during test-case review": "Migrations with PostgreSQL unreachable" |
| backend-app | Backend automated tests use SQLite | [Q7][Q10][Q15] |
| backend-app | Health-check endpoint | [Q19][Q27] |
| backend-app | REST API baseline without business endpoints | [Q8][Q12] |
| backend-app | Built-in admin panel is the only sign-in | [Q12][Q20][Q26][Q32]; "Spec changes during test-case review": "Administrator with an existing username" |
| backend-app | Admin static files in development | [Q12][Q20]; "Spec changes during test-case review": QA remark on admin panel styles |
| backend-app | Backend lint and format checks | [Q10] |
| web-app | Frontend project location and language | [desc][Q3][Q4][Q5][Q34] |
| web-app | Frontend serves on a configurable port | [Q14][Q17][Q36][Q44]; "Spec changes during test-case review": "Frontend port already in use" |
| web-app | Minimal start page | [desc][Q2][Q14] |
| web-app | Frontend lint and format checks | [Q10] |
| web-app | Frontend unit tests | [Q10][Q16] |
| dev-environment | Repository layout | [Q3][Q5][Q10][Q11][Q18][Q23][Q25] |
| dev-environment | Start the full stack with one command | [Q9][Q17] |
| dev-environment | Backend waits for the database and migrates on start | [Q21][Q33][Q36][Q39] |
| dev-environment | Development mode with live code reload | [Q22]; "Spec changes during test-case review": "Backend recovers after a syntax error is fixed" |
| dev-environment | Root commands | [Q23][Q34][Q41]; "Spec changes during test-case review": "A failing install step fails the root install command", "Repeated install and start" |
| dev-environment | Pre-commit checks | [Q10][Q24][Q31][Q41] |
| dev-environment | E2E check on a throwaway stack | [Q13][Q14][Q15][Q28][Q40] |
| dev-environment | Setup documentation | [Q14][Q25][Q36] |

## Environment

- Automated backend tests: `make test` (pytest + pytest-django with `config/settings_test.py`, in-memory SQLite); settings tests start the backend in a subprocess with a controlled environment.
- Automated tooling tests: `make test-tooling` (pytest and Vitest tests that run ruff, ESLint, Prettier and `tsc` on the delivered code and on temporary fixture files).
- Frontend unit tests: `make test` (Vitest with jsdom and React Testing Library).
- E2E: `make e2e` — separate docker compose project on ports 18000, 13000 and 15432 with a throwaway PostgreSQL 17 volume; run through the kit's E2E stage.
- Manual checks: a Linux machine with Docker, uv, Node.js 24 and pnpm 10; `.env` copied from `.env.example`; administrator `admin` / `Adm1n-pass-2026` where a case needs one.

## Test case coverage

| Capability | Scenario | Case | Labels | Level |
|---|---|---|---|---|
| backend-app | Install backend dependencies from the lock file | Clean install from uv.lock | manual | — |
| backend-app | Install backend dependencies from the lock file | Lock file out of date with pyproject.toml | manual | — |
| backend-app | Backend started on its own with the example settings | Standalone backend with unchanged example settings | manual | — |
| backend-app | Backend started on its own with the example settings | Standalone backend while PostgreSQL is stopped | manual | — |
| backend-app | Real settings file is not tracked | .env at the root is ignored | automated | integration |
| backend-app | Real settings file is not tracked | Example settings file is tracked | automated | integration |
| backend-app | Debug variable unset | Standard 404 page with DEBUG unset | automated | integration |
| backend-app | Debug variable unset | Empty DEBUG value means off | automated | integration |
| backend-app | Debug enabled with a true value | DEBUG=TRUE turns debug on | automated | integration |
| backend-app | Debug enabled with a true value | DEBUG=true and DEBUG=True turn debug on | automated | integration |
| backend-app | Debug enabled with 1 | DEBUG=1 turns debug on | automated | integration |
| backend-app | Unrecognised debug value | DEBUG=yes means off | automated | integration |
| backend-app | Unrecognised debug value | DEBUG=0 and DEBUG=false mean off | automated | integration |
| backend-app | Missing secret key outside debug mode | Start refused without SECRET_KEY | automated | integration |
| backend-app | Missing secret key outside debug mode | Empty SECRET_KEY counts as missing | automated | integration |
| backend-app | Missing database address outside debug mode | Start refused without DATABASE_URL | automated | integration |
| backend-app | Missing database address outside debug mode | Empty DATABASE_URL counts as missing | automated | integration |
| backend-app | Missing database address outside debug mode | Both settings missing | automated | integration |
| backend-app | Missing secret key in debug mode | Development key used when SECRET_KEY is missing | automated | integration |
| backend-app | Missing secret key in debug mode | Empty SECRET_KEY in debug mode uses the development key | automated | integration |
| backend-app | Missing database address in debug mode | Start refused without DATABASE_URL in debug mode | automated | integration |
| backend-app | Missing database address in debug mode | Empty DATABASE_URL in debug mode | automated | integration |
| backend-app | Request to an allowed host | Host 127.0.0.1 is accepted | automated | integration |
| backend-app | Request to an allowed host | Host localhost is accepted | automated | integration |
| backend-app | Request to a host that is not allowed | Host example.com is rejected | automated | integration |
| backend-app | Request to a host that is not allowed | Host with a localhost-like prefix is rejected | automated | integration |
| backend-app | Extra allowed host | example.com allowed by the optional variable | automated | integration |
| backend-app | Extra allowed host | Defaults still allowed next to the extra host | automated | integration |
| backend-app | Backend on the default port | Port 8000 without BACKEND_PORT | manual | — |
| backend-app | Backend on an overridden port | Port 8100 from the shell | manual | — |
| backend-app | Backend port from the root settings file | Port 8200 from .env | manual | — |
| backend-app | Backend port already in use | Port 8000 taken by another program | manual | — |
| backend-app | Migrations applied to PostgreSQL | Built-in tables created in an empty database | manual | — |
| backend-app | Migrations with PostgreSQL unreachable | Migrate while PostgreSQL is stopped | manual | — |
| backend-app | Backend tests without PostgreSQL | Test run with no PostgreSQL server | manual | — |
| backend-app | Backend tests without PostgreSQL | Test run while .env points at a stopped PostgreSQL | manual | — |
| backend-app | Healthy backend | Health check with a reachable database | automated | integration |
| backend-app | Healthy backend | Health check with debug mode off | automated | integration |
| backend-app | Database unavailable | Health check with the database down | automated | integration |
| backend-app | Database unavailable | Health check recovers when the database returns | manual | — |
| backend-app | Method other than GET | POST to the health check | automated | integration |
| backend-app | Method other than GET | PUT and DELETE to the health check | automated | integration |
| backend-app | Unknown API address | Unknown address under /api/ | automated | integration |
| backend-app | Unknown API address | API root has no endpoint list | automated | integration |
| backend-app | Anonymous visitor is sent to the admin login | Redirect from /admin/ to the login page | automated | integration |
| backend-app | Administrator signs in to the admin panel | Sign-in with correct credentials | automated | integration |
| backend-app | Wrong administrator password | Correct username, wrong password | automated | integration |
| backend-app | Wrong administrator password | Unknown username | automated | integration |
| backend-app | Wrong administrator password | Empty login form | automated | integration |
| backend-app | Admin panel styles are served in development | Admin stylesheet on the login page in the stack | manual | — |
| backend-app | Admin panel styles are served in development | Admin index page assets after sign-in | manual | — |
| backend-app | Admin panel styles are served in development | Admin stylesheet with the backend started on its own | manual | — |
| backend-app | Administrator with an existing username | Second administrator named admin | automated | integration |
| backend-app | No sign-in or registration outside the admin panel | Common sign-in and registration addresses return 404 | automated | integration |
| backend-app | Clean backend passes the checks | ruff check and ruff format on delivered code | automated | integration |
| backend-app | Lint violation is reported | Unused import in a backend file | automated | integration |
| backend-app | Format violation is reported | Badly formatted backend file | automated | integration |
| web-app | Install frontend dependencies from the lock file | Clean install with a frozen lock file | manual | — |
| web-app | Install frontend dependencies from the lock file | Lock file out of date | manual | — |
| web-app | Type check passes | Type check on delivered code | automated | integration |
| web-app | Type error is reported | Number assigned to a string variable | automated | integration |
| web-app | Frontend on the default port | Port 3000 without FRONTEND_PORT | manual | — |
| web-app | Frontend on an overridden port | Port 3100 from the shell | manual | — |
| web-app | Frontend port from the root settings file | Port 3200 from .env | manual | — |
| web-app | Frontend port already in use | Port 3000 taken by another program | manual | — |
| web-app | Start page opens | Start page has exactly one heading | automated, e2e | unit |
| web-app | Start page works without the backend | Start page with the backend stopped | manual | — |
| web-app | Clean frontend passes the checks | ESLint and Prettier on delivered code | automated | integration |
| web-app | Format violation is reported | Badly formatted frontend file | automated | integration |
| web-app | Lint violation is reported | Unused variable in a frontend file | automated | integration |
| web-app | Start page unit test passes | Start page unit test on delivered code | manual | — |
| web-app | Failing unit test is reported | Deliberately failing unit test | manual | — |
| dev-environment | Top-level layout | Root contents after the change | manual | — |
| dev-environment | No CI configuration | No CI pipeline files | manual | — |
| dev-environment | Full stack starts | Stack with the example settings | manual | — |
| dev-environment | Overridden ports in the stack | Stack on ports 8100, 3100 and 5532 | manual | — |
| dev-environment | Port already in use | Port 3000 taken by another program | manual | — |
| dev-environment | Fresh database is migrated | First start on an empty volume | manual | — |
| dev-environment | Backend waits for a slow database | PostgreSQL ready 20 seconds after the backend starts | manual | — |
| dev-environment | Database never becomes ready | PostgreSQL never accepts connections | manual | — |
| dev-environment | Database never becomes ready | PostgreSQL ready just after the limit | manual | — |
| dev-environment | Database never becomes ready | PostgreSQL ready just before the limit | manual | — |
| dev-environment | Failed migration stops the backend | Migration raising an error | manual | — |
| dev-environment | Restart keeps existing data | Administrator survives a restart | manual | — |
| dev-environment | Frontend change is picked up | New heading text without rebuild | manual | — |
| dev-environment | Backend change is picked up | Extra field in the health response without rebuild | manual | — |
| dev-environment | Backend recovers after a syntax error is fixed | Syntax error saved and then fixed | manual | — |
| dev-environment | Install everything | Root install in a fresh clone | manual | — |
| dev-environment | A failing install step fails the root install command | Frontend lock file out of date | manual | — |
| dev-environment | Repeated install and start | Second make install | manual | — |
| dev-environment | Repeated install and start | Start while the stack is running | manual | — |
| dev-environment | Run all checks | Root lint on delivered code | manual | — |
| dev-environment | Run all checks | Backend lint violation fails the root lint command | manual | — |
| dev-environment | Type error fails the root lint command | Type error in a frontend file | manual | — |
| dev-environment | Run all unit tests | Root test on delivered code | manual | — |
| dev-environment | A failing step fails the root command | Failing backend test | manual | — |
| dev-environment | A failing step fails the root command | Failing frontend test | manual | — |
| dev-environment | Start and stop the stack | Start then stop | manual | — |
| dev-environment | Clean commit passes | Commit of a clean file | manual | — |
| dev-environment | Clean commit passes | Hooks do not run tests | manual | — |
| dev-environment | Commit with a backend lint violation is blocked | Unused import in a committed backend file | manual | — |
| dev-environment | Commit with a frontend lint violation is blocked | Unused variable in a committed frontend file | manual | — |
| dev-environment | Unformatted frontend file is reformatted and the commit blocked | Prettier rewrites a committed frontend file | manual | — |
| dev-environment | Unformatted backend file is reformatted and the commit blocked | ruff format rewrites a committed backend file | manual | — |
| dev-environment | Start page opens in the browser | E2E check of the start page | e2e | — |
| dev-environment | E2E stack is removed afterwards | Nothing left after a passing run | manual | — |
| dev-environment | E2E stack is removed after a failed check | Nothing left after a failing run | manual | — |
| dev-environment | E2E runs next to the development stack | E2E with the development stack running | manual | — |
| dev-environment | New developer follows the README | Fresh setup by the README | manual | — |
| dev-environment | Developer starts a project on its own from the README | Standalone start by the README | manual | — |
