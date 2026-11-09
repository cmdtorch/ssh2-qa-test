# Spec Delta

## Purpose

The header and footer shared by the shop pages: the logo, category links, product search entry, basket and wishlist icons, and the elements shown without behaviour for now.

## ADDED Requirements

### Requirement: Shared header and footer
The catalog, product, basket, wishlist and "Page not found" pages SHALL show the same header and footer. The start page SHALL stay unchanged.

#### Scenario: Header and footer on the shop pages
- **WHEN** a visitor opens the catalog, a product page, the basket page, the wishlist page and `/no-such-page` in turn
- **THEN** each page shows the header with the "Lunisse" logo and the footer

#### Scenario: Start page unchanged
- **WHEN** a visitor opens the start page `/`
- **THEN** it shows no shop header and no shop footer

### Requirement: Logo opens the start page
The "Lunisse" logo in the header and in the footer SHALL open the start page.

#### Scenario: Header logo
- **WHEN** a visitor on the catalog clicks the logo in the header
- **THEN** the start page `/` opens

#### Scenario: Footer logo
- **WHEN** a visitor on a product page clicks the logo in the footer
- **THEN** the start page `/` opens

### Requirement: Category links
The links under the header SHALL open page 1 of the catalog with no search text and sorted by "New": "Perfumes" with no gender, "Men's perfumes", "Women's perfumes" and "Unisex perfumes" with that gender applied.

#### Scenario: Perfumes opens the whole catalog
- **WHEN** a visitor on the women's catalog clicks "Perfumes"
- **THEN** the catalog shows products of every gender

#### Scenario: Category link clears the search and the sort
- **WHEN** a visitor on the catalog searched `chanel`, sorted "Price low to high", is on page 2 and clicks "Women's perfumes"
- **THEN** the address is `/products?gender=women`
- **AND** the catalog shows page 1 of all women's products sorted by "New"

#### Scenario: Women's perfumes opens the filtered catalog
- **WHEN** a visitor on a product page clicks "Women's perfumes"
- **THEN** the catalog opens with only women's products
- **AND** the filter panel shows "Women's perfumes" marked when opened

### Requirement: Product search entry
Clicking the search icon in the header SHALL show a search field. Submitting a text with Enter SHALL open page 1 of the catalog with that search text, as the catalog page defines, keeping the gender and the sort that were applied on the catalog.

#### Scenario: Search from the header
- **WHEN** a visitor on a product page clicks the search icon, types `chanel` and presses Enter
- **THEN** the catalog opens showing only products whose name contains "chanel"
- **AND** the address contains the search text `chanel`

#### Scenario: Search keeps the gender and the sort
- **WHEN** a visitor is on page 2 of the women's catalog sorted "Price low to high", searches `chanel` from the header and presses Enter
- **THEN** page 1 shows only women's products whose name contains "chanel", sorted by price low to high
- **AND** the address contains the women's gender, the sort and the search text `chanel`

#### Scenario: Empty search from the header
- **WHEN** a visitor clicks the search icon and presses Enter with an empty field
- **THEN** the catalog opens showing all products

### Requirement: Basket and wishlist icons
The basket icon in the header SHALL open the basket page and show the basket counter. The heart icon in the header SHALL open the wishlist page.

#### Scenario: Basket icon opens the basket
- **WHEN** a visitor clicks the basket icon in the header
- **THEN** the page `/basket` opens

#### Scenario: Heart icon opens the wishlist
- **WHEN** a visitor clicks the heart icon in the header
- **THEN** the page `/wishlist` opens

### Requirement: Elements without behaviour
The profile icon, the header links "About us", "Brands", "Blog", "Video", "Support", the footer's copies of those links, its collection links, its social icons and the "Terms and Conditions" and "Privacy Policy" links SHALL be shown as on the mockups and SHALL NOT open any page.

#### Scenario: Profile icon does nothing
- **WHEN** a visitor on the catalog clicks the profile icon
- **THEN** the address and the page content stay the same

#### Scenario: Information link does nothing
- **WHEN** a visitor on the catalog clicks "Blog" in the header
- **THEN** the address and the page content stay the same

### Requirement: Header and footer on narrow screens
On a screen narrower than 1024 px, the header and the footer SHALL fit the screen width without horizontal scrolling and SHALL keep the logo, the search, wishlist and basket icons and the category links reachable.

#### Scenario: Header on a phone
- **WHEN** a visitor opens the catalog on a 375 px wide screen
- **THEN** the page has no horizontal scrolling
- **AND** the basket icon and the category links can be reached and used

### Requirement: Header accessibility
The header icons SHALL have text labels for screen readers — "Search", "Wishlist", "Account" and "Basket" — and every working header control SHALL be operable with the keyboard alone.

#### Scenario: Header icon labels
- **WHEN** a screen reader reads the header icons
- **THEN** it reads "Search", "Wishlist", "Account" and "Basket"

#### Scenario: Search by keyboard only
- **WHEN** a visitor uses only the Tab and Enter keys to open the search, types `dior` and presses Enter
- **THEN** the catalog opens with the search text `dior`
