# Spec review — setup-monorepo

Verdict: READY

This is the eighth run, a re-review of two edits only. Inputs: clarifications.md (Q17, Q36, Q39, Q44 and the confirmed Design round summary), proposal.md, specs/web-app/spec.md, specs/dev-environment/spec.md, and the backend-app lines cited by the carried-over findings. There is no `sources/` directory and `openspec/specs/` is empty, so no main specs exist to contradict. Q1 = B, so UI mode doesn't apply.

## Checked edits

| Edit | Coverage | Grounding | Testability | Format |
|---|---|---|---|---|
| web-app › requirement "Frontend serves on a configurable port" now says: "If the configured port is already in use, the development server SHALL exit with a non-zero status and SHALL NOT serve on any other port." (web-app/spec.md:27) | Q44 A now applies to any configured port, the default 3000 or the one in `FRONTEND_PORT`. That closes the gap S2 raised. | Matches Q44 A ("exits with an error that the port is busy... works only on 3000 or on `FRONTEND_PORT`"). Option B (fallback) isn't used. It agrees with the scenario at web-app/spec.md:41-45 and the backend counterpart. | The requirement text can be observed: a non-zero exit and no listener on another port. The scenario still exercises only the default port. A busy `FRONTEND_PORT` case (e.g. 3100) would be a nice extra scenario, but it isn't needed because the requirement is explicit. | No change to scenario names. |
| dev-environment › "Database never becomes ready" now requires that "the backend log contains `Database is unreachable after 60 seconds`" (dev-environment/spec.md:55) | Q39 A ("exits with an error and writes that the database is unreachable") is covered by an exact string. | The exact text comes from the confirmed Design round summary ("при неудаче — сообщение `Database is unreachable after 60 seconds` и ненулевой код"), which the user answered "Looks correct". No conflict with Q33 or with the requirement at dev-environment/spec.md:40. | QA can check this as a substring in the container log. | Name unchanged and unique. |

## Status of the previous findings (seventh run)

| Prev. ID | Status | Now |
|---|---|---|
| S1 combined scenario for admin styles | open, unchanged | S1 |
| S2 no-fallback rule only in the scenario | resolved (web-app/spec.md:27, per Q44 A) | — |
| S3 standalone migrations with PostgreSQL unreachable | open, unchanged | S3 |
| S4 vague "shows the failing step" | open, unchanged | S4 |
| S5 compose override of `DATABASE_URL` host/port; health not checked on overridden ports | open in the spec. design.md D8 settles it (the Design round summary agrees: compose passes the full `DATABASE_URL` with service host and port 5432), but the spec still says only "whatever host" | S5 |
| S6 no fixed keyword for "database unreachable" | resolved (dev-environment/spec.md:55, per the Design round summary / Q39) | — |

## Findings

| ID | Severity | Where | Finding | Evidence | Suggested action |
|---|---|---|---|---|---|
| S1 | minor | backend-app › "Admin static files in development" › "Admin panel styles are served in development" | Carried over. The WHEN puts two run modes (in the stack, on its own) and two pages into one scenario, and "in the stack or on its own" reads as if either one were enough. | backend-app/spec.md:184, 186-190 | Accept as is, or split into "...in the stack" and "...when started on its own", each covering both pages. |
| S3 | minor | backend-app › "Migrations with PostgreSQL unreachable" | Carried over. The command isn't named. The spec doesn't say whether the standalone migration command waits the way start-up in the stack does (Q39). The error text isn't fixed. | backend-app/spec.md:120-123; clarifications.md Q33, Q39 | State that the standalone migration command doesn't wait. Then either fix an error substring or say that QA checks only the non-zero exit. |
| S4 | minor | dev-environment › "A failing install step fails the root install command" | Carried over. "its output shows the failing step" is vague. | dev-environment/spec.md:93-96 | Change it to "its output contains the error reported by the failing tool", and say whether later steps still run. |
| S5 | minor | dev-environment › "Backend waits for the database and migrates on start" / "Overridden ports in the stack" | Carried over. The requirement says the backend reaches PostgreSQL "whatever host `DATABASE_URL` names". It doesn't say that the port is overridden too (internal 5432), though the confirmed Design round summary and design.md D8 settle it. The override scenario also doesn't check that the database is healthy when `POSTGRES_PORT` is 5532. | dev-environment/spec.md:30-32, 40; clarifications.md Q36, Design round summary | Change it to "whatever host and port `DATABASE_URL` names in `.env`". Add to "Overridden ports in the stack": "`GET /api/health/` on 8100 returns 200 with `\"database\": \"ok\"`". |
