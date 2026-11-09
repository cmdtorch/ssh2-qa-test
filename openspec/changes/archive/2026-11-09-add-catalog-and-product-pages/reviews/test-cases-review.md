# Test-case review — add-catalog-and-product-pages

Verdict: READY

| ID | Severity | Case | Scenario | Finding | Suggested fix |
|---|---|---|---|---|---|
| F1 | minor | Empty gender with a valid sort | Empty gender and sort are ignored | Case "Empty gender with a valid sort" has no concrete data: its Given says "the same 6 visible products at different prices" and its Then says "from the cheapest to the most expensive", and the scenario only describes both parameters empty | name the prices (e.g. $50, $60, $45, $70, $55, $40) and the expected order, or fold the case into the scenario by adding the empty gender with `sort=price-asc` to the spec |
| F2 | minor | Staff with add right creates a product | Staff user with catalog rights edits a product | The case "Staff with add right creates a product" and the case "Staff without catalog rights cannot change the shared texts" check the requirement product-catalog/Catalog management permissions but sit under scenarios that describe only editing and the admin home page | add scenarios for creating a product and for the shared texts to the spec, or leave as is, since the requirement text covers both |
| F3 | minor | Clearing the rating is accepted | Valid rating is accepted | Given "a product with rating 4" does not name the product | name the product, e.g. "Chanel Gabrielle" with rating 4 |

Earlier findings F1-F15 are resolved (F1 to F7 majors; F8 to F15 minors).
