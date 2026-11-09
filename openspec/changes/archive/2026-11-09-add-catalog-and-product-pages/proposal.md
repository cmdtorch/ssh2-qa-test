# Proposal

## Why

The site has no products yet: the frontend shows only a placeholder start page, and the backend serves only a health check. This change adds the perfume catalog and the product page from the mockups, so visitors can browse, filter, sort and open products, keep a basket and a wishlist in their browser, and staff can manage products in the admin panel [desc][Q1][Q2][U1][U2][U3].

## What Changes

- Products are stored in a new catalog in our database and managed through the built-in admin panel [Q2].
- Each product has a gender (men's, women's, unisex), several bottle sizes, each with its own regular price and sale price, and one size marked as the default in the admin panel [Q5][Q10][Q14][Q32][Q33].
- Each product has several photos, a manually entered rating, its own description, top, heart and base notes, and an ingredients list [Q15][Q16][Q17].
- The "Shipping & handling" and "Questions" texts are shared by all products [Q18].
- The backend gains public read-only API endpoints for the catalog list and the product detail; no sign-in is needed to read them. This changes the existing rule that the API serves only the health check [Q2][Q3].
- The catalog page opens at its own address, for example `/products`; the start page stays as it is [Q4].
- The catalog page shows product cards in pages of 16 with page numbers [Q12][U1] product-card-link.
- The catalog page sorts by "New", "Price low to high" and "Price high to low" [Q11][U1] sort-by-menu.
- The catalog page has a filter panel with only the Gender group, which can be collapsed [Q10][Q28][Q34][U2] gender-filter-field.
- The filter applies only on "See results (N)"; N is a live count of matching products, and "Clear" removes all marks [Q35][U2] filter-results-button.
- A card shows the default size's price with the struck-out regular price, and a discount badge whose percentage is computed automatically [Q13][Q32][Q33].
- The catalog shows "nothing found" text with a reset-filters button when no product matches [Q21].
- Catalog and product pages show grey skeleton placeholders while loading, and on a server error a "could not load" message with a "Retry" button [Q23].
- The product page has a photo gallery with thumbnails and arrows [Q15][U3] gallery-thumbnail-buttons.
- The product page shows the rating and a size choice that changes the shown price [Q14][Q16][U3] size-option-toggles.
- The product page has a quantity selector, "Add to basket" and a wishlist heart [Q8][Q9][U3] add-to-basket-button.
- The product page has collapsible blocks: Size, Product description, Notes, Ingredients, Shipping & handling and Questions [Q17][Q18][Q36][U3].
- The product page has breadcrumbs, and "You may also like" with 4 other products of the same gender [Q19][Q20][U3] related-product-links.
- An unknown product shows a "Page not found" (404) page with a link to the catalog [Q22].
- The basket is kept in the visitor's browser: products with size and quantity, a counter on the header basket icon, and a basket page where quantities are changed, items removed and the total shown; there is no checkout [Q8][Q30][Q26].
- The wishlist is kept in the visitor's browser: the product-page heart adds and removes a product, and the header heart opens a wishlist page with product cards [Q9][Q31].
- Site header and footer [U1][U3]:
  - Working: logo to the start page; category links "Perfumes" (all) and "Men's", "Women's", "Unisex" (catalog filtered by gender); search by product name, which opens the catalog filtered by name; basket and wishlist icons [Q4][Q5][Q7][Q29].
  - Shown but inactive: the profile icon and the information, collection, social and legal links [Q6][Q7].
- The pages are responsive. The phone and tablet layouts are our own design, since the mockups are desktop only [Q24].
- Texts are in English only and prices in US dollars only [Q25].
- Browser (E2E) tests run against the real backend on an empty test database, with test products created before the tests [Q27].

UI elements and their decisions are listed in `ui-inventory.md` [U1][U2][U3]:
- **Built:** every element named above, plus the header and footer logo links, the filter open and close buttons, the quantity buttons, and the section toggles [Q4][Q5][Q7][Q8][Q9][Q10][Q15][Q17][Q18][Q20][Q34][Q35][Q36].
- **Decoration:** `header-account-button`, `header-info-links`, `footer-info-links`, `footer-collection-links`, `footer-social-links`, `footer-legal-links` [Q6][Q7].
- **Out of scope:** the filter groups Categories, Price (slider and fields), Brands (with search), Scent Type (with search), Season, Occasion and Bottle Size [Q28].

Not part of this change [Q26]:
- Checkout and payment [Q26].
- Stock tracking [Q26].
- A customer account and customer sign-in [Q26].
- Search-engine settings [Q26].

## Capabilities

### New Capabilities

- `product-catalog`: products and their sizes, prices, discounts, photos, rating and texts, managed in the admin panel; shared shipping and questions texts; the public read-only API that lists products (gender and name filters, sorting, pages of 16, match count) and returns one product with related products [Q2][Q3][Q10][Q11][Q12][Q13][Q14][Q15][Q16][Q17][Q18][Q19][Q29][Q32][Q33]
- `catalog-page`: the catalog page — product cards with prices and discount badges, the Gender filter panel, sorting, page numbers, search results by name, the empty, loading and error states [Q10][Q11][Q12][Q13][Q21][Q23][Q28][Q29][Q34][Q35]
- `product-page`: the product page — gallery, rating, size choice and price, quantity, add to basket, wishlist heart, collapsible blocks, breadcrumbs, "You may also like", the not-found, loading and error states [Q8][Q9][Q14][Q15][Q16][Q17][Q18][Q19][Q20][Q22][Q23][Q36]
- `basket`: the browser-stored basket, the header basket counter and the basket page without checkout [Q8][Q30][Q26]
- `wishlist`: the browser-stored wishlist and the wishlist page [Q9][Q31]
- `site-navigation`: the shared header and footer — logo, category links, search entry, basket and wishlist icons, inactive information and profile elements, responsive layout [Q4][Q5][Q6][Q7][Q24][Q29]

### Modified Capabilities

- `backend-app`: the requirement "REST API baseline without business endpoints" changes so the API may serve the public product catalog endpoints besides the health check [Q2][Q3]

## Impact

- **Backend:** a new Django app for the catalog, with models, migrations, admin screens and the read-only DRF endpoints under `/api/` [Q2][Q3].
- **Backend:** uploaded product photos need image storage and serving, and a new image-handling dependency [Q15].
- **Frontend:**
  - New routes: catalog, product, basket and wishlist [Q4][Q30][Q31].
  - A shared header and footer [Q5][Q6].
  - Browser storage for the basket and the wishlist [Q8][Q9].
  - The start page is unchanged [Q4].
- **E2E:** new Playwright tests in `e2e/`, plus a way to create test products in the empty E2E database before the tests [Q27].
- **Out of the way:** the admin sign-in rule is unchanged, since there is no customer sign-in [Q26].

## Assumptions & Open Questions

- The shared "Shipping & handling" and "Questions" text is edited in the admin panel [assumption].
- The rating is a number from 0 to 5 in steps of 0.5 [assumption].
- The header basket counter shows the total number of units (the sum of quantities), not the number of different lines [assumption].
- The discount percentage on the badge is rounded to a whole number [assumption].
