# UI Inventory

## Screenshots

| Tag | File | Fingerprint |
|---|---|---|
| U1 | 01-catalog-sort-open.png | a285fbdbda9b384ed30a0b73adf19487b31d594d3b3995dff353de7b8e938fac |
| U2 | 02-catalog-filter-open.png | 9785d851255f5b184fef19c92024d51fc411e45f9005dbbefa26e8e190e8f086 |
| U3 | 03-product-detail.png | a4ce7a513fde7c1baf46bdf642d1f67f6ec994ca6389a10cb67df765987ad5f1 |

## Screen: catalog

Screenshots: U1 (sort-open), U2 (filter-open)

| Element | Type | Variants | Decision | Source | Scenarios |
|---|---|---|---|---|---|
| header-logo-link | link | sort-open, filter-open | in scope | [Q4] | site-navigation :: Header logo |
| header-info-links | link | sort-open, filter-open | decoration | [Q6] | — |
| header-search-button | button | sort-open, filter-open | in scope | [Q7] | site-navigation :: Search from the header |
| header-wishlist-button | button | sort-open, filter-open | in scope | [Q9] | site-navigation :: Heart icon opens the wishlist |
| header-account-button | button | sort-open, filter-open | decoration | [Q7] | — |
| header-cart-button | button | sort-open, filter-open | in scope | [Q8] | site-navigation :: Basket icon opens the basket; basket :: Counter shows the sum of quantities |
| header-category-links | link | sort-open, filter-open | in scope | [Q5] | site-navigation :: Perfumes opens the whole catalog; site-navigation :: Women's perfumes opens the filtered catalog |
| breadcrumb-home-link | link | sort-open, filter-open | in scope | [Q20] | catalog-page :: Breadcrumb from the catalog to the start page |
| filter-open-button | button | sort-open | in scope | [Q10] | catalog-page :: Open the filter panel |
| sort-by-menu | menu | sort-open, filter-open | in scope | [Q11] | catalog-page :: Catalog opens sorted by new; catalog-page :: Sort by price low to high; catalog-page :: Sort by price high to low |
| product-card-link | link | sort-open, filter-open | in scope | [desc] | catalog-page :: Card opens the product page |
| filter-close-button | button | filter-open | in scope | [Q10] | catalog-page :: Close the panel with the cross |
| gender-filter-field | field | filter-open | in scope | [Q10] | catalog-page :: Marking a gender updates the count; catalog-page :: Marking another gender replaces the mark; catalog-page :: Apply the gender filter |
| category-filter-field | field | filter-open | out of scope | [Q28] | — |
| price-range-slider | field | filter-open | out of scope | [Q28] | — |
| price-min-field | field | filter-open | out of scope | [Q28] | — |
| price-max-field | field | filter-open | out of scope | [Q28] | — |
| brand-search-field | field | filter-open | out of scope | [Q28] | — |
| brand-filter-field | field | filter-open | out of scope | [Q28] | — |
| scent-search-field | field | filter-open | out of scope | [Q28] | — |
| scent-filter-field | field | filter-open | out of scope | [Q28] | — |
| season-filter-section | toggle | filter-open | out of scope | [Q28] | — |
| occasion-filter-section | toggle | filter-open | out of scope | [Q28] | — |
| bottle-size-filter-section | toggle | filter-open | out of scope | [Q28] | — |
| filter-section-toggles | toggle | filter-open | in scope | [Q34] | catalog-page :: Collapse and expand the Gender group |
| filter-clear-button | button | filter-open | in scope | [Q35] | catalog-page :: Clear the mark |
| filter-results-button | button | filter-open | in scope | [Q35] | catalog-page :: Apply the gender filter |
| catalog-empty-state | state | sort-open, filter-open | in scope | [Q21] | catalog-page :: No product matches; catalog-page :: Catalog with no products |
| catalog-loading-state | state | sort-open, filter-open | in scope | [Q23] | catalog-page :: Placeholders while loading |
| catalog-error-state | state | sort-open, filter-open | in scope | [Q23] | catalog-page :: Error and retry |
| footer-logo-link | link | sort-open, filter-open | in scope | [Q4] | site-navigation :: Footer logo |
| footer-info-links | link | sort-open, filter-open | decoration | [Q6] | — |
| footer-collection-links | link | sort-open, filter-open | decoration | [Q6] | — |
| footer-social-links | link | sort-open, filter-open | decoration | [Q6] | — |
| footer-legal-links | link | sort-open, filter-open | decoration | [Q6] | — |

## Screen: product-detail

Screenshots: U3

| Element | Type | Variants | Decision | Source | Scenarios |
|---|---|---|---|---|---|
| header-logo-link | link | — | in scope | [Q4] | site-navigation :: Header logo |
| header-info-links | link | — | decoration | [Q6] | — |
| header-search-button | button | — | in scope | [Q7] | site-navigation :: Search from the header |
| header-wishlist-button | button | — | in scope | [Q9] | site-navigation :: Heart icon opens the wishlist |
| header-account-button | button | — | decoration | [Q7] | — |
| header-cart-button | button | — | in scope | [Q8] | site-navigation :: Basket icon opens the basket; basket :: Counter shows the sum of quantities |
| header-category-links | link | — | in scope | [Q5] | site-navigation :: Perfumes opens the whole catalog; site-navigation :: Women's perfumes opens the filtered catalog |
| breadcrumb-home-link | link | — | in scope | [Q20] | product-page :: Breadcrumb to the start page |
| breadcrumb-catalog-link | link | — | in scope | [Q20] | product-page :: Breadcrumb to the catalog |
| gallery-thumbnail-buttons | button | — | in scope | [Q15] | product-page :: Thumbnail shows its photo |
| gallery-prev-button | button | — | in scope | [Q15] | product-page :: Arrows move between photos; product-page :: Arrows at the ends |
| gallery-next-button | button | — | in scope | [Q15] | product-page :: Arrows move between photos; product-page :: Arrows at the ends |
| quantity-decrease-button | button | — | in scope | [Q8] | product-page :: Quantity starts at 1; product-page :: Raise and lower the quantity |
| quantity-increase-button | button | — | in scope | [Q8] | product-page :: Raise and lower the quantity; product-page :: Quantity stops at 10 |
| wishlist-toggle-button | button | — | in scope | [Q9] | product-page :: Add to the wishlist; product-page :: Remove from the wishlist |
| add-to-basket-button | button | — | in scope | [Q8] | product-page :: Add the chosen size and quantity |
| size-option-toggles | toggle | — | in scope | [Q14] | product-page :: Default size chosen on open; product-page :: Choosing another size changes the price |
| size-section-toggle | toggle | — | in scope | [Q36] | product-page :: Collapse the Size block |
| description-section-toggle | toggle | — | in scope | [Q17] | product-page :: Collapse the description and the notes |
| notes-section-toggle | toggle | — | in scope | [Q17] | product-page :: Collapse the description and the notes |
| ingredients-section-toggle | toggle | — | in scope | [Q17] | product-page :: Collapse a block |
| shipping-section-toggle | toggle | — | in scope | [Q18] | product-page :: Expand the shared shipping text |
| questions-section-toggle | toggle | — | in scope | [Q18] | product-page :: Expand the shared questions text |
| related-product-links | link | — | in scope | [Q19] | product-page :: Related card opens its product |
| product-not-found-state | state | — | in scope | [Q22] | product-page :: Unknown product address; product-page :: Hidden product address |
| product-loading-state | state | — | in scope | [Q23] | product-page :: Placeholders while loading |
| product-error-state | state | — | in scope | [Q23] | product-page :: Error and retry |
| footer-logo-link | link | — | in scope | [Q4] | site-navigation :: Footer logo |
| footer-info-links | link | — | decoration | [Q6] | — |
| footer-collection-links | link | — | decoration | [Q6] | — |
| footer-social-links | link | — | decoration | [Q6] | — |
| footer-legal-links | link | — | decoration | [Q6] | — |
