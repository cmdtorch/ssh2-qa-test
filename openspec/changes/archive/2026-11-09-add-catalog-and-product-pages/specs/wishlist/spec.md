# Spec Delta

## Purpose

Lets a visitor keep a list of favourite products in their browser and review it on the wishlist page.

## ADDED Requirements

### Requirement: Wishlist kept in the browser
The wishlist SHALL be kept in the visitor's browser, without sign-in, and SHALL survive page reloads and closing the browser tab. It SHALL hold products, not sizes, and each product at most once.

#### Scenario: Wishlist survives a reload
- **WHEN** a visitor adds Chanel Gabrielle to the wishlist and reloads the page
- **THEN** Chanel Gabrielle is still in the wishlist
- **AND** the heart on its product page is shown filled

### Requirement: Wishlist without browser storage
When the browser does not allow saving data, the wishlist SHALL still work while the page stays open, and after each change the message "Your choices will not be saved after you close this page" SHALL be shown.

#### Scenario: Blocked storage keeps the wishlist in memory
- **WHEN** the browser blocks saving data and a visitor clicks the heart on the page of "Chanel Gabrielle"
- **THEN** the heart is shown filled and the message "Your choices will not be saved after you close this page" is shown
- **AND** after opening `/wishlist` through the header heart icon, the card of "Chanel Gabrielle" is shown

### Requirement: Wishlist page
The heart icon in the header SHALL open the wishlist page `/wishlist`, which SHALL show a card for each wishlist product, looking and acting like a catalog card.

#### Scenario: Wishlist page shows the products
- **WHEN** the wishlist holds Chanel Gabrielle and Dior Sauvage and the visitor clicks the heart icon in the header
- **THEN** the page `/wishlist` shows the cards of Chanel Gabrielle and Dior Sauvage

#### Scenario: Wishlist card opens the product
- **WHEN** a visitor clicks the Dior Sauvage card on the wishlist page
- **THEN** the page `/products/dior-sauvage` opens

#### Scenario: Removed product leaves the wishlist page
- **WHEN** a visitor removes Dior Sauvage from the wishlist with the heart on its product page and then opens the wishlist page
- **THEN** the Dior Sauvage card is not shown

### Requirement: Unavailable products leave the wishlist
The catalog, product, basket and wishlist pages SHALL check the wishlist when they open; the start page SHALL NOT. A deleted or hidden product SHALL be removed from the wishlist, and the page SHALL show the message "Some products are no longer available and were removed" once, even when basket lines are removed at the same time.

#### Scenario: Failed check keeps the wishlist
- **WHEN** the wishlist holds two products and the backend cannot be reached when the visitor opens the catalog
- **THEN** both products stay in the wishlist
- **AND** no message about unavailable products is shown

#### Scenario: Hidden product removed from the wishlist
- **WHEN** the wishlist holds Chanel Gabrielle and Dior Sauvage, an admin user turns "show on site" off for Chanel Gabrielle, and the visitor opens the wishlist page
- **THEN** only the Dior Sauvage card is shown
- **AND** the message "Some products are no longer available and were removed" is shown

#### Scenario: Deleted product removed from the wishlist
- **WHEN** the wishlist holds Creed Aventus, an admin user deletes Creed Aventus, and the visitor opens the catalog
- **THEN** the message "Some products are no longer available and were removed" is shown
- **AND** the wishlist page no longer shows Creed Aventus

### Requirement: Empty wishlist
When the wishlist has no products, the wishlist page SHALL show "Your wishlist is empty" and a link to the catalog.

#### Scenario: Empty wishlist page
- **WHEN** a visitor with an empty wishlist opens `/wishlist`
- **THEN** the page shows "Your wishlist is empty" and a link to the catalog

### Requirement: Wishlist page loading and error states
While the wishlist products are loading, the wishlist page SHALL show grey placeholder cards. When they cannot be loaded, because the backend answers with an error or cannot be reached, the page SHALL show "Could not load the wishlist" and a "Retry" button that loads them again.

#### Scenario: Placeholders while the wishlist loads
- **WHEN** the wishlist holds two products and the visitor opens the wishlist page before the products have arrived
- **THEN** two grey placeholder cards are shown

#### Scenario: Wishlist error and retry
- **WHEN** the backend is not running and a visitor with a non-empty wishlist opens the wishlist page
- **THEN** the page shows "Could not load the wishlist" and a "Retry" button
- **AND** after the backend is started, clicking "Retry" shows the wishlist cards

### Requirement: Wishlist page accessibility
Every control of the wishlist page SHALL be operable with the keyboard alone, and every product photo SHALL have the product name as its text description.

#### Scenario: Wishlist card photo description
- **WHEN** the wishlist page shows the card of "Dior Sauvage"
- **THEN** the card photo's text description is "Dior Sauvage"

#### Scenario: Open a wishlist card by keyboard only
- **WHEN** a visitor uses only the Tab and Enter keys to reach and open the card of "Dior Sauvage"
- **THEN** the page `/products/dior-sauvage` opens
