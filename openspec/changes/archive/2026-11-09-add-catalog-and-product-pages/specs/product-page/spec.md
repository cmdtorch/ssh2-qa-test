# Spec Delta

## Purpose

The website page of one perfume: photos, rating, size and price, quantity, adding to the basket and the wishlist, the content blocks, related products, and the not-found, loading and error states.

## ADDED Requirements

### Requirement: Product page
The website SHALL serve the page of a visible product at `/products/<short-name>` to any visitor without sign-in, with the product name as the page heading and breadcrumbs "Home page / Products / <product name>", where "Home page" opens the start page and "Products" opens the catalog.

#### Scenario: Product page opens
- **WHEN** a visitor who is not signed in opens `/products/chanel-gabrielle`
- **THEN** the page heading is "CHANEL GABRIELLE"
- **AND** the breadcrumbs read "Home page / Products / Chanel Gabrielle"

#### Scenario: Breadcrumb to the catalog
- **WHEN** a visitor on the product page clicks "Products" in the breadcrumbs
- **THEN** the catalog page `/products` opens

#### Scenario: Breadcrumb to the start page
- **WHEN** a visitor on the product page clicks "Home page" in the breadcrumbs
- **THEN** the start page `/` opens

### Requirement: Product descriptor line display
When the product has a descriptor line, the page SHALL show it under the product name next to the price. When it has none, nothing SHALL be shown in its place.

#### Scenario: Descriptor line shown
- **WHEN** the descriptor line of "Chanel Gabrielle" is "Edp | Floral | Gourmand" and a visitor opens its page
- **THEN** "Edp | Floral | Gourmand" is shown under the product name

#### Scenario: No descriptor line
- **WHEN** a product has no descriptor line and a visitor opens its page
- **THEN** no descriptor text is shown under the product name

### Requirement: Product photo gallery
The page SHALL show the product's first photo large and every photo as a thumbnail. Clicking a thumbnail SHALL show that photo large. The "←" and "→" buttons SHALL show the previous and the next photo; "←" SHALL be inactive on the first photo and "→" on the last.

#### Scenario: Thumbnail shows its photo
- **WHEN** a product has 4 photos and a visitor clicks the third thumbnail
- **THEN** the third photo is shown large

#### Scenario: Arrows move between photos
- **WHEN** the first of 4 photos is shown large and the visitor clicks "→" twice
- **THEN** the third photo is shown large
- **AND** clicking "←" once shows the second photo

#### Scenario: Arrows at the ends
- **WHEN** the first photo is shown large
- **THEN** "←" is inactive
- **AND** after moving to the last photo, "→" is inactive

#### Scenario: Product with one photo
- **WHEN** a product has one photo
- **THEN** both arrows are inactive

### Requirement: Product rating display
When the product has a rating, the page SHALL show it as five stars filled to the rating, with half-filled stars for halves. When the product has no rating, no stars SHALL be shown.

#### Scenario: Rating 4.5
- **WHEN** a product's rating is 4.5
- **THEN** the page shows 4 filled stars and 1 half-filled star

#### Scenario: No rating
- **WHEN** a product has no rating
- **THEN** the page shows no stars

### Requirement: Size choice and price
The "Size" block SHALL show every size of the product with its volume and current price, with the default size chosen when the page opens. The price at the top SHALL be the chosen size's current price; when the chosen size has a sale price, its regular price SHALL be shown struck out next to it. Choosing another size SHALL change that price.

#### Scenario: Default size chosen on open
- **WHEN** a product has sizes 15 ml at $20, 30 ml at $40 (default) and 50 ml at $80 and a visitor opens its page
- **THEN** the 30 ml size is marked as chosen
- **AND** the price at the top is "$40"

#### Scenario: Choosing another size changes the price
- **WHEN** the visitor chooses the 50 ml size
- **THEN** the 50 ml size is marked as chosen and the 30 ml size is not
- **AND** the price at the top is "$80"

#### Scenario: Chosen size with a discount
- **WHEN** a visitor chooses a size with regular price $60 and sale price $40
- **THEN** the price at the top is "$40" with "$60" struck out next to it

### Requirement: Quantity selector
The page SHALL show a quantity of 1 when it opens. "+" SHALL raise it by one up to 10 and "−" SHALL lower it by one down to 1; "−" SHALL be inactive at 1 and "+" at 10.

#### Scenario: Quantity starts at 1
- **WHEN** a visitor opens a product page
- **THEN** the quantity is 1
- **AND** "−" is inactive

#### Scenario: Raise and lower the quantity
- **WHEN** the visitor clicks "+" twice and "−" once
- **THEN** the quantity is 2

#### Scenario: Quantity stops at 10
- **WHEN** the quantity is 10
- **THEN** "+" is inactive
- **AND** the quantity stays 10

### Requirement: Add to basket from the product page
"Add to basket" SHALL add the product with the chosen size and quantity to the basket, as the basket capability defines. It SHALL then show "Added to basket" under the button for 3 seconds, or the limit message instead when the 10 cap applied, and set the quantity back to 1. Choosing another size SHALL NOT change the quantity.

#### Scenario: Confirmation after adding
- **WHEN** a visitor sets the quantity to 3 and clicks "Add to basket"
- **THEN** "Added to basket" is shown under the button
- **AND** the quantity shows 1
- **AND** after 3 seconds "Added to basket" is no longer shown

#### Scenario: Capped add shows only the limit message
- **WHEN** the basket holds this product's 30 ml × 8 and the visitor adds 30 ml × 5
- **THEN** "You can add at most 10 of one product" is shown under the button
- **AND** "Added to basket" is not shown

#### Scenario: Choosing a size keeps the quantity
- **WHEN** the quantity is 4 and the visitor chooses another size
- **THEN** the quantity is still 4

#### Scenario: Add the chosen size and quantity
- **WHEN** the basket is empty and a visitor chooses 50 ml, sets the quantity to 2 and clicks "Add to basket"
- **THEN** the basket holds one line: the product, 50 ml, quantity 2
- **AND** the basket counter in the header shows 2

### Requirement: Wishlist heart on the product page
The heart button next to "Add to basket" SHALL add the product to the wishlist when it is not there and remove it when it is. The heart SHALL be shown filled while the product is in the wishlist.

#### Scenario: Add to the wishlist
- **WHEN** a product is not in the wishlist and the visitor clicks the heart
- **THEN** the heart is shown filled
- **AND** the product is in the wishlist

#### Scenario: Remove from the wishlist
- **WHEN** a product is in the wishlist and the visitor clicks the filled heart
- **THEN** the heart is shown empty
- **AND** the product is no longer in the wishlist

### Requirement: Product content blocks
The page SHALL show the blocks "Size", "Product description", "Notes" (top, heart and base notes), "Ingredients", "Shipping & handling" and "Questions". The first four SHALL be expanded when the page opens; "Shipping & handling" and "Questions" SHALL be collapsed. Each block SHALL collapse with "−" and expand with "+". "Shipping & handling" and "Questions" SHALL show the texts shared by all products.

#### Scenario: Blocks on open
- **WHEN** a visitor opens a product page
- **THEN** "Size", "Product description", "Notes" and "Ingredients" are expanded
- **AND** "Shipping & handling" and "Questions" are collapsed

#### Scenario: Notes are shown
- **WHEN** a product's top notes are "African Marigold, Bergamot, Buchu", heart notes "Cyclamen, Violet" and base notes "Cedarwood, Vetiver"
- **THEN** the "Notes" block shows the three groups with these texts

#### Scenario: Collapse a block
- **WHEN** a visitor clicks "−" next to "Ingredients"
- **THEN** the ingredients text is hidden
- **AND** clicking "+" shows it again

#### Scenario: Collapse the description and the notes
- **WHEN** a visitor clicks "−" next to "Product description" and "−" next to "Notes"
- **THEN** the description text and the three note groups are hidden
- **AND** clicking "+" next to each shows it again

#### Scenario: Expand the shared questions text
- **WHEN** the shared "Questions" text is "How long does a scent last? Up to 8 hours." and a visitor clicks "+" next to "Questions"
- **THEN** the block shows "How long does a scent last? Up to 8 hours."

#### Scenario: Expand the shared shipping text
- **WHEN** the shared "Shipping & handling" text is "Free delivery over $100" and a visitor clicks "+" next to "Shipping & handling"
- **THEN** the block shows "Free delivery over $100"

#### Scenario: Collapse the Size block
- **WHEN** a visitor clicks "−" next to "Size"
- **THEN** the size options are hidden
- **AND** clicking "+" shows them again with the same size chosen

### Requirement: You may also like
Below the content blocks, the page SHALL show "YOU MAY ALSO LIKE" with the cards of the related products, which look and act like catalog cards. When there are no related products, the block SHALL NOT be shown.

#### Scenario: Related products shown
- **WHEN** a visitor opens a women's product while 6 visible women's products exist
- **THEN** "YOU MAY ALSO LIKE" shows 4 cards of other women's products

#### Scenario: Related card opens its product
- **WHEN** a visitor clicks a card under "YOU MAY ALSO LIKE"
- **THEN** that product's page opens

#### Scenario: No related products
- **WHEN** a visitor opens the only visible men's product
- **THEN** the "YOU MAY ALSO LIKE" block is not shown

### Requirement: Product not found
For an unknown short name, a hidden product or any other unknown website address, the website SHALL answer with status 404 and show a "Page not found" page with the shop header and footer and a "Back to catalog" link to `/products`.

#### Scenario: Unknown product address
- **WHEN** a visitor opens `/products/no-such-perfume`
- **THEN** the response status is 404
- **AND** the page shows "Page not found" and a link to the catalog

#### Scenario: Other unknown address
- **WHEN** a visitor opens `/no-such-page`
- **THEN** the response status is 404
- **AND** the page shows "Page not found" and the link "Back to catalog"

#### Scenario: Back to catalog link
- **WHEN** a visitor on the "Page not found" page clicks "Back to catalog"
- **THEN** the catalog page `/products` opens

#### Scenario: Hidden product address
- **WHEN** the product `chanel-gabrielle` has "show on site" off and a visitor opens `/products/chanel-gabrielle`
- **THEN** the response status is 404
- **AND** the page shows "Page not found"

### Requirement: Product page loading and error states
While the product is loading, the page SHALL show grey placeholders. When the product cannot be loaded, because the backend answers with an error or cannot be reached, the page SHALL show the message "Could not load the product" and a "Retry" button that loads it again.

#### Scenario: Placeholders while loading
- **WHEN** a visitor opens a product page and the product has not arrived yet
- **THEN** grey placeholders are shown instead of the photo, the name and the price

#### Scenario: Error and retry
- **WHEN** the backend answers the product detail with status 500
- **THEN** the page shows "Could not load the product" and a "Retry" button
- **AND** after the backend recovers, clicking "Retry" shows the product

#### Scenario: Backend cannot be reached
- **WHEN** the backend is not running and a visitor opens a product page
- **THEN** the page shows "Could not load the product" and a "Retry" button

### Requirement: Product page on narrow screens
On a screen narrower than 1024 px, the product page SHALL show its content in one column without horizontal scrolling.

#### Scenario: Product page on a phone
- **WHEN** a visitor opens a product page on a 375 px wide screen
- **THEN** the page has no horizontal scrolling
- **AND** "Add to basket" is visible without horizontal scrolling

### Requirement: Product page accessibility
Every control of the product page SHALL be operable with the keyboard alone, and every photo and thumbnail SHALL have the product name as its text description. Screen-reader labels SHALL be: the heart "Add to wishlist" or, when filled, "Remove from wishlist"; the arrows "Previous photo" and "Next photo"; "−" and "+" "Decrease quantity" and "Increase quantity".

#### Scenario: Add to basket by keyboard only
- **WHEN** a visitor uses only the Tab, Enter and Space keys to choose a size, raise the quantity to 2 and press "Add to basket"
- **THEN** the basket holds that size with quantity 2

#### Scenario: Icon buttons have labels
- **WHEN** a screen reader reads the heart, arrow and quantity buttons of a product not in the wishlist
- **THEN** it reads "Add to wishlist", "Previous photo", "Next photo", "Decrease quantity" and "Increase quantity"

#### Scenario: Filled heart label
- **WHEN** a product is in the wishlist and a screen reader reads its heart button
- **THEN** it reads "Remove from wishlist"
