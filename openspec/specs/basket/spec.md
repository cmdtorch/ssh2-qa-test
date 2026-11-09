# basket Specification

## Purpose

Lets a visitor collect products with a chosen size and quantity in a basket kept in their browser, see the count in the header, and review the basket on its own page; there is no checkout.

## Requirements

### Requirement: Basket kept in the browser
The basket SHALL be kept in the visitor's browser, without sign-in, and SHALL survive page reloads and closing the browser tab. A basket line SHALL be one product with one size and a quantity.

#### Scenario: Basket survives a reload
- **WHEN** a visitor adds a product to the basket and reloads the page
- **THEN** the basket still holds that product with the same size and quantity

### Requirement: Basket without browser storage
When the browser does not allow saving data, the basket SHALL still work while the page stays open, and after each change the message "Your choices will not be saved after you close this page" SHALL be shown.

#### Scenario: Blocked storage keeps the basket in memory
- **WHEN** the browser blocks saving data and a visitor adds "Chanel Gabrielle" 30 ml × 1 on its product page
- **THEN** the header counter shows 1 and the message "Your choices will not be saved after you close this page" is shown
- **AND** after opening `/basket` through the header basket icon, the line "Chanel Gabrielle" 30 ml × 1 is shown

### Requirement: Adding to the basket
Adding a product with a size and quantity SHALL create a new line when the basket has no line for that product and size, and SHALL add the quantity to the existing line otherwise. A line SHALL never hold more than 10; when the sum would exceed 10, the line SHALL become 10 and the message "You can add at most 10 of one product" SHALL be shown under "Add to basket" until the visitor's next action on the page.

#### Scenario: Add a new line
- **WHEN** the basket holds Chanel Gabrielle 30 ml × 1 and the visitor adds Chanel Gabrielle 50 ml × 1
- **THEN** the basket holds two lines: 30 ml × 1 and 50 ml × 1

#### Scenario: Same product and size adds to the line
- **WHEN** the basket holds Chanel Gabrielle 30 ml × 2 and the visitor adds Chanel Gabrielle 30 ml × 3
- **THEN** the basket holds one line Chanel Gabrielle 30 ml × 5

#### Scenario: Sum over 10 is capped
- **WHEN** the basket holds Chanel Gabrielle 30 ml × 8 and the visitor adds Chanel Gabrielle 30 ml × 5
- **THEN** the line holds 10
- **AND** the message "You can add at most 10 of one product" is shown under "Add to basket"

#### Scenario: Limit message disappears on the next action
- **WHEN** the limit message is shown and the visitor chooses another size
- **THEN** the message is no longer shown

#### Scenario: Exactly 10 is not capped
- **WHEN** the basket holds Chanel Gabrielle 30 ml × 7 and the visitor adds Chanel Gabrielle 30 ml × 3
- **THEN** the line holds 10
- **AND** no message about the limit is shown

### Requirement: Basket counter in the header
While the basket is not empty, the basket icon in the header SHALL show the total number of units, that is the sum of the quantities of all lines, and SHALL update right after the basket changes.

#### Scenario: Counter shows the sum of quantities
- **WHEN** the basket holds Chanel Gabrielle 30 ml × 2 and Dior Sauvage 100 ml × 1
- **THEN** the basket icon in the header shows 3

#### Scenario: Counter updates after adding
- **WHEN** the counter shows 3 and the visitor adds a product with quantity 2
- **THEN** the counter shows 5 without reloading the page

### Requirement: Basket page
The basket icon in the header SHALL open the basket page `/basket`. It SHALL list every line with the product photo, name, size, quantity, current unit price and line total, and SHALL show the total of all lines. The page SHALL NOT offer checkout.

#### Scenario: Basket page lists the lines and the total
- **WHEN** the basket holds Chanel Gabrielle 30 ml × 2 at $40 and Creed Aventus 50 ml × 1 at $150, and the visitor clicks the basket icon
- **THEN** the page `/basket` shows both lines with line totals "$80" and "$150"
- **AND** the total is "$230"
- **AND** there is no checkout button

#### Scenario: Total with cents
- **WHEN** the basket holds Burberry Goddess 100 ml × 3 at $81.60 and the visitor opens the basket page
- **THEN** the line total and the total are "$244.80"

#### Scenario: Line name opens the product
- **WHEN** a visitor clicks the name of a line on the basket page
- **THEN** that product's page opens

### Requirement: Changing the basket
On the basket page, "+" and "−" SHALL change a line's quantity between 1 and 10, with "−" inactive at 1 and "+" at 10. A remove button SHALL delete the line. The line totals, the total and the header counter SHALL update right away.

#### Scenario: Raise a line quantity
- **WHEN** a line Chanel Gabrielle 30 ml × 2 at $40 is shown and the visitor clicks its "+"
- **THEN** the line shows quantity 3 and line total "$120"
- **AND** the total and the header counter are updated

#### Scenario: Quantity limits on the basket page
- **WHEN** a line has quantity 1
- **THEN** its "−" is inactive
- **AND** when a line has quantity 10, its "+" is inactive

#### Scenario: Remove a line
- **WHEN** the basket holds two lines and the visitor clicks the remove button of one
- **THEN** only the other line is shown
- **AND** the total equals that line's total

### Requirement: Basket shows current prices
The basket page SHALL show each line's current price from the catalog, not the price at the time it was added.

#### Scenario: Price changed after adding
- **WHEN** a visitor added Chanel Gabrielle 30 ml at $40, then an admin user changed its sale price to $35, and the visitor opens the basket page
- **THEN** the line shows the unit price "$35"

### Requirement: Unavailable products leave the basket
The catalog, product, basket and wishlist pages SHALL check the basket when they open; the start page SHALL NOT. A line whose product is deleted or hidden, or whose size is deleted, SHALL be removed, and the page SHALL show the message "Some products are no longer available and were removed" once, even when wishlist products are removed at the same time.

#### Scenario: Failed check removes nothing
- **WHEN** the basket holds two lines and the backend cannot be reached when the visitor opens a product page
- **THEN** both lines stay in the basket
- **AND** no message about unavailable products is shown
- **AND** the check runs again when the visitor opens the next page

#### Scenario: Hidden product removed from the basket
- **WHEN** the basket holds Chanel Gabrielle 30 ml and Dior Sauvage 100 ml, an admin user turns "show on site" off for Chanel Gabrielle, and the visitor opens the basket page
- **THEN** only Dior Sauvage 100 ml is shown
- **AND** the message "Some products are no longer available and were removed" is shown

#### Scenario: Deleted size removed from the basket
- **WHEN** the basket holds Chanel Gabrielle 15 ml and an admin user deletes the 15 ml size, and the visitor opens the catalog
- **THEN** the message "Some products are no longer available and were removed" is shown
- **AND** the header counter no longer counts that line

#### Scenario: Start page does not check the basket
- **WHEN** the basket holds a product that an admin user has hidden and the visitor opens the start page `/`
- **THEN** no message about unavailable products is shown
- **AND** the browser makes no request to the backend

#### Scenario: One message for basket and wishlist
- **WHEN** an admin user hides Chanel Gabrielle while it is both in the basket and in the wishlist, and the visitor opens the catalog
- **THEN** the message "Some products are no longer available and were removed" is shown exactly once
- **AND** Chanel Gabrielle is in neither the basket nor the wishlist

### Requirement: Basket page loading and error states
While the current prices of the basket lines are loading, the basket page SHALL show grey placeholder lines. When they cannot be loaded, because the backend answers with an error or cannot be reached, the page SHALL show "Could not load the basket" and a "Retry" button that loads them again.

#### Scenario: Placeholders while the basket loads
- **WHEN** the basket holds two lines and the visitor opens the basket page before the prices have arrived
- **THEN** two grey placeholder lines are shown

#### Scenario: Basket error and retry
- **WHEN** the backend is not running and a visitor with a non-empty basket opens the basket page
- **THEN** the page shows "Could not load the basket" and a "Retry" button
- **AND** after the backend is started, clicking "Retry" shows the basket lines with prices

### Requirement: Empty basket
When the basket has no lines, the basket page SHALL show "Your basket is empty" and a link to the catalog, and the header basket icon SHALL show no number.

#### Scenario: Empty basket page
- **WHEN** a visitor with an empty basket opens `/basket`
- **THEN** the page shows "Your basket is empty" and a link to the catalog

#### Scenario: Last line removed
- **WHEN** the basket holds one line and the visitor removes it
- **THEN** the page shows "Your basket is empty"
- **AND** the header basket icon shows no number

### Requirement: Basket page accessibility
Every control of the basket page SHALL be operable with the keyboard alone, every product photo SHALL have the product name as its text description, and the screen-reader labels SHALL be "Decrease quantity" and "Increase quantity" for "−" and "+" and "Remove from basket" for the remove button.

#### Scenario: Basket button labels
- **WHEN** a screen reader reads the buttons of a basket line
- **THEN** it reads "Decrease quantity", "Increase quantity" and "Remove from basket"

#### Scenario: Remove a line by keyboard only
- **WHEN** a visitor uses only the Tab and Enter keys to reach and press "Remove from basket" on a line
- **THEN** the line is removed
