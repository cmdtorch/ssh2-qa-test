# Test review — setup-monorepo

Verdict: READY

Scope: every scenario planned `unit` or `integration` in verification-plan.md has at least one marked test that asserts its THEN / AND clauses on an observable outcome. Scenarios planned `manual` need no automated test. The start-page E2E case (`dev-environment :: E2E check of the start page`) belongs to the E2E stage, so it is expected to be missing here. No test is skipped or marked as an expected failure.

| ID | Severity | Test | Scenario | Finding | Break it would miss | Suggested fix |
|---|---|---|---|---|---|---|
| T1 | minor | backend/tests/test_health.py:24 | Healthy backend | The debug on/off variant checks the status and body but not the JSON content type that the scenario's AND requires. The test at :14 does check it, so this is only a gap in this one variant. | If the content type changed only when DEBUG is off (for example the browsable renderer chosen differently), this variant still passes. | Add `assert response["Content-Type"].startswith("application/json")`. |
| T2 | minor | backend/tests/test_settings.py:290 | Request to a host that is not allowed | Only the 400 status is checked. That matches the THEN, but any other 400 (a bad request for some other reason) also passes. | If the request failed with 400 for a reason other than DisallowedHost, the test still passes. | Also check that the body is Django's standard `Bad Request (400)` page. |
| T3 | minor | backend/tests/test_settings.py:337 | Real settings file is not tracked | `git ls-files --cached --others --exclude-standard` also lists untracked files, so `.env.example` passes as "tracked" even if it was never committed. | If `.env.example` was never added to git, the test still passes. | Use `git ls-files --cached` alone for the `.env.example` check. |
| T4 | minor | frontend/app/page.test.tsx:8 | Start page opens | The THEN "response status is 200" can't be shown by a unit render. Only the `h1` clause is proved here. The status is left to the E2E stage, as the plan says ("automated, e2e"). | If the route returned a server error, this unit test still passes. | No action now. Make sure the E2E start-page test checks status 200. |
| T5 | minor | backend/tests/test_settings.py:305 | — | `test_settings_file_is_loaded_and_environment_wins` has no `@scenario` marker, so it isn't linked to any requirement. | — | Add the marker for the scenario it backs, or a `@case` link, so it counts toward coverage. |

Notes on the parts that hold up well:
- Settings tests run Django in a fresh subprocess with an explicitly built environment (`ENV_FILE` points to a missing file). Each WHEN therefore gets exactly the state it needs, and a leaked local `.env` can't mask a break.
- The debug/standard 404 checks look at body content (the `URLconf` text and the listed patterns), not just the status.
- The refusal tests check the non-zero exit, `ImproperlyConfigured` and the specific variable name.
- The DB-down health test only fakes the DB cursor. It doesn't mock the view itself, and it checks status, content type and the exact body.
- The admin tests check the exact redirect target, the index `h1`, the exact invalid-credentials message and the user count read back after the duplicate attempt.
- The tooling tests check exit codes plus the file name and rule/violation text in the output.

## Human decision

<!-- Filled by the human when the verdict stays NOT-READY: which findings are accepted, why, by whom. -->
