# E2E Stage

Mode: real backend
Tests: e2e/
Start: developer at http://172.18.0.1:13000
Note: the AI starts the E2E docker compose stack (project setup-monorepo-e2e) on an empty test database; the Docker host publishes its ports at the gateway address, not at localhost.

## Accepted cases

None.

## Screens

| Screenshot | Result | Differences | Reason |
|---|---|---|---|
| 01-catalog-sort-open.png | accepted | Typeface (mockup uses a rounded geometric sans, app uses the system font); logo is plain text, not the mockup's custom lettering; "Sort by" button also shows the current value "New" (mockup shows only "Sort by" and a chevron) | accepted by the developer on 2026-11-09: the mockup typeface and custom logo lettering need a font and are not part of this change; "Sort by New", the struck-out price and the unbuilt filter groups follow the specs and Q28 |
| 02-catalog-filter-open.png | accepted | Typeface, logo lettering and "Sort by New" as in 01; the Categories, Price, Brands, Scent Type, Season, Occasion and Bottle Size groups are not built (out of scope [Q28], intended) | accepted by the developer on 2026-11-09: the mockup typeface and custom logo lettering need a font and are not part of this change; "Sort by New", the struck-out price and the unbuilt filter groups follow the specs and Q28 |
| 03-product-detail.png | accepted | Typeface and logo lettering as in 01; price at the top shows "$60" struck out next to "$40" (mockup shows only "$40"; the product-page spec requires the struck price) | accepted by the developer on 2026-11-09: the mockup typeface and custom logo lettering need a font and are not part of this change; "Sort by New", the struck-out price and the unbuilt filter groups follow the specs and Q28 |
