# Design

## Context

The backend is Django 5.2 with Django REST Framework, a PostgreSQL database and one app, `core`, that serves `/api/health/` and the built-in admin panel. The frontend is Next.js with only a placeholder start page, and `e2e/` holds Playwright tests that run against docker compose with a real backend [Q2][Q27]. Motivation and scope: see proposal.md.

The specs fix the behaviour: a public read-only API under `/api/products/`, a catalog page at `/products`, a product page at `/products/<short-name>`, and a basket and a wishlist kept in the browser [Q2][Q3][Q4][Q8][Q9].

## Goals / Non-Goals

**Goals:**

- Deliver the catalog, the product page, the basket page and the wishlist page on the existing stack, with as few new dependencies as possible [Q75][Q76].
- Keep the list answer within 500 ms with 500 visible products, and keep all browser-visible data paths testable against the real backend [Q27][Q73].

**Non-Goals:**

- No cloud services, no image resizing, no server-side basket, no customer accounts and no checkout [Q26][Q74].
- No state library, no request library and no CSS framework [Q75][Q76].

## Decisions

### Backend: one new app, `catalog`

A new Django app `catalog` holds the models, the admin, the serializers and the views; `core` stays as it is. The models are `Product`, `ProductSize`, `ProductPhoto` and one single-row `SharedTexts` for "Shipping & handling" and "Questions"; the admin edits sizes and photos as inline rows of the product, and a validation step refuses what the specs refuse (no default size, two default sizes, sale price not below the regular price, repeated volumes, the reserved short name, whitespace-only names, a photo that is not JPG, PNG or WebP or is over 5 MB, a rating off the half-step) [Q2][Q14][Q15][Q16][Q18][Q32][Q33].

- Alternative: put everything in `core`. Rejected, because the catalog is a separate domain and `core` is the project baseline [Q2].

### Backend: list, detail and availability endpoints

`/api/products/` is a read-only DRF list view with page size 16, filters `gender`, `q` and `sort`, and an answer of the form `total`, `pages`, `page`, `results`. The price sort and the "new" sort are done by the database on the default size's current price (sale price if set, otherwise regular price) and on the date added, with the name as the tiebreaker, so that each request is one query for the page plus one for the count, with the first photo and the default size fetched in bulk [Q11][Q12][Q33].

`/api/products/<short-name>/` returns the product with all its sizes, photos in order, the rating, both shared texts and up to 4 related products of the same gender. `/api/products/availability/` is declared before the detail path and is why the short name `availability` is reserved [Q16][Q17][Q18][Q19].

The availability answer is `{"results": [...]}`, one object per requested item in the request order. An available result has `item`, `available: true`, `slug`, `name`, `photo`, `volume`, `regular_price`, `sale_price` and `discount_percent`; an unavailable one has only `item` and `available: false`. One check accepts at most 50 items; more than 50 gives status 400 and no results. The same item repeated gets a separate result in order [Q77].

Prices are stored as decimals with two places and sent as numbers, and the discount percentage is computed once in the serializer by the rule in the specs [Q13][Q32].

### Backend: photos on the server disk

Photos are uploaded to a media folder on the server's disk, mounted as a docker volume so that they survive a restart, and the backend itself serves them under `/media/` (the Django file-serving view, for local and test use); there is no cloud storage. The image field needs the Pillow library, which is the only new backend dependency [Q74].

- Alternative: S3-compatible storage. Rejected: it adds a service, keys and costs for no requirement [Q74].

### Frontend: same-origin API through Next.js

The frontend forwards `/api/*` and `/media/*` to the backend with a Next.js rewrite, whose target comes from an environment variable (the backend service address in docker compose), so the browser sees one address and the backend needs no CORS settings [Q73].

- Alternative: call the backend address directly with CORS. Rejected by the answer to Q73, which also keeps the E2E base address the only address the tests need [Q73][Q27].

### Frontend: routes, components and styles

The App Router routes are `/products` (catalog, with `gender`, `sort`, `page` and `q` in the address), `/products/[slug]`, `/basket` and `/wishlist`; the start page `/` is not changed. A shared layout renders the header and the footer, and pages are client components that load their data in the browser, so the skeleton, error and retry states of the specs have one implementation [Q4][Q23][Q29][Q30][Q31].

Styling uses CSS Modules per component with a few shared variables for colours and spacing; the desktop layout follows the mockups and the phone and tablet layouts are our own, switched at 1024 px [Q24][Q75][U1][U3].

### Frontend: data loading

A small `useApi` hook built on `fetch` returns `loading`, `error`, `data` and `retry`, and every page uses it for its loading skeleton and its "Could not load" state with "Retry". Each API function lives in one `api` module with typed answers; no request or caching library is added [Q23][Q76].

### Frontend: basket and wishlist state

A `StoreProvider` React context holds the basket (lines of short name, volume and quantity from 1 to 10) and the wishlist (short names); it reads and writes browser local storage and updates all components at once, so that the header counter changes without reloading. If the browser refuses local storage, the provider keeps the data in memory and raises a flag that shows "Your choices will not be saved after you close this page" [Q8][Q9][Q72].

On opening the catalog, product, basket and wishlist pages (and not the start page) the provider sends the stored items to the availability check, removes the unavailable ones and raises one "Some products are no longer available and were removed" message; a failed check removes nothing. A list longer than 50 items is split into checks of 50, and the results are joined in the original order. The basket page takes its current prices from the same check [Q30][Q31][Q77].

### Test data and E2E

A management command `seed_e2e` in the backend creates products with sizes and photos, and can hide a product, delete a size or change a price; the E2E tests run it inside the backend container (`docker compose exec`) before and during tests, so that a scenario can change data midway. The E2E stack stays the existing compose files with a media volume added; the admin panel is not used to prepare data [Q27][Q78].

## Screens

| Screen | Pages and components |
|---|---|
| catalog | CatalogPage, SiteHeader, SiteFooter, ProductCard, SortMenu, FilterPanel, GenderFilter, Pagination, SearchField, Skeleton, ErrorState [U1][U2] |
| product-detail | ProductPage, SiteHeader, SiteFooter, Breadcrumbs, Gallery, RatingStars, SizeToggles, QuantityStepper, AddToBasketButton, WishlistHeart, Section, RelatedProducts, NotFoundState [U3] |

## Risks / Trade-offs

- [The 500 ms list limit may not hold with 500 products] → one query for the page and one for the count, an index on the gender and on the date added, and a test with 500 products that measures after a warm-up [Q60].
- [Local storage edits by hand can store broken data] → the provider drops lines with unknown shape or a quantity outside 1–10 when it reads them [Q8].
- [Photos on the server disk are lost if the volume is lost] → the volume is named and kept between restarts; backups are outside this change [Q74][Q26].
- [Pages that load data in the browser show skeletons first and give search engines nothing] → accepted: search-engine settings are out of scope [Q26].

## Migration Plan

- Add the `catalog` app with its first migration; it creates new tables only and changes no existing ones [Q2].
- Add the media volume to docker compose and the E2E compose; roll back by removing the app, the routes and the volume, after which the backend serves only the health check again [Q74].

## Assumptions & Open Questions

- The exact field names of the availability answer are chosen by the design from the field list in the specs [assumption].
- The basket and the wishlist are a React context written to browser local storage, with no shared state library [assumption].
- The only new backend dependency is an image library for photo upload and format checks [assumption].
- Photos are shown as uploaded, without automatic resizing [assumption].
