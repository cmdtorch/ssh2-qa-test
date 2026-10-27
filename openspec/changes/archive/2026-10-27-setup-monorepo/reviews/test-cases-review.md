# Test-case review — setup-monorepo

Verdict: READY

| ID | Severity | Case | Scenario | Finding | Suggested fix |
|---|---|---|---|---|---|
| F1 | minor | Lock file out of date with pyproject.toml | Install backend dependencies from the lock file | Case Lock file out of date with pyproject.toml now expects `uv sync --frozen` to exit 0 and silently skip `requests`, a behaviour no scenario of backend-app/Backend project location and dependencies describes and the opposite of the frontend case Lock file out of date (non-zero exit) | confirm with the developer that a silently ignored out-of-date `uv.lock` is intended, or switch the case to a check that fails on an out-of-date lock (e.g. `uv sync --locked` exits non-zero) |
| F2 | minor | Port 8000 taken by another program | Backend port already in use | Case Port 8000 taken by another program has a Then "does not start serving" that a tester cannot see directly, and does not quote the error text | state that the backend process exits with a non-zero status, that `http://localhost:8000/` still answers from the other program, and that the output contains `Error: That port is already in use.` |
| F3 | minor | Syntax error saved and then fixed | Backend recovers after a syntax error is fixed | Case Syntax error saved and then fixed does not name the backend Python file that gets the broken line | name the file, e.g. the module of the health-check view |
| F4 | minor | Second administrator named admin | Administrator with an existing username | Case Second administrator named admin says "a password" instead of a concrete value | give the password, e.g. `DJANGO_SUPERUSER_PASSWORD=Adm1n-pass-2026` |
