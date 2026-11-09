# product-catalog Specification

## Purpose

Stores the perfume products, lets staff manage them in the admin panel, and serves them to the website through a public read-only API.

## Requirements

### Requirement: Product data
A product SHALL have a name, a unique short name, a gender (men's, women's or unisex), a "show on site" flag, an automatically set date added, one or more photos in order, one or more bottle sizes, an optional rating, a description, top, heart and base notes, and an ingredients list. Each size SHALL have a volume in millilitres, a regular price in US dollars and an optional sale price, and exactly one size SHALL be marked as the default.

#### Scenario: Product with all data is saved
- **WHEN** an admin user saves a product with a name, a gender, one photo, sizes 15 ml at $20, 30 ml at $60 with sale price $40 marked default, and 50 ml at $80
- **THEN** the product is saved
- **AND** its date added is set to the moment of saving without the user entering it

#### Scenario: Date added does not change on edit
- **WHEN** an admin user edits the description of a product saved a day earlier
- **THEN** the product's date added stays the same

### Requirement: Product descriptor line
A product SHALL have an optional free-text descriptor line, entered in the admin panel, for example "Edp | Floral | Gourmand". The product detail SHALL return it as entered.

#### Scenario: Descriptor line saved and returned
- **WHEN** an admin user sets the descriptor line of "Chanel Gabrielle" to "Edp | Floral | Gourmand" and a client requests its detail
- **THEN** the detail contains the descriptor line "Edp | Floral | Gourmand"

#### Scenario: Product without a descriptor line
- **WHEN** a product's descriptor line is empty and a client requests its detail
- **THEN** the detail contains no descriptor line

### Requirement: Required product fields
The admin panel SHALL refuse to save a product, showing an error next to the cause, when it has no name, no gender, no photo, no size, no default size or more than one default size, or a size whose sale price is not lower than its regular price.

#### Scenario: Product without a name is refused
- **WHEN** an admin user saves a product with a gender, one photo and one default size but an empty name
- **THEN** the product is not saved
- **AND** an error about the missing name is shown

#### Scenario: Product with a name of only spaces is refused
- **WHEN** an admin user saves a product with a gender, one photo and one default size and the name "   " (three spaces)
- **THEN** the product is not saved
- **AND** an error about the missing name is shown

#### Scenario: Product without a gender is refused
- **WHEN** an admin user saves a product with a name, one photo and one default size but no gender
- **THEN** the product is not saved
- **AND** an error about the missing gender is shown

#### Scenario: Product without a photo is refused
- **WHEN** an admin user saves a product with a name, a gender and one default size but no photo
- **THEN** the product is not saved
- **AND** an error about the missing photo is shown

#### Scenario: Product without a size is refused
- **WHEN** an admin user saves a product with a name, a gender and one photo but no size
- **THEN** the product is not saved
- **AND** an error about the missing size is shown

#### Scenario: Product without a default size is refused
- **WHEN** an admin user saves a product with two sizes, neither marked as default
- **THEN** the product is not saved
- **AND** an error says exactly one size must be the default

#### Scenario: Product with two default sizes is refused
- **WHEN** an admin user saves a product with two sizes, both marked as default
- **THEN** the product is not saved
- **AND** an error says exactly one size must be the default

#### Scenario: Sale price equal to the regular price is refused
- **WHEN** an admin user saves a size with regular price $60 and sale price $60
- **THEN** the product is not saved
- **AND** an error says the sale price must be lower than the regular price

#### Scenario: Sale price above the regular price is refused
- **WHEN** an admin user saves a size with regular price $60 and sale price $70
- **THEN** the product is not saved
- **AND** an error says the sale price must be lower than the regular price

### Requirement: Unique size volumes
The sizes of one product SHALL have different volumes. The admin panel SHALL refuse to save a product with two sizes of the same volume.

#### Scenario: Two sizes with the same volume are refused
- **WHEN** an admin user saves a product with a 30 ml size at $40 and another 30 ml size at $50
- **THEN** the product is not saved
- **AND** an error says each size must have a different volume

### Requirement: Product short name
A product's short name SHALL be filled in from its name when the admin user creates the product, SHALL be editable, and SHALL be unique across products. It forms the product page address. The short name `availability` SHALL be refused, because that address is taken by the availability check.

#### Scenario: Short name filled in from the name
- **WHEN** an admin user creates a product named "Chanel Gabrielle" without typing a short name
- **THEN** the product is saved with the short name `chanel-gabrielle`

#### Scenario: Duplicate short name is refused
- **WHEN** a product with the short name `chanel-gabrielle` exists and an admin user saves another product with the same short name
- **THEN** the second product is not saved
- **AND** an error says the short name is already taken

#### Scenario: Reserved short name is refused
- **WHEN** an admin user saves a product with the short name `availability`
- **THEN** the product is not saved
- **AND** an error says the short name is reserved

### Requirement: Product photo uploads
The admin panel SHALL accept product photos only in JPG, PNG or WebP format and of at most 5 MB, and SHALL refuse any other file with an error message.

#### Scenario: Valid photo is accepted
- **WHEN** an admin user uploads a 2 MB PNG photo to a product and saves it
- **THEN** the photo is saved with the product

#### Scenario: Photo over 5 MB is refused
- **WHEN** an admin user uploads a 6 MB JPG photo to a product and saves it
- **THEN** the product is not saved
- **AND** an error says the photo must be at most 5 MB

#### Scenario: Photo in another format is refused
- **WHEN** an admin user uploads a GIF file as a product photo and saves it
- **THEN** the product is not saved
- **AND** an error says only JPG, PNG or WebP are allowed

### Requirement: Product rating
A product's rating SHALL be optional and, when set, SHALL be a number from 0 to 5 in steps of 0.5, entered by an admin user.

#### Scenario: Valid rating is accepted
- **WHEN** an admin user sets a product's rating to 4.5 and saves it
- **THEN** the product is saved with rating 4.5

#### Scenario: Rating out of range is refused
- **WHEN** an admin user sets a product's rating to 5.5 and saves it
- **THEN** the product is not saved
- **AND** an error says the rating must be from 0 to 5

#### Scenario: Rating off the half-step is refused
- **WHEN** an admin user sets a product's rating to 4.3 and saves it
- **THEN** the product is not saved
- **AND** an error says the rating must be in steps of 0.5

### Requirement: Shared shipping and questions texts
The admin panel SHALL hold one "Shipping & handling" text and one "Questions" text that are shown on every product page.

#### Scenario: Shared text edited in the admin panel
- **WHEN** an admin user changes the "Shipping & handling" text and saves it
- **THEN** the product detail of every product returns the new text

### Requirement: Catalog management permissions
Superusers and staff users who were granted catalog permissions in the admin panel SHALL be able to create, change and delete products and the shared texts. Staff users without those permissions SHALL NOT.

#### Scenario: Staff user with catalog rights edits a product
- **WHEN** a staff user who was granted the catalog change permission opens a product in the admin panel and saves a new name
- **THEN** the product is saved with the new name

#### Scenario: Staff user with catalog rights deletes a product
- **WHEN** a staff user who was granted the catalog delete permission deletes the product "Creed Aventus" in the admin panel
- **THEN** "Creed Aventus" is no longer in the product list
- **AND** its detail answers with status 404

#### Scenario: Staff user without catalog rights cannot edit
- **WHEN** a staff user without any catalog permission opens the admin panel
- **THEN** the catalog section is not listed
- **AND** opening a product's admin address directly is refused with status 403

### Requirement: Hidden products
A product whose "show on site" flag is off SHALL NOT appear in the product list, in search results or in related products, and its detail SHALL answer as not found.

#### Scenario: Hidden product is not listed
- **WHEN** the product "Chanel Gabrielle" has "show on site" off and a client requests the product list
- **THEN** the list does not contain "Chanel Gabrielle"
- **AND** the total count does not include it

#### Scenario: Hidden product is not found by search
- **WHEN** the product "Chanel Gabrielle" has "show on site" off and a client searches for `gabrielle`
- **THEN** the list is empty with a total of 0

#### Scenario: Hidden product detail is not found
- **WHEN** the product with the short name `chanel-gabrielle` has "show on site" off and a client requests its detail
- **THEN** the response status is 404

### Requirement: Public product list
The backend SHALL serve the list of visible products at `GET /api/products/` without sign-in, 16 products per page, with the total number of matching products and the number of pages. Each item SHALL carry the short name, name, gender, first photo and the default size's regular price, sale price and discount percentage.

#### Scenario: First page of a large catalog
- **WHEN** 500 visible products exist and an anonymous client requests the product list without parameters
- **THEN** the response status is 200
- **AND** it contains 16 products
- **AND** it reports a total of 500 and 32 pages

#### Scenario: List item shows the default size prices
- **WHEN** a visible product has sizes 15 ml at $20 and 30 ml at $60 with sale price $40 marked default, and a client requests the product list
- **THEN** that product's item has regular price 60, sale price 40 and discount percentage 33

#### Scenario: List item without a discount
- **WHEN** a visible product's default size has regular price $150 and no sale price, and a client requests the product list
- **THEN** that product's item has regular price 150, no sale price and no discount percentage

#### Scenario: Empty catalog
- **WHEN** no visible products exist and a client requests the product list
- **THEN** the response status is 200
- **AND** it contains no products and reports a total of 0

### Requirement: Discount percentage
The discount percentage SHALL be computed as (regular price − sale price) ÷ regular price × 100, rounded to the nearest whole number, and SHALL be present only when the size has a sale price.

#### Scenario: Whole discount percentage
- **WHEN** a size has regular price $136 and sale price $81.60
- **THEN** its discount percentage is 40

#### Scenario: Rounded discount percentage
- **WHEN** a size has regular price $60 and sale price $40
- **THEN** its discount percentage is 33

### Requirement: Product list gender filter
The product list SHALL accept one gender — men's, women's or unisex — and SHALL then return only products of exactly that gender. Unisex products SHALL NOT be returned for men's or women's.

#### Scenario: Women's filter
- **WHEN** visible products exist with genders women's (3), men's (2) and unisex (1), and a client requests the list filtered by women's
- **THEN** the list contains exactly the 3 women's products and reports a total of 3

#### Scenario: Men's filter excludes unisex
- **WHEN** visible products exist with genders men's (2) and unisex (1), and a client requests the list filtered by men's
- **THEN** the list contains exactly the 2 men's products

#### Scenario: Unknown gender value
- **WHEN** a client requests the list filtered by gender `kids`
- **THEN** the response status is 400

### Requirement: Product list name search
The product list SHALL accept a search text and SHALL then return only products whose name contains it, ignoring letter case. An empty search text SHALL return the whole catalog. The search SHALL combine with the gender filter and the sorting.

#### Scenario: Search by part of the name ignoring case
- **WHEN** visible products "Chanel Gabrielle", "Chanel No. 5" and "Dior Sauvage" exist and a client searches for `chanel`
- **THEN** the list contains "Chanel Gabrielle" and "Chanel No. 5" and not "Dior Sauvage"

#### Scenario: Empty search returns everything
- **WHEN** 20 visible products exist and a client searches for an empty text
- **THEN** the list reports a total of 20

#### Scenario: Search combined with the gender filter
- **WHEN** visible products "Chanel Gabrielle" (women's) and "Bleu de Chanel" (men's) exist and a client searches for `chanel` filtered by men's
- **THEN** the list contains only "Bleu de Chanel"

#### Scenario: Search with no match
- **WHEN** a client searches for `zzz` and no product name contains it
- **THEN** the response status is 200
- **AND** the list is empty with a total of 0

### Requirement: Product list sorting
The product list SHALL sort by "new" (date added, newest first), by price ascending or by price descending. Without a sort parameter it SHALL sort by "new". Price sorting SHALL use the default size's current price: its sale price when set, otherwise its regular price. Products with the same price or the same date added SHALL be ordered by name, A to Z.

#### Scenario: Default sorting is newest first
- **WHEN** products A, B and C were added in that order and a client requests the list without a sort parameter
- **THEN** the list order is C, B, A

#### Scenario: Price low to high uses the sale price
- **WHEN** product A's default size costs $50, product B's costs $60 with sale price $40, and product C's costs $45, and a client requests price ascending
- **THEN** the list order is B, C, A

#### Scenario: Price high to low
- **WHEN** product A's default size costs $50, product B's costs $60 with sale price $40, and product C's costs $45, and a client requests price descending
- **THEN** the list order is A, C, B

#### Scenario: Equal prices are ordered by name
- **WHEN** "YSL Libre" and "Acqua di Gio" both cost $220 and a client requests price ascending
- **THEN** "Acqua di Gio" comes right before "YSL Libre"

#### Scenario: Unknown sort value
- **WHEN** a client requests the list sorted by `rating`
- **THEN** the response status is 400

### Requirement: Product list parameters
The product list SHALL take the parameters `gender` (`men`, `women`, `unisex`), `sort` (`new`, `price-asc`, `price-desc`), `page` (from 1) and `q` (search text). A `page` that is not a whole number of at least 1 SHALL return page 1.

#### Scenario: Parameters combined
- **WHEN** a client requests `GET /api/products/?gender=women&sort=price-asc&q=chanel&page=1`
- **THEN** the response status is 200
- **AND** it lists women's products whose name contains "chanel", sorted by price ascending

#### Scenario: Invalid page number returns page 1
- **WHEN** 40 visible products exist and a client requests page `0`, then page `-1`, then page `abc`
- **THEN** each response status is 200
- **AND** each returns page 1 with 16 products

### Requirement: Empty list parameters
An empty `gender` or `sort` parameter of the product list SHALL be treated as if it were not sent: products of every gender, sorted by "new".

#### Scenario: Empty gender and sort are ignored
- **WHEN** 6 visible products of mixed genders exist and a client requests `GET /api/products/?gender=&sort=`
- **THEN** the response status is 200
- **AND** the list contains all 6 products sorted by "new"

### Requirement: Product list page beyond the last
A request for a page number greater than the number of pages SHALL return the last existing page.

#### Scenario: Page 99 of 3
- **WHEN** 40 visible products exist and a client requests page 99
- **THEN** the response status is 200
- **AND** it returns page 3 with 8 products and reports page number 3

### Requirement: Product detail
The backend SHALL serve one visible product by its short name at `GET /api/products/<short-name>/` without sign-in, with all its data from the product data requirement, every size with its prices and discount percentage, all photos in order, the rating when set, and the shared "Shipping & handling" and "Questions" texts.

#### Scenario: Detail of a visible product
- **WHEN** an anonymous client requests the detail of `chanel-gabrielle`, which has 4 photos and 3 sizes
- **THEN** the response status is 200
- **AND** it contains the name, gender, 4 photos in order, 3 sizes with their prices, which size is the default, the description, notes, ingredients and the two shared texts

#### Scenario: Detail without a rating
- **WHEN** a client requests the detail of a product whose rating is not set
- **THEN** the response contains no rating value

#### Scenario: Unknown product
- **WHEN** a client requests the detail of `no-such-perfume`
- **THEN** the response status is 404

### Requirement: Related products
The product detail SHALL include up to 4 related products: other visible products of the same gender, never the product itself. When there are fewer than 4, it SHALL include as many as exist; when there are none, the list SHALL be empty.

#### Scenario: Four related products
- **WHEN** 6 visible women's products exist and a client requests the detail of one of them
- **THEN** it includes 4 related products, all women's, none of them the requested product

#### Scenario: Fewer than four related products
- **WHEN** 3 visible unisex products exist and a client requests the detail of one of them
- **THEN** it includes the other 2 unisex products

#### Scenario: No related products
- **WHEN** a men's product is the only visible men's product and a client requests its detail
- **THEN** its related products list is empty

#### Scenario: Hidden product is not related
- **WHEN** 2 women's products exist, one with "show on site" off, and a client requests the detail of the visible one
- **THEN** its related products list is empty

### Requirement: Product availability check
The backend SHALL serve `GET /api/products/availability/` without sign-in. Its `items` parameter is a comma-separated list of product short names, each with an optional volume in ml after a colon (`chanel-gabrielle:30,creed-aventus`). For each item it SHALL return whether it is available on the site and, for an available size, its regular price, sale price and discount percentage. Unknown, hidden or deleted items SHALL be unavailable.

#### Scenario: Deleted size is reported unavailable
- **WHEN** an anonymous client checks `chanel-gabrielle` 30 ml and `chanel-gabrielle` 100 ml, and the product has no 100 ml size
- **THEN** the response status is 200
- **AND** 30 ml is reported available with its current prices
- **AND** 100 ml is reported unavailable

#### Scenario: Hidden product is reported unavailable
- **WHEN** a client checks `chanel-gabrielle` without a size while its "show on site" flag is off
- **THEN** it is reported unavailable

#### Scenario: Unknown product is reported unavailable
- **WHEN** a client checks `no-such-perfume` 50 ml
- **THEN** the response status is 200
- **AND** the item is reported unavailable

#### Scenario: Malformed item is refused
- **WHEN** a client checks an item whose volume is `abc`
- **THEN** the response status is 400

#### Scenario: Missing or empty items are refused
- **WHEN** a client requests the availability check without the `items` parameter, and then with `items` empty
- **THEN** each response status is 400

### Requirement: Availability check answer
The availability answer SHALL list one result per requested item, in the request order, each naming the requested item as sent. An available result SHALL carry the product's short name, name, first photo, the size volume and that size's regular price, sale price and discount percentage; for an item without a volume, the size SHALL be the default size. An unavailable result SHALL carry only the item and that it is unavailable.

#### Scenario: Result of a basket item
- **WHEN** a client checks `chanel-gabrielle:30` and the 30 ml size costs $60 with sale price $40
- **THEN** the single result names the item `chanel-gabrielle:30`, is available, and carries the short name `chanel-gabrielle`, the name "Chanel Gabrielle", the first photo, volume 30, regular price 60, sale price 40 and discount percentage 33

#### Scenario: Wishlist item without a volume uses the default size
- **WHEN** a client checks `chanel-gabrielle`, whose default size is 30 ml at $60 with sale price $40
- **THEN** the result carries volume 30, regular price 60 and sale price 40

#### Scenario: Results keep the request order
- **WHEN** a client checks `dior-sauvage:100,no-such-perfume,chanel-gabrielle:30`
- **THEN** the results name `dior-sauvage:100`, `no-such-perfume` and `chanel-gabrielle:30` in that order
- **AND** the second result is unavailable and carries no name, photo or prices

### Requirement: Availability check size limit
One availability check SHALL accept at most 50 items. A request with more than 50 items SHALL be refused with an error and no results; the website SHALL split a longer list into several checks of at most 50 items and join the results in the original order.

#### Scenario: Exactly 50 items are accepted
- **WHEN** a client checks 50 items, each naming an existing visible product
- **THEN** the response status is 200
- **AND** it contains 50 results

#### Scenario: 51 items are refused
- **WHEN** a client checks 51 items
- **THEN** the response status is 400
- **AND** the answer contains no results

#### Scenario: A long basket is checked in several requests
- **WHEN** the basket holds 60 lines and the visitor opens the basket page
- **THEN** the website sends two checks, of 50 and 10 items
- **AND** the basket page shows the current prices of all 60 lines

### Requirement: Product list speed
With 500 visible products in the test environment, the product list SHALL answer a single request for any page, gender filter, search text and sort, with its total count, within 500 ms, measured on the backend after one warm-up request.

#### Scenario: List answers fast with 500 products
- **WHEN** 500 visible products exist and a client requests page 10 filtered by women's and sorted by price ascending
- **THEN** the backend answers within 500 ms
- **AND** the answer includes the total count
