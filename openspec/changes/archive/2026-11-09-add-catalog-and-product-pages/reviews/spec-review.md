# Spec review — add-catalog-and-product-pages

Verdict: READY

Second re-review. Scope: only the additions made during the test-cases stage. The earlier minor findings S1–S5 of the previous review are not repeated here and are unchanged.

Checked against Q70, Q71, Q72 and the re-confirmed Specs round summary:
- product-catalog "Product with a name of only spaces is refused": consistent with "Required product fields" ("no name").
- product-catalog "Empty list parameters" / "Empty gender and sort are ignored": matches Q70 A (empty value = parameter not sent; all genders; sort "new"). It does not contradict "Product list parameters" or the 400 rule for unknown values (Q60).
- catalog-page "Count unavailable" / "Count request fails": matches Q71 A (button "See results" without number, active, catalog unchanged until clicked).
- basket "Basket without browser storage" and wishlist "Wishlist without browser storage": match Q72 A (works while the page is open, message text identical to the answer).

No blocker or major findings. New minor points:

| ID | Severity | Where | Finding | Evidence | Suggested action |
|---|---|---|---|---|---|
| S1 | minor | basket and wishlist › "... without browser storage" | Q72 names the trigger as "Add to basket" or the heart; the specs say "after each change", which also covers removing a line, changing a quantity or un-hearing. Where the message is shown (which page, near which element) and how long it stays is not stated. | basket/spec.md:16-22, wishlist/spec.md:17-23 | Either narrow the wording to adding, or keep "each change" and state the place and duration (for example under the control, until the next action). Optionally add a removal scenario. |
| S2 | minor | basket and wishlist › "... without browser storage" | "While the page stays open" is only exercised by in-app navigation. What happens on a reload (data lost, empty basket) is implied but not stated; this contradicts nothing, but QA may ask. | same | Add to the requirement: "a page reload empties it". |
| S3 | minor | product-catalog › "Product with a name of only spaces is refused" | No confirmed answer covers whitespace-only names; it is a reasonable reading of "no name". | spec.md:40-43 | Accept as is. |
| S4 | minor | catalog-page › "Count unavailable" | The scenario covers a failure after opening the panel and marking. It does not say what happens when the visitor then clicks "See results" and the list request also fails, nor how a failed count on opening shows (before any mark). | catalog-page/spec.md:143-149 | Optionally add that the same rule applies when the panel opens, and refer to the existing catalog list-load error state for the click. |
