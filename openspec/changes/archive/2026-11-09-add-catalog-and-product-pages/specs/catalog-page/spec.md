# Spec Delta

## Purpose

The website page where visitors browse the perfume catalog: product cards, the Gender filter, sorting, page numbers, name search results and the empty, loading and error states.

## ADDED Requirements

### Requirement: Catalog page
The website SHALL serve the catalog page at `/products` to any visitor without sign-in, with the heading "PRODUCTS", the breadcrumbs "Home page / Products", and a card for each product of the current page.

#### Scenario: Catalog page opens
- **WHEN** a visitor who is not signed in opens `/products` while 20 visible products exist
- **THEN** the page shows the heading "PRODUCTS"
- **AND** it shows 16 product cards

#### Scenario: Breadcrumb from the catalog to the start page
- **WHEN** a visitor on the catalog clicks "Home page" in the breadcrumbs
- **THEN** the start page `/` opens

### Requirement: Product card
A product card SHALL show the product's first photo and name. When its default size has a sale price, the card SHALL show the struck-out regular price, the sale price and a badge with the discount percentage, for example "40%". Otherwise it SHALL show only the regular price and no badge. Clicking the card SHALL open the product page.

#### Scenario: Card of a discounted product
- **WHEN** the default size of "Burberry Goddess" has regular price $136 and sale price $81.60, and a visitor opens the catalog
- **THEN** its card shows "$136" struck out, "$81.60" and the badge "40%"

#### Scenario: Card of a product without a discount
- **WHEN** the default size of "Creed Aventus" has regular price $150 and no sale price, and a visitor opens the catalog
- **THEN** its card shows "$150" and no badge and no struck-out price

#### Scenario: Card opens the product page
- **WHEN** a visitor clicks the card of "Chanel Gabrielle"
- **THEN** the page `/products/chanel-gabrielle` opens

### Requirement: Price format
Prices on the website SHALL be shown in US dollars with a "$" sign: a whole amount without decimals, otherwise with exactly two decimals, and thousands separated by a comma.

#### Scenario: Whole price
- **WHEN** a price is 40 dollars
- **THEN** it is shown as "$40"

#### Scenario: Price with cents
- **WHEN** a price is 81.6 dollars
- **THEN** it is shown as "$81.60"

#### Scenario: Price in thousands
- **WHEN** a price is 1250 dollars
- **THEN** it is shown as "$1,250"

### Requirement: Catalog page numbers
The catalog SHALL show 16 products per page and page numbers below the cards when there is more than one page. The current page number SHALL be kept in the page address. Opening a page number greater than the last SHALL show the last page.

#### Scenario: Go to the second page
- **WHEN** 20 visible products exist and a visitor clicks page number 2
- **THEN** the page shows 4 product cards
- **AND** the address contains page 2

#### Scenario: Single page has no page numbers
- **WHEN** 10 visible products exist and a visitor opens the catalog
- **THEN** no page numbers are shown

#### Scenario: Page number beyond the last
- **WHEN** 40 visible products exist and a visitor opens the catalog address with page 99
- **THEN** the page shows the 8 products of page 3
- **AND** page number 3 is marked as current

### Requirement: Catalog sorting
The "Sort by" menu SHALL offer "New", "Price low to high" and "Price high to low". When the catalog opens without a chosen sort, it SHALL sort by "New". Choosing a sort SHALL reorder the catalog, keep the sort in the page address and show page 1.

#### Scenario: Catalog opens sorted by new
- **WHEN** products A, B and C were added in that order and a visitor opens the catalog
- **THEN** the cards are in the order C, B, A

#### Scenario: Sort by price low to high
- **WHEN** product A's card shows $50, B's shows $40 (sale) and C's shows $45, and a visitor chooses "Price low to high"
- **THEN** the cards are in the order B, C, A
- **AND** the address contains the chosen sort

#### Scenario: Sort by price high to low
- **WHEN** product A's card shows $50, B's shows $40 (sale) and C's shows $45, and a visitor chooses "Price high to low"
- **THEN** the cards are in the order A, C, B

#### Scenario: Changing the sort returns to page 1
- **WHEN** a visitor is on page 2 of the catalog and chooses "Price low to high"
- **THEN** page 1 is shown

### Requirement: Filter panel
The "Filter" button SHALL open a filter panel with one group, "Gender", offering "Men's perfumes", "Women's perfumes" and "Unisex perfumes". The group SHALL be expanded when the panel opens and SHALL collapse and expand with its "−" / "+" button. The cross button SHALL close the panel without changing the catalog.

#### Scenario: Open the filter panel
- **WHEN** a visitor clicks "Filter" on the catalog
- **THEN** a panel opens with the expanded group "Gender" and its three options
- **AND** the panel shows no other filter group

#### Scenario: Collapse and expand the Gender group
- **WHEN** a visitor clicks "−" next to "Gender"
- **THEN** the three options are hidden
- **AND** clicking "+" shows them again

#### Scenario: Close the panel with the cross
- **WHEN** a visitor marks "Women's perfumes" and then clicks the cross
- **THEN** the panel closes
- **AND** the catalog still shows the same products as before

### Requirement: Gender filter
Only one gender SHALL be marked at a time. While the panel is open, the button "See results (N)" SHALL show the number of products matching the marked gender and the current search text, updated on every mark. The catalog SHALL change only when "See results (N)" is clicked; then the panel closes, page 1 is shown and the gender is kept in the page address. "Clear" SHALL remove the mark.

#### Scenario: Marking a gender updates the count
- **WHEN** the catalog has 8 women's, 6 men's and 2 unisex products and a visitor marks "Women's perfumes" in the open panel
- **THEN** the button reads "See results (8)"
- **AND** the cards behind the panel have not changed

#### Scenario: Count within the search results
- **WHEN** the catalog shows the results of the search `chanel`, which match 2 women's and 1 men's product, and the visitor marks "Women's perfumes"
- **THEN** the button reads "See results (2)"

#### Scenario: Marking another gender replaces the mark
- **WHEN** "Women's perfumes" is marked and the visitor marks "Men's perfumes"
- **THEN** only "Men's perfumes" is marked
- **AND** the button reads "See results (6)"

#### Scenario: Apply the gender filter
- **WHEN** a visitor marks "Women's perfumes" and clicks "See results (8)"
- **THEN** the panel closes
- **AND** the catalog shows only the 8 women's products
- **AND** the address contains the women's gender

#### Scenario: Clear the mark
- **WHEN** "Women's perfumes" is marked in the open panel and the visitor clicks "Clear"
- **THEN** no gender is marked
- **AND** the button shows the number of all products matching the current search text, or of all products when there is none

#### Scenario: Clear an applied gender
- **WHEN** the catalog shows only women's products, the visitor opens the panel, clicks "Clear" and then "See results (N)"
- **THEN** the catalog shows products of every gender
- **AND** the address has no gender

#### Scenario: Unapplied mark is dropped when the panel closes
- **WHEN** no gender is applied, the visitor marks "Women's perfumes", closes the panel with the cross and opens it again
- **THEN** no gender is marked

### Requirement: Count unavailable
When the number of matching products cannot be fetched, because the backend answers with an error or cannot be reached, the button SHALL read "See results" without a number and stay usable, and the catalog SHALL stay unchanged until the visitor clicks it.

#### Scenario: Count request fails
- **WHEN** the filter panel is open, the count request fails and the visitor marks "Women's perfumes"
- **THEN** the button reads "See results" without a number and is active
- **AND** the cards behind the panel have not changed

### Requirement: Catalog view in the page address
The view SHALL be kept in the address parameters `gender` (`men`, `women`, `unisex`), `sort` (`new`, `price-asc`, `price-desc`), `page` and `q` (search text). Opening such an address SHALL show the same view, and the browser's Back button SHALL return to the previous view. An invalid value SHALL be ignored: an unknown gender shows all genders, an unknown sort uses "New", and a page number that is not a whole number of at least 1 shows page 1.

#### Scenario: Shared address opens the same view
- **WHEN** a visitor opens `/products?gender=men&sort=price-desc&page=2`
- **THEN** the catalog shows page 2 of the men's products sorted by price high to low
- **AND** the "Sort by" menu shows "Price high to low"

#### Scenario: Back button returns the previous view
- **WHEN** a visitor applies the women's filter and then clicks the browser's Back button
- **THEN** the catalog shows all products again

#### Scenario: Unknown gender in the address is ignored
- **WHEN** a visitor opens the catalog address with gender `kids`
- **THEN** the catalog shows products of every gender
- **AND** no error message is shown

#### Scenario: Unknown sort in the address is ignored
- **WHEN** a visitor opens the catalog address with sort `rating`
- **THEN** the cards are sorted as for "New"
- **AND** the "Sort by" menu shows "New"

#### Scenario: Invalid page number in the address
- **WHEN** a visitor opens the catalog address with page `0`, then with page `-1`, then with page `abc`
- **THEN** each time page 1 is shown

### Requirement: Name search results
When the catalog address carries a search text, the catalog SHALL show only products whose name contains it, ignoring case, and SHALL still allow the Gender filter, sorting and page numbers on those results. An empty search text SHALL show the whole catalog.

#### Scenario: Search results in the catalog
- **WHEN** a visitor opens the catalog with the search text `chanel` and products "Chanel Gabrielle", "Chanel No. 5" and "Dior Sauvage" exist
- **THEN** the cards are "Chanel Gabrielle" and "Chanel No. 5"

#### Scenario: Gender filter on search results
- **WHEN** a visitor searched for `chanel`, the results contain "Chanel Gabrielle" (women's) and "Bleu de Chanel" (men's), and the visitor applies the men's filter
- **THEN** the only card is "Bleu de Chanel"
- **AND** the address still contains the search text `chanel`

### Requirement: Catalog empty state
When no product matches the current view, or the catalog has no products, the catalog SHALL show the text "Nothing found" and a "Reset filters" button that opens the catalog without gender, search text and page number.

#### Scenario: No product matches
- **WHEN** a visitor searches for `zzz` and no product name contains it
- **THEN** the page shows "Nothing found" and the "Reset filters" button
- **AND** no product card is shown

#### Scenario: Reset filters
- **WHEN** the catalog shows "Nothing found" for the search `zzz` filtered by unisex and the visitor clicks "Reset filters"
- **THEN** the catalog shows all products
- **AND** the address has no search text and no gender

#### Scenario: Catalog with no products
- **WHEN** no visible products exist and a visitor opens the catalog
- **THEN** the page shows "Nothing found"

### Requirement: Catalog loading and error states
While products are loading, the catalog SHALL show grey placeholder cards. When the products cannot be loaded, because the backend answers with an error or cannot be reached, it SHALL show the message "Could not load products" and a "Retry" button that loads them again.

#### Scenario: Placeholders while loading
- **WHEN** a visitor opens the catalog and the product list has not arrived yet
- **THEN** grey placeholder cards are shown instead of product cards

#### Scenario: Error and retry
- **WHEN** the backend answers the product list with status 500
- **THEN** the page shows "Could not load products" and a "Retry" button
- **AND** after the backend recovers, clicking "Retry" shows the product cards

#### Scenario: Backend cannot be reached
- **WHEN** the backend is not running and a visitor opens the catalog
- **THEN** the page shows "Could not load products" and a "Retry" button

### Requirement: Catalog on narrow screens
On a screen narrower than 1024 px, the catalog SHALL show fewer cards per row without horizontal scrolling, and the filter panel SHALL take the full screen.

#### Scenario: Catalog on a phone
- **WHEN** a visitor opens the catalog on a 375 px wide screen
- **THEN** the page has no horizontal scrolling
- **AND** fewer than 4 cards are shown per row

#### Scenario: Filter panel on a phone
- **WHEN** a visitor opens the filter panel on a 375 px wide screen
- **THEN** the panel covers the full width of the screen

### Requirement: Catalog accessibility
Every control of the catalog SHALL be operable with the keyboard alone, and every product photo SHALL have the product name as its text description. Screen-reader labels SHALL be: the filter panel's cross "Close filters"; the Gender group's "−" "Collapse Gender" and "+" "Expand Gender".

#### Scenario: Filter by keyboard only
- **WHEN** a visitor uses only the Tab, Enter and Space keys to open the filter, mark "Women's perfumes" and press "See results"
- **THEN** the catalog shows only women's products

#### Scenario: Photo descriptions
- **WHEN** the catalog shows the card of "Dior Sauvage"
- **THEN** the card photo's text description is "Dior Sauvage"

#### Scenario: Filter panel button labels
- **WHEN** the filter panel is open with the Gender group expanded and a screen reader reads its buttons
- **THEN** it reads "Close filters" and "Collapse Gender"
- **AND** after the group is collapsed, its button reads "Expand Gender"
