# Test review — add-catalog-and-product-pages

Verdict: READY

Run state: backend 180 passed (3 `tooling` tests deselected by config), frontend 209 passed. No skipped or xfail tests.
Scenarios without a marker (Back button, Catalog on a phone, Filter panel on a phone, Filter by keyboard only) are e2e-only in the verification plan and are not reported as missing.
Tests that check only structure in jsdom (keyboard, phone layout) are as the plan intends and are not flagged.
Tests written with the implementation (product-page lower part, group 7) would fail if the feature broke; no weak assertion found there.

| ID | Severity | Test | Scenario | Finding | Break it would miss | Suggested fix |
|---|---|---|---|---|---|---|
| T1 | minor | frontend/components/WishlistPage.test.tsx:100 | Removed product leaves the wishlist page | The test seeds a wishlist with only Chanel and never removes anything. It checks that Dior is absent, but Dior was never added. | If the page kept showing a product after it was removed, the test still passes. | Seed both products, remove one through the store or the heart, and assert its card is gone. The e2e case is planned. |
| T2 | minor | frontend/lib/store.test.tsx:161, 177, 226 | Blocked storage keeps the basket / wishlist in memory | The tests assert store state and the message. The "after opening /basket (/wishlist) through the header icon the line (card) is shown" clause is not asserted. | If the in-memory state were lost on moving to another page, these tests still pass. | Render the basket or wishlist page after the blocked add. The e2e case is planned. |
| T3 | minor | frontend/lib/store.test.tsx:111, 189, 202 | Wishlist survives a reload | "The heart on its product page is shown filled" is only checked as `isInWishlist`. The filled heart after a reload is covered indirectly at ProductPage.test.tsx:433. | A heart that ignores the stored wishlist on first render. | Optional: render the product page after the reload. |
| T4 | minor | backend/tests/catalog/test_api_detail.py:22 | Detail of a visible product | Only `photos[1:]` is compared to exact URLs. The first photo is only checked to start with `/media/products/`. | A wrong photo order that moves the first photo. | Assert the full list in position order. |
| T5 | minor | frontend/components/ProductPage.test.tsx:331, 358, 102 | Confirmation after adding / Capped add / Descriptor line shown | The messages and the descriptor are found anywhere in `main`. "Under the button" and "under the name" are not asserted. The 3-second timer is only checked at 3000 ms, not as still shown before that. | A message rendered in the wrong place. A confirmation that disappears at once. | Optionally assert that the message sits next to the button or name, and that it is still shown at 2999 ms. |
| T6 | minor | frontend/components/ProductPageBlocks.test.tsx:162, 176, 200 | Unknown product address / Other unknown address / Hidden product address | "The response status is 404" is not asserted. The tests check only the "Page not found" content. A client-side fetch cannot show an HTTP 404 in jsdom. | The site answers 200 for an unknown product address. | Cover the HTTP status in e2e (both are labelled "automated, e2e"). |
| T7 | minor | frontend/components/WishlistPage.test.tsx:77 | Wishlist page shows the products | Both cards are asserted as "$40" because the fake backend gives every product the same default price. A price taken from the wrong product would pass. | A card that shows another product's price. | Give the two products distinct availability prices and assert each. |
| T8 | minor | frontend/lib/api.test.ts:102 | A long basket is checked in several requests | The case has 120 items split 50/50/20, not 60 split 50/10. The basket page with 60 lines is not tested. The e2e case "60 basket lines" is planned. | A chunking error specific to 60 items is not likely to slip through. | None needed apart from the e2e test. |
| T9 | minor | frontend/components/CatalogFilter.test.tsx:126 | Marking a gender updates the count | "Cards behind the panel have not changed" is read right after the count appears. A wrong refetch of the list could land later. | A list refetch triggered by marking, if it answers late. | Wait for the requests to settle, then compare the cards. |

## Human decision

<!-- Filled by the human when the verdict stays NOT-READY: which findings are accepted, why, by whom. -->
