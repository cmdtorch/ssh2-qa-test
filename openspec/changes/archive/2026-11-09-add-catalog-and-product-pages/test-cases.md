# Test Cases

## backend-app

### Scenario: Unknown API address

#### Case: Unknown API address answers 404
Labels: automated
- **Given** the backend is running with the catalog endpoints
- **When** a client sends `GET /api/does-not-exist/`
- **Then** the response status is 404

### Scenario: Product catalog endpoints are public

#### Case: Catalog endpoints answer without sign-in
Labels: automated
- **Given** a visible product "Chanel Gabrielle" with short name `chanel-gabrielle` and a 30 ml size
- **And** the client sends no session cookie and no credentials
- **When** the client sends `GET /api/products/`, `GET /api/products/availability/?items=chanel-gabrielle:30` and `GET /api/products/chanel-gabrielle/`
- **Then** each response status is 200

### Scenario: Product catalog is read-only

#### Case: POST to the product list is rejected
Labels: automated
- **Given** the catalog holds 3 products
- **When** an anonymous client sends `POST /api/products/` with the body `{"name": "Fake Perfume", "gender": "women"}`
- **Then** the response status is 405
- **And** the catalog still holds exactly 3 products

#### Case: Write methods on a product detail are rejected
Labels: automated
- **Given** a visible product with short name `chanel-gabrielle`
- **When** an anonymous client sends `PUT`, `PATCH` and `DELETE` to `/api/products/chanel-gabrielle/`
- **Then** each response status is 405
- **And** the product is unchanged and still listed

## product-catalog

### Scenario: Product with all data is saved

#### Case: Admin saves a product with three sizes
Labels: automated
- **Given** a superuser signed in to the admin panel at 2026-10-28 10:00
- **When** the superuser saves "Chanel Gabrielle", gender women's, one 2 MB PNG photo, sizes 15 ml at $20, 30 ml at $60 with sale price $40 marked default, and 50 ml at $80, leaving the date added untouched
- **Then** the product is saved with 3 sizes and 30 ml as the default
- **And** its date added is 2026-10-28 10:00 (within one minute)

### Scenario: Date added does not change on edit

#### Case: Editing the description keeps the date added
Labels: automated
- **Given** "Chanel Gabrielle" was saved on 2026-10-27 at 10:00
- **When** an admin user changes its description to "New text" on 2026-10-28 and saves
- **Then** the description is "New text"
- **And** the date added is still 2026-10-27 10:00

### Scenario: Descriptor line saved and returned

#### Case: Descriptor line round-trips through the API
Labels: automated
- **Given** the visible product "Chanel Gabrielle" with an empty descriptor line
- **When** an admin user sets the descriptor line to "Edp | Floral | Gourmand" and a client requests `GET /api/products/chanel-gabrielle/`
- **Then** the detail contains the descriptor line "Edp | Floral | Gourmand" exactly as entered

### Scenario: Product without a descriptor line

#### Case: Empty descriptor line is absent from the detail
Labels: automated
- **Given** the visible product "Creed Aventus" with an empty descriptor line
- **When** a client requests its detail
- **Then** the detail carries no descriptor line value (absent or null)

### Scenario: Product without a name is refused

#### Case: Empty name is refused
Labels: automated
- **Given** a superuser on the admin "add product" form with gender men's, one photo and a default 100 ml size at $150
- **When** the superuser leaves the name empty and saves
- **Then** no product is created
- **And** an error is shown next to the name field

### Scenario: Product with a name of only spaces is refused

#### Case: Name of only spaces is refused
Labels: automated
- **Given** a superuser on the admin "add product" form with gender men's, one photo and a default 100 ml size at $150
- **When** the superuser enters "   " (three spaces) as the name and saves
- **Then** no product is created
- **And** an error is shown next to the name field

### Scenario: Product without a gender is refused

#### Case: Missing gender is refused
Labels: automated
- **Given** a superuser on the admin "add product" form with name "Creed Aventus", one photo and a default 100 ml size at $150
- **When** the superuser saves without choosing a gender
- **Then** no product is created
- **And** an error is shown next to the gender field

### Scenario: Product without a photo is refused

#### Case: Product with no photo is refused
Labels: automated
- **Given** a superuser on the admin "add product" form with name "Creed Aventus", gender men's and a default 100 ml size at $150
- **When** the superuser saves without any photo
- **Then** no product is created
- **And** an error about the missing photo is shown

#### Case: Removing the last photo of an existing product is refused
Labels: automated
- **Given** the saved product "Creed Aventus" with exactly one photo
- **When** an admin user deletes that photo on the edit form and saves
- **Then** the change is not saved and the product still has its photo
- **And** an error about the missing photo is shown

### Scenario: Product without a size is refused

#### Case: Product with no size is refused
Labels: automated
- **Given** a superuser on the admin "add product" form with name "Creed Aventus", gender men's and one photo
- **When** the superuser saves without any size
- **Then** no product is created
- **And** an error about the missing size is shown

### Scenario: Product without a default size is refused

#### Case: Two sizes and no default are refused
Labels: automated
- **Given** a superuser on the admin "add product" form with sizes 50 ml at $100 and 100 ml at $150, neither marked default
- **When** the superuser saves
- **Then** no product is created
- **And** an error says exactly one size must be the default

### Scenario: Product with two default sizes is refused

#### Case: Two default sizes are refused
Labels: automated
- **Given** a superuser on the admin "add product" form with sizes 50 ml at $100 and 100 ml at $150, both marked default
- **When** the superuser saves
- **Then** no product is created
- **And** an error says exactly one size must be the default

### Scenario: Sale price equal to the regular price is refused

#### Case: Sale price equal to the regular price
Labels: automated
- **Given** the admin form of "Chanel Gabrielle" (women's, one photo) whose default 30 ml size has regular price $60
- **When** the admin user sets its sale price to $60 and saves
- **Then** the product is not saved
- **And** an error says the sale price must be lower than the regular price

#### Case: Sale price one cent below the regular price is accepted
Labels: automated
- **Given** the admin form of "Chanel Gabrielle" (women's, one photo) whose default 30 ml size has regular price $60.00
- **When** the admin user sets its sale price to $59.99 and saves
- **Then** the product is saved with sale price $59.99

### Scenario: Sale price above the regular price is refused

#### Case: Sale price above the regular price
Labels: automated
- **Given** the admin form of "Chanel Gabrielle" (women's, one photo) whose default 30 ml size has regular price $60
- **When** the admin user sets its sale price to $70 and saves
- **Then** the product is not saved
- **And** an error says the sale price must be lower than the regular price

### Scenario: Two sizes with the same volume are refused

#### Case: Duplicate 30 ml sizes are refused
Labels: automated
- **Given** the admin form of "Chanel Gabrielle" (women's, one photo)
- **When** the admin user adds a 30 ml size at $40 (default) and another 30 ml size at $50 and saves
- **Then** the product is not saved
- **And** an error says each size must have a different volume

### Scenario: Short name filled in from the name

#### Case: Short name is generated from the name
Labels: automated
- **Given** a superuser on the admin "add product" form
- **When** the superuser enters the name "Chanel Gabrielle", leaves the short name empty and saves a valid product
- **Then** the product is saved with the short name `chanel-gabrielle`

#### Case: Name with punctuation gives a clean short name
Labels: automated
- **Given** a superuser on the admin "add product" form
- **When** the superuser enters the name "Dior J'adore No. 5" and saves a valid product without a short name
- **Then** the short name contains only lowercase letters, digits and hyphens, for example `dior-jadore-no-5`

### Scenario: Duplicate short name is refused

#### Case: Second product with the same short name is refused
Labels: automated
- **Given** a saved product with the short name `chanel-gabrielle`
- **When** an admin user saves a new valid product with the short name `chanel-gabrielle`
- **Then** the new product is not saved
- **And** an error says the short name is already taken

### Scenario: Reserved short name is refused

#### Case: Short name availability is refused
Labels: automated
- **Given** a superuser on the admin "add product" form
- **When** the superuser saves a valid product with the short name `availability`
- **Then** the product is not saved
- **And** an error says the short name is reserved

### Scenario: Valid photo is accepted

#### Case: 2 MB PNG photo is accepted
Labels: automated
- **Given** an admin user on the edit form of "Chanel Gabrielle" (women's, one photo, default 30 ml size at $60)
- **When** the user uploads a 2 MB PNG image and saves
- **Then** the product is saved with the new photo listed among its photos

#### Case: Photo of exactly 5 MB is accepted
Labels: automated
- **Given** an admin user on the edit form of "Chanel Gabrielle" (women's, one photo, default 30 ml size at $60)
- **When** the user uploads a WebP image of exactly 5 MB (5,242,880 bytes) and saves
- **Then** the product is saved with the photo

### Scenario: Photo over 5 MB is refused

#### Case: 6 MB JPG photo is refused
Labels: automated
- **Given** an admin user on the edit form of "Chanel Gabrielle" (women's, one photo, default 30 ml size at $60)
- **When** the user uploads a 6 MB JPG image and saves
- **Then** the product is not saved
- **And** an error says the photo must be at most 5 MB

#### Case: Photo one byte over 5 MB is refused
Labels: automated
- **Given** an admin user on the edit form of "Chanel Gabrielle" (women's, one photo, default 30 ml size at $60)
- **When** the user uploads a JPG image of 5,242,881 bytes and saves
- **Then** the product is not saved
- **And** an error says the photo must be at most 5 MB

### Scenario: Photo in another format is refused

#### Case: GIF photo is refused
Labels: automated
- **Given** an admin user on the edit form of "Chanel Gabrielle" (women's, one photo, default 30 ml size at $60)
- **When** the user uploads a 100 KB GIF file and saves
- **Then** the product is not saved
- **And** an error says only JPG, PNG or WebP are allowed

#### Case: Text file renamed to .png is refused
Labels: automated
- **Given** an admin user on the edit form of "Chanel Gabrielle" (women's, one photo, default 30 ml size at $60)
- **When** the user uploads a plain text file named `photo.png` and saves
- **Then** the product is not saved
- **And** an error says only JPG, PNG or WebP are allowed

### Scenario: Valid rating is accepted

#### Case: Rating 4.5 is accepted
Labels: automated
- **Given** an admin user on the edit form of "Chanel Gabrielle" (women's, one photo, default 30 ml size at $60) without a rating
- **When** the user sets the rating to 4.5 and saves
- **Then** the product is saved with rating 4.5

#### Case: Rating bounds 0 and 5 are accepted
Labels: automated
- **Given** an admin user on the edit form of "Chanel Gabrielle" (women's, one photo, default 30 ml size at $60)
- **When** the user saves the rating 0, and then saves the rating 5
- **Then** each time the product is saved with that rating

#### Case: Clearing the rating is accepted
Labels: automated
- **Given** the product "Chanel Gabrielle" with rating 4
- **When** an admin user empties the rating field and saves
- **Then** the product is saved without a rating

### Scenario: Rating out of range is refused

#### Case: Rating 5.5 is refused
Labels: automated
- **Given** an admin user on the edit form of "Chanel Gabrielle" (women's, one photo, default 30 ml size at $60)
- **When** the user sets the rating to 5.5 and saves
- **Then** the product is not saved
- **And** an error says the rating must be from 0 to 5

#### Case: Negative rating is refused
Labels: automated
- **Given** an admin user on the edit form of "Chanel Gabrielle" (women's, one photo, default 30 ml size at $60)
- **When** the user sets the rating to -0.5 and saves
- **Then** the product is not saved
- **And** an error says the rating must be from 0 to 5

### Scenario: Rating off the half-step is refused

#### Case: Rating 4.3 is refused
Labels: automated
- **Given** an admin user on the edit form of "Chanel Gabrielle" (women's, one photo, default 30 ml size at $60)
- **When** the user sets the rating to 4.3 and saves
- **Then** the product is not saved
- **And** an error says the rating must be in steps of 0.5

### Scenario: Shared text edited in the admin panel

#### Case: New shipping text appears on every product
Labels: automated
- **Given** the visible products "Chanel Gabrielle" and "Creed Aventus" and the shared "Shipping & handling" text "Delivery in 5 days"
- **When** an admin user changes the shared text to "Free delivery over $100" and saves
- **Then** the details of both products return "Free delivery over $100" as the shipping text

#### Case: New questions text appears on every product
Labels: automated
- **Given** the visible products "Chanel Gabrielle" and "Creed Aventus" and an empty shared "Questions" text
- **When** an admin user sets it to "How long does a scent last? Up to 8 hours." and saves
- **Then** the details of both products return that questions text

### Scenario: Staff user with catalog rights edits a product

#### Case: Staff with change right renames a product
Labels: automated
- **Given** a staff user (not a superuser) granted only the catalog view and change permissions, and the product "Creed Aventus"
- **When** the user opens "Creed Aventus" in the admin panel, changes the name to "Creed Aventus 2026" and saves
- **Then** the product's name is "Creed Aventus 2026"

#### Case: Staff with add right creates a product
Labels: automated
- **Given** a staff user granted the catalog view and add permissions
- **When** the user saves a new valid product "Versace Eros" (men's, one photo, default 100 ml size at $220) in the admin panel
- **Then** the product is created
- **And** `GET /api/products/` lists "Versace Eros"

### Scenario: Staff user with catalog rights deletes a product

#### Case: Staff with delete right deletes a product
Labels: automated
- **Given** a staff user granted the catalog view and delete permissions, and the visible product "Creed Aventus" with short name `creed-aventus`
- **When** the user deletes "Creed Aventus" in the admin panel and confirms
- **Then** `GET /api/products/` no longer lists "Creed Aventus"
- **And** `GET /api/products/creed-aventus/` answers 404

### Scenario: Staff user without catalog rights cannot edit

#### Case: Staff without catalog rights sees no catalog
Labels: automated
- **Given** a staff user without any catalog permission and the product "Creed Aventus"
- **When** the user opens the admin panel home page
- **Then** no catalog section is listed
- **And** opening the admin change address of "Creed Aventus" directly answers 403

#### Case: Staff with view right only cannot save changes
Labels: automated
- **Given** a staff user granted only the catalog view permission
- **When** the user posts a changed name to the admin change form of "Creed Aventus"
- **Then** the response status is 403
- **And** the product name is unchanged

#### Case: Staff without catalog rights cannot change the shared texts
Labels: automated
- **Given** a staff user without any catalog permission and the shared "Shipping & handling" text "Delivery in 5 days"
- **When** the user posts the new text "Free delivery" to the admin change form of the shared texts
- **Then** the response status is 403
- **And** the product details still return "Delivery in 5 days"

### Scenario: Hidden product is not listed

#### Case: Hidden product is left out of the list and the count
Labels: automated
- **Given** 3 visible products and "Chanel Gabrielle" with "show on site" off
- **When** a client requests `GET /api/products/`
- **Then** the list contains 3 products, none of them "Chanel Gabrielle"
- **And** the total is 3

#### Case: Showing the product again lists it
Labels: automated
- **Given** "Chanel Gabrielle" with "show on site" off
- **When** an admin user turns "show on site" on and a client requests the list
- **Then** the list contains "Chanel Gabrielle"

### Scenario: Hidden product is not found by search

#### Case: Search does not find a hidden product
Labels: automated
- **Given** "Chanel Gabrielle" with "show on site" off and no other product containing "gabrielle"
- **When** a client requests `GET /api/products/?q=gabrielle`
- **Then** the list is empty
- **And** the total is 0

### Scenario: Hidden product detail is not found

#### Case: Hidden product detail answers 404
Labels: automated
- **Given** the product with short name `chanel-gabrielle` and "show on site" off
- **When** a client requests `GET /api/products/chanel-gabrielle/`
- **Then** the response status is 404

### Scenario: First page of a large catalog

#### Case: 500 products give 32 pages of 16
Labels: automated
- **Given** 500 visible products
- **When** an anonymous client requests `GET /api/products/` without parameters
- **Then** the response status is 200
- **And** it contains 16 products
- **And** it reports a total of 500 and 32 pages

#### Case: Exactly 16 products give one page
Labels: automated
- **Given** exactly 16 visible products
- **When** a client requests the product list
- **Then** it contains 16 products and reports 1 page

#### Case: 17 products give two pages
Labels: automated
- **Given** exactly 17 visible products
- **When** a client requests page 2 of the product list
- **Then** it contains 1 product and reports 2 pages

### Scenario: List item shows the default size prices

#### Case: List item carries the default size prices and discount
Labels: automated
- **Given** the visible product "Chanel Gabrielle" with sizes 15 ml at $20 and 30 ml at $60 with sale price $40 marked default
- **When** a client requests the product list
- **Then** its item has regular price 60, sale price 40 and discount percentage 33
- **And** it carries the short name `chanel-gabrielle`, the name, the gender and the first photo

### Scenario: List item without a discount

#### Case: List item without a sale price
Labels: automated
- **Given** the visible product "Creed Aventus" whose default 100 ml size costs $150 with no sale price
- **When** a client requests the product list
- **Then** its item has regular price 150, no sale price and no discount percentage

### Scenario: Empty catalog

#### Case: Empty catalog answers an empty list
Labels: automated
- **Given** no products at all
- **When** a client requests the product list
- **Then** the response status is 200
- **And** it contains no products and reports a total of 0

#### Case: Catalog with only hidden products is empty
Labels: automated
- **Given** 2 products, both with "show on site" off
- **When** a client requests the product list
- **Then** it contains no products and reports a total of 0

### Scenario: Whole discount percentage

#### Case: 136 to 81.60 is 40 percent
Labels: automated
- **Given** a size with regular price $136.00 and sale price $81.60
- **When** its discount percentage is computed
- **Then** it is 40

### Scenario: Rounded discount percentage

#### Case: 60 to 40 rounds down to 33
Labels: automated
- **Given** a size with regular price $60 and sale price $40 (33.33 %)
- **When** its discount percentage is computed
- **Then** it is 33

#### Case: Under one percent rounds up to 1
Labels: automated
- **Given** a size with regular price $200 and sale price $198.80 (0.6 %)
- **When** its discount percentage is computed
- **Then** it is 1

#### Case: 66.67 percent rounds up to 67
Labels: automated
- **Given** a size with regular price $60 and sale price $20
- **When** its discount percentage is computed
- **Then** it is 67

### Scenario: Women's filter

#### Case: Women's filter returns only women's products
Labels: automated
- **Given** visible products: 3 women's, 2 men's and 1 unisex
- **When** a client requests `GET /api/products/?gender=women`
- **Then** the list contains exactly the 3 women's products
- **And** the total is 3

### Scenario: Men's filter excludes unisex

#### Case: Men's filter leaves out unisex
Labels: automated
- **Given** visible products: 2 men's and 1 unisex
- **When** a client requests `GET /api/products/?gender=men`
- **Then** the list contains exactly the 2 men's products

#### Case: Unisex filter returns only unisex
Labels: automated
- **Given** visible products: 2 men's, 2 women's and 1 unisex
- **When** a client requests `GET /api/products/?gender=unisex`
- **Then** the list contains exactly the 1 unisex product

### Scenario: Unknown gender value

#### Case: Gender kids answers 400
Labels: automated
- **Given** the catalog has visible products
- **When** a client requests `GET /api/products/?gender=kids`
- **Then** the response status is 400

### Scenario: Search by part of the name ignoring case

#### Case: Lowercase search finds capitalised names
Labels: automated
- **Given** visible products "Chanel Gabrielle", "Chanel No. 5" and "Dior Sauvage"
- **When** a client requests `GET /api/products/?q=chanel`
- **Then** the list contains "Chanel Gabrielle" and "Chanel No. 5"
- **And** it does not contain "Dior Sauvage"

#### Case: Uppercase search in the middle of a name
Labels: automated
- **Given** visible products "Chanel Gabrielle" and "Dior Sauvage"
- **When** a client requests `GET /api/products/?q=SAUV`
- **Then** the list contains only "Dior Sauvage"

### Scenario: Empty search returns everything

#### Case: Empty q returns all products
Labels: automated
- **Given** 20 visible products
- **When** a client requests `GET /api/products/?q=`
- **Then** the total is 20

### Scenario: Search combined with the gender filter

#### Case: Search chanel within men's
Labels: automated
- **Given** visible products "Chanel Gabrielle" (women's) and "Bleu de Chanel" (men's)
- **When** a client requests `GET /api/products/?q=chanel&gender=men`
- **Then** the list contains only "Bleu de Chanel"

### Scenario: Search with no match

#### Case: Search zzz finds nothing
Labels: automated
- **Given** visible products none of whose names contain "zzz"
- **When** a client requests `GET /api/products/?q=zzz`
- **Then** the response status is 200
- **And** the list is empty with a total of 0

### Scenario: Default sorting is newest first

#### Case: No sort parameter gives newest first
Labels: automated
- **Given** products A added 2026-10-01, B added 2026-10-02 and C added 2026-10-03
- **When** a client requests the product list without `sort`
- **Then** the order is C, B, A

#### Case: Sort new gives newest first
Labels: automated
- **Given** the same products A, B and C
- **When** a client requests `GET /api/products/?sort=new`
- **Then** the order is C, B, A

### Scenario: Price low to high uses the sale price

#### Case: Ascending price uses the sale price
Labels: automated
- **Given** default sizes: A $50; B $60 with sale price $40; C $45
- **When** a client requests `GET /api/products/?sort=price-asc`
- **Then** the order is B, C, A

### Scenario: Price high to low

#### Case: Descending price uses the sale price
Labels: automated
- **Given** default sizes: A $50; B $60 with sale price $40; C $45
- **When** a client requests `GET /api/products/?sort=price-desc`
- **Then** the order is A, C, B

### Scenario: Equal prices are ordered by name

#### Case: Equal prices ordered A to Z
Labels: automated
- **Given** "YSL Libre" and "Acqua di Gio" both with a default size at $220
- **When** a client requests `GET /api/products/?sort=price-asc`
- **Then** "Acqua di Gio" comes right before "YSL Libre"

#### Case: Same date added ordered A to Z
Labels: automated
- **Given** "Versace Eros" and "Dior Sauvage" both added at 2026-10-01 10:00:00
- **When** a client requests the list sorted by `new`
- **Then** "Dior Sauvage" comes right before "Versace Eros"

#### Case: Ties stay stable across pages
Labels: automated
- **Given** 20 visible products all with a default size at $100
- **When** a client requests page 1 and page 2 sorted by `price-asc`
- **Then** the 20 products appear exactly once across both pages, in name order

### Scenario: Unknown sort value

#### Case: Sort rating answers 400
Labels: automated
- **Given** the catalog has visible products
- **When** a client requests `GET /api/products/?sort=rating`
- **Then** the response status is 400

### Scenario: Parameters combined

#### Case: All four parameters together
Labels: automated
- **Given** visible products "Chanel Gabrielle" (women's, $40), "Chanel No. 5" (women's, $120), "Bleu de Chanel" (men's, $78) and "Dior J'adore" (women's, $92.40)
- **When** a client requests `GET /api/products/?gender=women&sort=price-asc&q=chanel&page=1`
- **Then** the response status is 200
- **And** the list is "Chanel Gabrielle", "Chanel No. 5" in that order

### Scenario: Invalid page number returns page 1

#### Case: Pages 0, -1 and abc return page 1
Labels: automated
- **Given** 40 visible products
- **When** a client requests page `0`, then page `-1`, then page `abc`
- **Then** each response status is 200
- **And** each returns page 1 with 16 products

### Scenario: Empty gender and sort are ignored

#### Case: Empty gender and sort give the whole catalog
Labels: automated
- **Given** 6 visible products: 2 women's, 2 men's and 2 unisex, added in the order A, B, C, D, E, F
- **When** a client requests `GET /api/products/?gender=&sort=`
- **Then** the response status is 200
- **And** the list contains all 6 products in the order F, E, D, C, B, A

#### Case: Empty gender with a valid sort
Labels: automated
- **Given** 6 visible products of mixed genders with default-size prices $50, $60, $45, $70, $55 and $40
- **When** a client requests `GET /api/products/?gender=&sort=price-asc`
- **Then** the response status is 200
- **And** the list contains all 6 products in the price order $40, $45, $50, $55, $60, $70

### Scenario: Page 99 of 3

#### Case: Page 99 returns the last page
Labels: automated
- **Given** 40 visible products
- **When** a client requests `GET /api/products/?page=99`
- **Then** the response status is 200
- **And** it returns page number 3 with 8 products

#### Case: Page beyond the last of an empty result
Labels: automated
- **Given** no visible product contains "zzz"
- **When** a client requests `GET /api/products/?q=zzz&page=5`
- **Then** the response status is 200
- **And** the list is empty with a total of 0

### Scenario: Detail of a visible product

#### Case: Full detail of a product
Labels: automated
- **Given** the visible product `chanel-gabrielle` with 4 photos, sizes 15 ml at $20, 30 ml at $60 with sale $40 (default) and 50 ml at $80, rating 4.5, a description, top notes "African Marigold, Bergamot, Buchu", heart notes "Cyclamen, Violet", base notes "Cedarwood, Vetiver", an ingredients text, and shared texts set
- **When** an anonymous client requests `GET /api/products/chanel-gabrielle/`
- **Then** the response status is 200
- **And** it carries the name, gender women's, the 4 photos in their order, the 3 sizes with their prices and discount, 30 ml as the default, rating 4.5, the description, the three note groups, the ingredients and both shared texts

### Scenario: Detail without a rating

#### Case: Detail of a product without a rating
Labels: automated
- **Given** the visible product "Creed Aventus" whose rating is empty
- **When** a client requests its detail
- **Then** the detail carries no rating value (absent or null)

### Scenario: Unknown product

#### Case: Unknown short name answers 404
Labels: automated
- **Given** no product with short name `no-such-perfume`
- **When** a client requests `GET /api/products/no-such-perfume/`
- **Then** the response status is 404

### Scenario: Four related products

#### Case: Four related products of the same gender
Labels: automated
- **Given** 6 visible women's products and 3 visible men's products
- **When** a client requests the detail of the women's product "Chanel Gabrielle"
- **Then** it includes exactly 4 related products
- **And** all 4 are women's and none is "Chanel Gabrielle"

### Scenario: Fewer than four related products

#### Case: Two unisex products are related
Labels: automated
- **Given** exactly 3 visible unisex products and several men's and women's products
- **When** a client requests the detail of one unisex product
- **Then** it includes exactly the other 2 unisex products

### Scenario: No related products

#### Case: Only men's product has no related products
Labels: automated
- **Given** "Creed Aventus" is the only visible men's product and 5 women's products exist
- **When** a client requests its detail
- **Then** its related products list is empty

### Scenario: Hidden product is not related

#### Case: Hidden women's product is not related
Labels: automated
- **Given** the women's products "Chanel Gabrielle" (visible) and "YSL Libre" (show on site off), and no other women's product
- **When** a client requests the detail of "Chanel Gabrielle"
- **Then** its related products list is empty

### Scenario: Deleted size is reported unavailable

#### Case: Existing and missing sizes in one check
Labels: automated
- **Given** `chanel-gabrielle` has sizes 15 ml, 30 ml (at $60 with sale $40) and 50 ml, and no 100 ml size
- **When** an anonymous client requests `GET /api/products/availability/?items=chanel-gabrielle:30,chanel-gabrielle:100`
- **Then** the response status is 200
- **And** the 30 ml result is available with regular price 60, sale price 40
- **And** the 100 ml result is unavailable

#### Case: Size deleted after it was added
Labels: automated
- **Given** `chanel-gabrielle` had a 15 ml size that an admin user deleted
- **When** a client checks `chanel-gabrielle:15`
- **Then** the result is unavailable

### Scenario: Hidden product is reported unavailable

#### Case: Hidden product without a size is unavailable
Labels: automated
- **Given** `chanel-gabrielle` with "show on site" off
- **When** a client checks `chanel-gabrielle`
- **Then** the result is unavailable

#### Case: Hidden product with a size is unavailable
Labels: automated
- **Given** `chanel-gabrielle` with "show on site" off and a 30 ml size
- **When** a client checks `chanel-gabrielle:30`
- **Then** the result is unavailable and carries no prices

### Scenario: Unknown product is reported unavailable

#### Case: Unknown product with a size is unavailable
Labels: automated
- **Given** no product `no-such-perfume`
- **When** a client checks `no-such-perfume:50`
- **Then** the response status is 200
- **And** the result is unavailable

### Scenario: Malformed item is refused

#### Case: Volume abc is refused
Labels: automated
- **Given** `chanel-gabrielle` exists
- **When** a client checks `chanel-gabrielle:abc`
- **Then** the response status is 400

#### Case: Item with an empty short name is refused
Labels: automated
- **Given** the backend is running
- **When** a client checks `:30`
- **Then** the response status is 400

### Scenario: Missing or empty items are refused

#### Case: No items parameter and empty items
Labels: automated
- **Given** the backend is running
- **When** a client requests `GET /api/products/availability/`, and then `GET /api/products/availability/?items=`
- **Then** each response status is 400

### Scenario: Result of a basket item

#### Case: Available basket item carries all fields
Labels: automated
- **Given** the visible product "Chanel Gabrielle" (`chanel-gabrielle`) whose 30 ml size costs $60 with sale price $40
- **When** a client checks `chanel-gabrielle:30`
- **Then** the single result names the item `chanel-gabrielle:30` and is available
- **And** it carries short name `chanel-gabrielle`, name "Chanel Gabrielle", the first photo, volume 30, regular price 60, sale price 40 and discount percentage 33

### Scenario: Wishlist item without a volume uses the default size

#### Case: Item without volume gets the default size
Labels: automated
- **Given** `chanel-gabrielle` with sizes 15 ml at $20 and 30 ml at $60 with sale price $40 marked default
- **When** a client checks `chanel-gabrielle`
- **Then** the result is available with volume 30, regular price 60 and sale price 40

### Scenario: Results keep the request order

#### Case: Mixed items keep their order
Labels: automated
- **Given** visible `dior-sauvage` with a 100 ml size and visible `chanel-gabrielle` with a 30 ml size, and no `no-such-perfume`
- **When** a client checks `dior-sauvage:100,no-such-perfume,chanel-gabrielle:30`
- **Then** the results name `dior-sauvage:100`, `no-such-perfume` and `chanel-gabrielle:30` in that order
- **And** the second result is unavailable and carries no name, photo or prices

#### Case: Same item twice gives two results
Labels: automated
- **Given** visible `chanel-gabrielle` with a 30 ml size
- **When** a client checks `chanel-gabrielle:30,chanel-gabrielle:30`
- **Then** the response has two results, both naming `chanel-gabrielle:30` and both available, in that order

### Scenario: Exactly 50 items are accepted

#### Case: 50 items give 50 results
Labels: automated
- **Given** 50 visible products exist
- **When** a client checks all 50 products by their short names
- **Then** the response status is 200
- **And** the answer contains 50 results

### Scenario: 51 items are refused

#### Case: 51 items are refused with no results
Labels: automated
- **Given** 51 visible products exist
- **When** a client checks all 51 products by their short names
- **Then** the response status is 400
- **And** the answer contains no results

### Scenario: A long basket is checked in several requests

#### Case: 60 basket lines are checked in two requests
Labels: automated, e2e
- **Given** the basket holds 60 lines of 60 different visible products, each with a 30 ml size
- **When** the visitor opens the basket page
- **Then** the browser sends two availability checks, of 50 and 10 items
- **And** the basket page shows the current price of all 60 lines

### Scenario: List answers fast with 500 products

#### Case: Filtered sorted page answers within 500 ms
Labels: automated
- **Given** 500 visible products in the test environment, 250 of them women's, and one warm-up request already sent
- **When** a client requests `GET /api/products/?gender=women&sort=price-asc&page=10`
- **Then** the backend answers within 500 ms
- **And** the answer includes the total 250

#### Case: Search over 500 products answers within 500 ms
Labels: automated
- **Given** 500 visible products in the test environment and one warm-up request already sent
- **When** a client requests `GET /api/products/?q=chanel&sort=new`
- **Then** the backend answers within 500 ms with the total count

## catalog-page

### Scenario: Catalog page opens

#### Case: Anonymous visitor sees the first 16 cards
Labels: automated, e2e
- **Given** 20 visible products and a visitor who is not signed in
- **When** the visitor opens `/products`
- **Then** the page shows the heading "PRODUCTS" and the breadcrumbs "Home page / Products"
- **And** it shows exactly 16 product cards

### Scenario: Breadcrumb from the catalog to the start page

#### Case: Home page breadcrumb opens the start page
Labels: e2e
- **Given** a visitor on `/products`
- **When** the visitor clicks "Home page" in the breadcrumbs
- **Then** the address is `/`
- **And** the start page heading is shown

### Scenario: Card of a discounted product

#### Case: Discounted card shows old price, new price and badge
Labels: automated, e2e
- **Given** "Burberry Goddess" whose default size has regular price $136 and sale price $81.60
- **When** a visitor opens the catalog
- **Then** its card shows "$136" struck out, "$81.60" and the badge "40%"
- **And** the card shows the product's first photo and the name "Burberry Goddess"

### Scenario: Card of a product without a discount

#### Case: Card without discount shows one price
Labels: automated, e2e
- **Given** "Creed Aventus" whose default size has regular price $150 and no sale price
- **When** a visitor opens the catalog
- **Then** its card shows "$150"
- **And** it shows no badge and no struck-out price

### Scenario: Card opens the product page

#### Case: Clicking a card opens its product
Labels: e2e
- **Given** the visible product "Chanel Gabrielle" on catalog page 1
- **When** the visitor clicks its card
- **Then** the address is `/products/chanel-gabrielle`
- **And** the page heading is "CHANEL GABRIELLE"

### Scenario: Whole price

#### Case: 40 dollars is shown as $40
Labels: automated
- **Given** a price of 40.00
- **When** it is formatted for display
- **Then** the text is "$40"

### Scenario: Price with cents

#### Case: 81.6 dollars is shown as $81.60
Labels: automated
- **Given** a price of 81.6
- **When** it is formatted for display
- **Then** the text is "$81.60"

#### Case: 92.4 dollars is shown as $92.40
Labels: automated
- **Given** a price of 92.4
- **When** it is formatted for display
- **Then** the text is "$92.40"

### Scenario: Price in thousands

#### Case: 1250 dollars is shown as $1,250
Labels: automated
- **Given** a price of 1250.00
- **When** it is formatted for display
- **Then** the text is "$1,250"

#### Case: 1250.5 dollars is shown as $1,250.50
Labels: automated
- **Given** a price of 1250.5
- **When** it is formatted for display
- **Then** the text is "$1,250.50"

#### Case: 999 dollars has no separator
Labels: automated
- **Given** a price of 999
- **When** it is formatted for display
- **Then** the text is "$999"

#### Case: 1000 dollars gets the separator
Labels: automated
- **Given** a price of 1000
- **When** it is formatted for display
- **Then** the text is "$1,000"

### Scenario: Go to the second page

#### Case: Page 2 of 20 products shows 4 cards
Labels: automated, e2e
- **Given** 20 visible products and a visitor on catalog page 1
- **When** the visitor clicks page number 2
- **Then** the page shows 4 product cards
- **And** the address contains `page=2`
- **And** page number 2 is marked as current

#### Case: 17 products give a second page with one card
Labels: automated, e2e
- **Given** 17 visible products
- **When** a visitor opens `/products` and clicks page number 2
- **Then** page numbers 1 and 2 are shown
- **And** page 2 shows exactly 1 product card

### Scenario: Single page has no page numbers

#### Case: Ten products show no page numbers
Labels: automated, e2e
- **Given** 10 visible products
- **When** a visitor opens the catalog
- **Then** 10 cards are shown
- **And** no page numbers are shown

#### Case: Exactly 16 products show no page numbers
Labels: automated
- **Given** 16 visible products
- **When** a visitor opens the catalog
- **Then** 16 cards are shown and no page numbers are shown

### Scenario: Page number beyond the last

#### Case: Page 99 shows the last page
Labels: automated, e2e
- **Given** 40 visible products
- **When** a visitor opens `/products?page=99`
- **Then** the page shows 8 product cards
- **And** page number 3 is marked as current

### Scenario: Catalog opens sorted by new

#### Case: Newest product first on open
Labels: automated, e2e
- **Given** products "Alpha" added 2026-10-01, "Bravo" added 2026-10-02 and "Charlie" added 2026-10-03
- **When** a visitor opens `/products`
- **Then** the cards are in the order "Charlie", "Bravo", "Alpha"
- **And** the "Sort by" menu shows "New"

### Scenario: Sort by price low to high

#### Case: Choosing price low to high
Labels: automated, e2e
- **Given** the catalog shows A at $50, B at $40 (sale from $60) and C at $45
- **When** the visitor opens "Sort by" and chooses "Price low to high"
- **Then** the cards are in the order B, C, A
- **And** the address contains `sort=price-asc`

### Scenario: Sort by price high to low

#### Case: Choosing price high to low
Labels: automated, e2e
- **Given** the catalog shows A at $50, B at $40 (sale from $60) and C at $45
- **When** the visitor chooses "Price high to low"
- **Then** the cards are in the order A, C, B
- **And** the address contains `sort=price-desc`

### Scenario: Changing the sort returns to page 1

#### Case: Sorting from page 2 goes to page 1
Labels: automated, e2e
- **Given** 20 visible products and a visitor on catalog page 2
- **When** the visitor chooses "Price low to high"
- **Then** page 1 is shown with 16 cards
- **And** the address has no `page=2`

### Scenario: Open the filter panel

#### Case: Filter panel shows only the Gender group
Labels: automated, e2e
- **Given** a visitor on the catalog
- **When** the visitor clicks "Filter"
- **Then** a panel opens with the expanded group "Gender" and the options "Men's perfumes", "Women's perfumes" and "Unisex perfumes"
- **And** no other group (Categories, Price, Brands, Scent Type, Season, Occasion, Bottle Size) is shown

### Scenario: Collapse and expand the Gender group

#### Case: Gender group collapses and expands
Labels: automated, e2e
- **Given** the open filter panel with the Gender group expanded
- **When** the visitor clicks "−" next to "Gender"
- **Then** the three gender options are hidden
- **And** after clicking "+" the three options are shown again

### Scenario: Close the panel with the cross

#### Case: Cross closes the panel without applying
Labels: automated, e2e
- **Given** the catalog shows 16 products of every gender and the filter panel is open
- **When** the visitor marks "Women's perfumes" and clicks the cross
- **Then** the panel closes
- **And** the catalog shows the same 16 products as before and the address has no gender

### Scenario: Marking a gender updates the count

#### Case: Marking women's shows the count 8
Labels: automated, e2e
- **Given** 8 women's, 6 men's and 2 unisex visible products and the open filter panel
- **When** the visitor marks "Women's perfumes"
- **Then** the button reads "See results (8)"
- **And** the cards behind the panel are unchanged

#### Case: Marking a gender with no products shows zero
Labels: automated, e2e
- **Given** 8 women's and 6 men's visible products and no unisex product, with the panel open
- **When** the visitor marks "Unisex perfumes"
- **Then** the button reads "See results (0)"

### Scenario: Count within the search results

#### Case: Count counts within the search
Labels: automated, e2e
- **Given** the catalog shows the results of `q=chanel`: "Chanel Gabrielle" (women's), "Chanel No. 5" (women's) and "Bleu de Chanel" (men's)
- **When** the visitor opens the panel and marks "Women's perfumes"
- **Then** the button reads "See results (2)"

### Scenario: Marking another gender replaces the mark

#### Case: Second mark replaces the first
Labels: automated, e2e
- **Given** 8 women's and 6 men's visible products and "Women's perfumes" marked in the open panel
- **When** the visitor marks "Men's perfumes"
- **Then** only "Men's perfumes" is marked
- **And** the button reads "See results (6)"

### Scenario: Apply the gender filter

#### Case: See results applies the women's filter
Labels: automated, e2e
- **Given** 8 women's, 6 men's and 2 unisex visible products and "Women's perfumes" marked in the open panel
- **When** the visitor clicks "See results (8)"
- **Then** the panel closes
- **And** the catalog shows exactly the 8 women's products
- **And** the address contains `gender=women`

#### Case: Applying the filter from page 2 shows page 1
Labels: automated, e2e
- **Given** 40 visible products, 20 of them women's, and the visitor on catalog page 2
- **When** the visitor marks "Women's perfumes" and clicks "See results (20)"
- **Then** page 1 of the women's products is shown with 16 cards

### Scenario: Clear the mark

#### Case: Clear removes the mark and shows the full count
Labels: automated, e2e
- **Given** 16 visible products in total, no search text, and "Women's perfumes" marked in the open panel
- **When** the visitor clicks "Clear"
- **Then** no gender is marked
- **And** the button reads "See results (16)"

#### Case: Clear within a search counts the search results
Labels: automated, e2e
- **Given** the catalog shows the 3 results of `q=chanel` and "Women's perfumes" is marked in the open panel
- **When** the visitor clicks "Clear"
- **Then** the button reads "See results (3)"

### Scenario: Clear an applied gender

#### Case: Clear and apply removes the gender
Labels: automated, e2e
- **Given** 8 women's, 6 men's and 2 unisex visible products and the catalog at `/products?gender=women` showing only the 8 women's products
- **When** the visitor opens the panel, clicks "Clear" and then "See results (16)"
- **Then** the catalog shows products of every gender
- **And** the address has no `gender`

### Scenario: Unapplied mark is dropped when the panel closes

#### Case: Reopened panel shows the applied state
Labels: automated, e2e
- **Given** the catalog with no gender applied and the panel open
- **When** the visitor marks "Women's perfumes", closes the panel with the cross and opens it again
- **Then** no gender is marked

#### Case: Reopened panel keeps the applied gender
Labels: automated
- **Given** the catalog at `/products?gender=men`
- **When** the visitor opens the panel, marks "Women's perfumes", closes it with the cross and opens it again
- **Then** "Men's perfumes" is marked

### Scenario: Count request fails

#### Case: Count request answers 500
Labels: automated, e2e
- **Given** 8 women's and 6 men's visible products, the count request answers with status 500, and the filter panel is open
- **When** the visitor marks "Women's perfumes"
- **Then** the button reads "See results" without a number and is active
- **And** the cards behind the panel are unchanged

#### Case: Count request fails with a network error
Labels: automated
- **Given** the backend cannot be reached when the count is requested, and the filter panel is open
- **When** the visitor marks "Men's perfumes" and clicks "See results"
- **Then** the catalog shows the error "Could not load products" with a "Retry" button

### Scenario: Shared address opens the same view

#### Case: Address with gender, sort and page
Labels: automated, e2e
- **Given** 20 visible men's products at different prices
- **When** a visitor opens `/products?gender=men&sort=price-desc&page=2`
- **Then** the catalog shows the 4 cheapest men's products, in descending price order
- **And** the "Sort by" menu shows "Price high to low" and page number 2 is current

### Scenario: Back button returns the previous view

#### Case: Back after applying a filter
Labels: e2e
- **Given** a visitor on `/products` with products of every gender
- **When** the visitor applies the women's filter and then clicks the browser's Back button
- **Then** the address is `/products` without `gender`
- **And** the catalog shows products of every gender

### Scenario: Unknown gender in the address is ignored

#### Case: Gender kids shows everything
Labels: automated, e2e
- **Given** visible men's, women's and unisex products
- **When** a visitor opens `/products?gender=kids`
- **Then** the catalog shows products of every gender
- **And** no error message is shown

### Scenario: Unknown sort in the address is ignored

#### Case: Sort rating falls back to New
Labels: automated, e2e
- **Given** products "Alpha", "Bravo" and "Charlie" added in that order
- **When** a visitor opens `/products?sort=rating`
- **Then** the cards are in the order "Charlie", "Bravo", "Alpha"
- **And** the "Sort by" menu shows "New"

### Scenario: Invalid page number in the address

#### Case: Pages 0, -1 and abc show page 1
Labels: automated, e2e
- **Given** 40 visible products
- **When** a visitor opens `/products?page=0`, then `/products?page=-1`, then `/products?page=abc`
- **Then** each time page 1 is shown with 16 cards and page number 1 marked current

### Scenario: Search results in the catalog

#### Case: Search chanel shows two cards
Labels: automated, e2e
- **Given** visible products "Chanel Gabrielle", "Chanel No. 5" and "Dior Sauvage"
- **When** a visitor opens `/products?q=chanel`
- **Then** the cards are "Chanel Gabrielle" and "Chanel No. 5"

#### Case: Empty search text shows the whole catalog
Labels: automated
- **Given** 20 visible products
- **When** a visitor opens `/products?q=`
- **Then** 16 cards are shown with page numbers 1 and 2

### Scenario: Gender filter on search results

#### Case: Men's filter on chanel results
Labels: automated, e2e
- **Given** the visitor is on `/products?q=chanel` showing "Chanel Gabrielle" (women's) and "Bleu de Chanel" (men's)
- **When** the visitor marks "Men's perfumes" and clicks "See results (1)"
- **Then** the only card is "Bleu de Chanel"
- **And** the address contains `q=chanel` and `gender=men`

### Scenario: No product matches

#### Case: Search zzz shows Nothing found
Labels: automated, e2e
- **Given** no visible product name contains "zzz"
- **When** a visitor opens `/products?q=zzz`
- **Then** the page shows "Nothing found" and the "Reset filters" button
- **And** no product card and no page numbers are shown

### Scenario: Reset filters

#### Case: Reset filters clears search and gender
Labels: automated, e2e
- **Given** a visitor on `/products?q=zzz&gender=unisex` showing "Nothing found", and 20 visible products in total
- **When** the visitor clicks "Reset filters"
- **Then** the catalog shows 16 cards of every gender
- **And** the address has no `q` and no `gender`

### Scenario: Catalog with no products

#### Case: Empty catalog shows Nothing found
Labels: automated, e2e
- **Given** no visible products
- **When** a visitor opens `/products`
- **Then** the page shows "Nothing found"
- **And** no product card is shown

### Scenario: Placeholders while loading

#### Case: Grey placeholders before the list arrives
Labels: automated, e2e
- **Given** the product list answer is delayed by 2 seconds
- **When** a visitor opens `/products`
- **Then** grey placeholder cards are shown and no product name is shown
- **And** after the answer arrives the placeholders are replaced by product cards

### Scenario: Error and retry

#### Case: Server error then successful retry
Labels: automated, e2e
- **Given** the product list answers with status 500
- **When** a visitor opens `/products`
- **Then** the page shows "Could not load products" and a "Retry" button
- **And** after the list answers normally again, clicking "Retry" shows the product cards

#### Case: Retry while the error persists
Labels: automated, e2e
- **Given** the product list keeps answering with status 500
- **When** the visitor clicks "Retry"
- **Then** "Could not load products" and the "Retry" button are shown again

### Scenario: Backend cannot be reached

#### Case: Network failure shows the error
Labels: automated, e2e
- **Given** requests to the product list fail with a network error (backend not reachable)
- **When** a visitor opens `/products`
- **Then** the page shows "Could not load products" and a "Retry" button

### Scenario: Catalog on a phone

#### Case: 375 px wide screen
Labels: e2e
- **Given** 20 visible products and a browser window 375 px wide
- **When** the visitor opens `/products`
- **Then** the page width does not exceed 375 px (no horizontal scrolling)
- **And** fewer than 4 cards are shown in the first row

#### Case: 1023 px uses the narrow layout and 1024 px the desktop layout
Labels: e2e
- **Given** 20 visible products
- **When** the visitor opens `/products` at 1023 px wide and then at 1024 px wide
- **Then** at 1023 px fewer than 4 cards are in the first row
- **And** at 1024 px 4 cards are in the first row

### Scenario: Filter panel on a phone

#### Case: Filter panel takes the full width
Labels: e2e
- **Given** a browser window 375 px wide on `/products`
- **When** the visitor opens the filter panel
- **Then** the panel is 375 px wide

### Scenario: Filter by keyboard only

#### Case: Keyboard-only filtering
Labels: e2e
- **Given** 8 women's and 6 men's visible products on `/products`
- **When** the visitor uses only Tab, Enter and Space to open "Filter", mark "Women's perfumes" and press "See results (8)"
- **Then** the catalog shows exactly the 8 women's products

### Scenario: Photo descriptions

#### Case: Card photo has the product name as its text
Labels: automated
- **Given** the visible product "Dior Sauvage"
- **When** the catalog shows its card
- **Then** the card photo's text description (alt text) is "Dior Sauvage"

### Scenario: Filter panel button labels

#### Case: Labels of the cross and the Gender toggle
Labels: automated
- **Given** the open filter panel with the Gender group expanded
- **When** the accessible names of its buttons are read
- **Then** the cross is "Close filters" and the Gender toggle is "Collapse Gender"
- **And** after the group is collapsed, its toggle is "Expand Gender"

## product-page

### Scenario: Product page opens

#### Case: Anonymous visitor opens a product page
Labels: automated, e2e
- **Given** the visible product "Chanel Gabrielle" and a visitor who is not signed in
- **When** the visitor opens `/products/chanel-gabrielle`
- **Then** the page heading is "CHANEL GABRIELLE"
- **And** the breadcrumbs read "Home page / Products / Chanel Gabrielle"

### Scenario: Breadcrumb to the catalog

#### Case: Products breadcrumb opens the catalog
Labels: e2e
- **Given** a visitor on `/products/chanel-gabrielle`
- **When** the visitor clicks "Products" in the breadcrumbs
- **Then** the address is `/products` and the heading "PRODUCTS" is shown

### Scenario: Breadcrumb to the start page

#### Case: Home page breadcrumb opens the start page
Labels: e2e
- **Given** a visitor on `/products/chanel-gabrielle`
- **When** the visitor clicks "Home page" in the breadcrumbs
- **Then** the address is `/`

### Scenario: Descriptor line shown

#### Case: Descriptor line under the name
Labels: automated, e2e
- **Given** "Chanel Gabrielle" with the descriptor line "Edp | Floral | Gourmand"
- **When** a visitor opens its page
- **Then** "Edp | Floral | Gourmand" is shown under the product name

### Scenario: No descriptor line

#### Case: No descriptor text without a descriptor line
Labels: automated
- **Given** "Creed Aventus" with an empty descriptor line
- **When** a visitor opens its page
- **Then** no descriptor text is shown under the product name and no empty separator such as "|" is shown

### Scenario: Thumbnail shows its photo

#### Case: Third thumbnail shows the third photo
Labels: automated, e2e
- **Given** "Chanel Gabrielle" with 4 photos and the first photo shown large
- **When** the visitor clicks the third thumbnail
- **Then** the third photo is shown large

### Scenario: Arrows move between photos

#### Case: Forward twice then back once
Labels: automated, e2e
- **Given** "Chanel Gabrielle" with 4 photos and the first photo shown large
- **When** the visitor clicks "→" twice
- **Then** the third photo is shown large
- **And** after clicking "←" once the second photo is shown large

### Scenario: Arrows at the ends

#### Case: Arrows inactive at first and last photo
Labels: automated, e2e
- **Given** "Chanel Gabrielle" with 4 photos and the first photo shown large
- **When** the visitor looks at the arrows, then clicks "→" three times
- **Then** at the first photo "←" is inactive and "→" is active
- **And** at the fourth photo "→" is inactive and "←" is active

### Scenario: Product with one photo

#### Case: Single photo disables both arrows
Labels: automated
- **Given** "Creed Aventus" with exactly one photo
- **When** a visitor opens its page
- **Then** both "←" and "→" are inactive
- **And** one thumbnail is shown

### Scenario: Rating 4.5

#### Case: Rating 4.5 shows four and a half stars
Labels: automated
- **Given** a product with rating 4.5
- **When** a visitor opens its page
- **Then** 4 filled stars and 1 half-filled star are shown

#### Case: Rating 0 shows five empty stars
Labels: automated
- **Given** a product with rating 0
- **When** a visitor opens its page
- **Then** 5 empty stars are shown

#### Case: Rating 5 shows five filled stars
Labels: automated
- **Given** a product with rating 5
- **When** a visitor opens its page
- **Then** 5 filled stars are shown

### Scenario: No rating

#### Case: Product without rating shows no stars
Labels: automated
- **Given** a product whose rating is not set
- **When** a visitor opens its page
- **Then** no stars are shown

### Scenario: Default size chosen on open

#### Case: Default 30 ml chosen with its price
Labels: automated, e2e
- **Given** a product with sizes 15 ml at $20, 30 ml at $40 (default) and 50 ml at $80
- **When** a visitor opens its page
- **Then** the "Size" block shows "15 ml $20", "30 ml $40" and "50 ml $80"
- **And** 30 ml is marked as chosen and the price at the top is "$40"

### Scenario: Choosing another size changes the price

#### Case: Choosing 50 ml shows $80
Labels: automated, e2e
- **Given** the page of a product with sizes 15 ml at $20, 30 ml at $40 (default, chosen) and 50 ml at $80
- **When** the visitor chooses 50 ml
- **Then** 50 ml is marked as chosen and 30 ml is not
- **And** the price at the top is "$80"

### Scenario: Chosen size with a discount

#### Case: Discounted size shows the struck regular price
Labels: automated, e2e
- **Given** a product with sizes 15 ml at $20 (default) and 30 ml at $60 with sale price $40
- **When** the visitor chooses 30 ml
- **Then** the price at the top is "$40" with "$60" struck out next to it

#### Case: Switching to a size without discount removes the struck price
Labels: automated
- **Given** the same product with 30 ml chosen showing "$40" and "$60" struck out
- **When** the visitor chooses 15 ml
- **Then** the price at the top is "$20" and no struck-out price is shown

### Scenario: Quantity starts at 1

#### Case: Quantity 1 and minus inactive on open
Labels: automated, e2e
- **Given** the visible product "Chanel Gabrielle"
- **When** a visitor opens its page
- **Then** the quantity is 1
- **And** "−" is inactive and "+" is active

### Scenario: Raise and lower the quantity

#### Case: Plus twice and minus once gives 2
Labels: automated, e2e
- **Given** a product page with quantity 1
- **When** the visitor clicks "+" twice and "−" once
- **Then** the quantity is 2

### Scenario: Quantity stops at 10

#### Case: Plus is inactive at 10
Labels: automated, e2e
- **Given** a product page with quantity 1
- **When** the visitor clicks "+" nine times
- **Then** the quantity is 10 and "+" is inactive
- **And** one more click on "+" leaves the quantity at 10

### Scenario: Confirmation after adding

#### Case: Added to basket shown for 3 seconds and quantity reset
Labels: automated, e2e
- **Given** an empty basket and the page of "Chanel Gabrielle" with 30 ml chosen
- **When** the visitor sets the quantity to 3 and clicks "Add to basket"
- **Then** "Added to basket" is shown under the button and the quantity shows 1
- **And** 3 seconds later "Added to basket" is no longer shown

#### Case: Adding twice quickly
Labels: automated
- **Given** an empty basket and the page of "Chanel Gabrielle" with 30 ml chosen and quantity 1
- **When** the visitor clicks "Add to basket" twice within one second
- **Then** the basket holds "Chanel Gabrielle" 30 ml × 2
- **And** "Added to basket" is shown under the button

### Scenario: Capped add shows only the limit message

#### Case: Adding 5 to 8 shows the limit message
Labels: automated, e2e
- **Given** the basket holds "Chanel Gabrielle" 30 ml × 8 and the visitor is on its page with 30 ml chosen
- **When** the visitor sets the quantity to 5 and clicks "Add to basket"
- **Then** "You can add at most 10 of one product" is shown under the button
- **And** "Added to basket" is not shown and the basket line holds 10

### Scenario: Choosing a size keeps the quantity

#### Case: Quantity 4 survives a size change
Labels: automated
- **Given** a product page with 30 ml chosen and quantity 4
- **When** the visitor chooses 50 ml
- **Then** the quantity is still 4

### Scenario: Add the chosen size and quantity

#### Case: Add 50 ml times 2 to an empty basket
Labels: automated, e2e
- **Given** an empty basket and the page of "Chanel Gabrielle" with sizes 15, 30 (default) and 50 ml
- **When** the visitor chooses 50 ml, sets the quantity to 2 and clicks "Add to basket"
- **Then** the basket holds one line: "Chanel Gabrielle", 50 ml, quantity 2
- **And** the basket counter in the header shows 2

### Scenario: Add to the wishlist

#### Case: Heart adds the product
Labels: automated, e2e
- **Given** an empty wishlist and the page of "Chanel Gabrielle"
- **When** the visitor clicks the heart next to "Add to basket"
- **Then** the heart is shown filled
- **And** the wishlist page lists "Chanel Gabrielle"

### Scenario: Remove from the wishlist

#### Case: Filled heart removes the product
Labels: automated, e2e
- **Given** the wishlist holds "Chanel Gabrielle" and the visitor is on its page
- **When** the visitor clicks the filled heart
- **Then** the heart is shown empty
- **And** the wishlist page no longer lists "Chanel Gabrielle"

### Scenario: Blocks on open

#### Case: Four blocks expanded and two collapsed
Labels: automated
- **Given** "Chanel Gabrielle" with a description, notes and ingredients
- **When** a visitor opens its page
- **Then** "Size", "Product description", "Notes" and "Ingredients" are expanded
- **And** "Shipping & handling" and "Questions" are collapsed

### Scenario: Notes are shown

#### Case: Three note groups with their texts
Labels: automated
- **Given** "Chanel Gabrielle" with top notes "African Marigold, Bergamot, Buchu", heart notes "Cyclamen, Violet" and base notes "Cedarwood, Vetiver"
- **When** a visitor opens its page
- **Then** the "Notes" block shows "Top notes" with "African Marigold, Bergamot, Buchu", "Heart notes" with "Cyclamen, Violet" and "Base notes" with "Cedarwood, Vetiver"

### Scenario: Collapse a block

#### Case: Ingredients collapse and expand
Labels: automated, e2e
- **Given** a product page with "Ingredients" expanded and the text "Alcohol, Parfum (Fragrance), Aqua (Water)"
- **When** the visitor clicks "−" next to "Ingredients"
- **Then** the ingredients text is hidden
- **And** after clicking "+" the text "Alcohol, Parfum (Fragrance), Aqua (Water)" is shown again

### Scenario: Collapse the description and the notes

#### Case: Description and notes collapse and expand
Labels: automated, e2e
- **Given** a product page with "Product description" and "Notes" expanded
- **When** the visitor clicks "−" next to "Product description" and "−" next to "Notes"
- **Then** the description text and the three note groups are hidden
- **And** after clicking "+" next to each, both are shown again

### Scenario: Expand the shared questions text

#### Case: Questions block shows the shared text
Labels: automated, e2e
- **Given** the shared "Questions" text "How long does a scent last? Up to 8 hours." and a product page with "Questions" collapsed
- **When** the visitor clicks "+" next to "Questions"
- **Then** the block shows "How long does a scent last? Up to 8 hours."

### Scenario: Expand the shared shipping text

#### Case: Shipping block shows the shared text
Labels: automated, e2e
- **Given** the shared "Shipping & handling" text "Free delivery over $100" and a product page with that block collapsed
- **When** the visitor clicks "+" next to "Shipping & handling"
- **Then** the block shows "Free delivery over $100"

### Scenario: Collapse the Size block

#### Case: Size block collapses and keeps the choice
Labels: automated, e2e
- **Given** a product page with 50 ml chosen in the expanded "Size" block
- **When** the visitor clicks "−" next to "Size" and then "+"
- **Then** after "−" the size options are hidden
- **And** after "+" they are shown with 50 ml still chosen

### Scenario: Related products shown

#### Case: Four related women's cards
Labels: automated, e2e
- **Given** 6 visible women's products including "Chanel Gabrielle"
- **When** a visitor opens the page of "Chanel Gabrielle"
- **Then** "YOU MAY ALSO LIKE" shows 4 cards of women's products
- **And** none of them is "Chanel Gabrielle"

### Scenario: Related card opens its product

#### Case: Clicking a related card
Labels: e2e
- **Given** the page of "Chanel Gabrielle" showing "YSL Libre" under "YOU MAY ALSO LIKE"
- **When** the visitor clicks the "YSL Libre" card
- **Then** the address is `/products/ysl-libre` and the heading is "YSL LIBRE"

### Scenario: No related products

#### Case: Only men's product shows no block
Labels: automated
- **Given** "Creed Aventus" is the only visible men's product
- **When** a visitor opens its page
- **Then** no "YOU MAY ALSO LIKE" heading and no related cards are shown

### Scenario: Unknown product address

#### Case: Unknown product shows Page not found
Labels: automated, e2e
- **Given** no product `no-such-perfume`
- **When** a visitor opens `/products/no-such-perfume`
- **Then** the response status is 404
- **And** the page shows "Page not found" and the link "Back to catalog"

### Scenario: Other unknown address

#### Case: Unknown site address shows Page not found
Labels: automated, e2e
- **Given** the website is running
- **When** a visitor opens `/no-such-page`
- **Then** the response status is 404
- **And** the page shows "Page not found", the shop header and footer, and the link "Back to catalog"

### Scenario: Back to catalog link

#### Case: Back to catalog opens the catalog
Labels: e2e
- **Given** a visitor on the "Page not found" page at `/no-such-page`
- **When** the visitor clicks "Back to catalog"
- **Then** the address is `/products`

### Scenario: Hidden product address

#### Case: Hidden product shows Page not found
Labels: automated, e2e
- **Given** "Chanel Gabrielle" with "show on site" off
- **When** a visitor opens `/products/chanel-gabrielle`
- **Then** the response status is 404
- **And** the page shows "Page not found"

### Scenario: Placeholders while loading

#### Case: Grey placeholders before the product arrives
Labels: automated, e2e
- **Given** the product detail answer is delayed by 2 seconds
- **When** a visitor opens `/products/chanel-gabrielle`
- **Then** grey placeholders are shown instead of the photo, the name and the price
- **And** after the answer arrives the product name "CHANEL GABRIELLE" is shown

### Scenario: Error and retry

#### Case: Server error then successful retry
Labels: automated, e2e
- **Given** the product detail answers with status 500
- **When** a visitor opens `/products/chanel-gabrielle`
- **Then** the page shows "Could not load the product" and a "Retry" button
- **And** after the detail answers normally again, clicking "Retry" shows "CHANEL GABRIELLE"

### Scenario: Backend cannot be reached

#### Case: Network failure shows the product error
Labels: automated, e2e
- **Given** requests to the product detail fail with a network error
- **When** a visitor opens `/products/chanel-gabrielle`
- **Then** the page shows "Could not load the product" and a "Retry" button

### Scenario: Product page on a phone

#### Case: 375 px product page
Labels: e2e
- **Given** a browser window 375 px wide
- **When** a visitor opens `/products/chanel-gabrielle`
- **Then** the page width does not exceed 375 px (no horizontal scrolling)
- **And** "Add to basket" lies fully within the 375 px width

### Scenario: Add to basket by keyboard only

#### Case: Keyboard-only add to basket
Labels: e2e
- **Given** an empty basket and the page of "Chanel Gabrielle" with 30 ml chosen
- **When** the visitor uses only Tab, Enter and Space to choose 50 ml, press "Increase quantity" once and press "Add to basket"
- **Then** the basket holds "Chanel Gabrielle" 50 ml × 2

### Scenario: Icon buttons have labels

#### Case: Accessible names of the icon buttons
Labels: automated
- **Given** the page of a product that is not in the wishlist
- **When** the accessible names of its buttons are read
- **Then** they include "Add to wishlist", "Previous photo", "Next photo", "Decrease quantity" and "Increase quantity"

### Scenario: Filled heart label

#### Case: Filled heart is labelled Remove from wishlist
Labels: automated
- **Given** the page of a product that is in the wishlist
- **When** the accessible name of the heart button is read
- **Then** it is "Remove from wishlist"

## basket

### Scenario: Basket survives a reload

#### Case: Basket line survives a reload
Labels: automated, e2e
- **Given** an empty basket
- **When** the visitor adds "Chanel Gabrielle" 50 ml × 2 and reloads the page
- **Then** the basket still holds "Chanel Gabrielle" 50 ml × 2
- **And** the header counter shows 2

#### Case: Basket survives closing the tab
Labels: e2e
- **Given** the basket holds "Dior Sauvage" 100 ml × 1
- **When** the visitor closes the tab and opens `/basket` in a new tab of the same browser
- **Then** the basket page shows "Dior Sauvage" 100 ml × 1

### Scenario: Add a new line

#### Case: Different size makes a second line
Labels: automated
- **Given** the basket holds "Chanel Gabrielle" 30 ml × 1
- **When** the visitor adds "Chanel Gabrielle" 50 ml × 1
- **Then** the basket holds two lines: 30 ml × 1 and 50 ml × 1

### Scenario: Same product and size adds to the line

#### Case: Same size adds to the quantity
Labels: automated
- **Given** the basket holds "Chanel Gabrielle" 30 ml × 2
- **When** the visitor adds "Chanel Gabrielle" 30 ml × 3
- **Then** the basket holds one line "Chanel Gabrielle" 30 ml × 5

### Scenario: Sum over 10 is capped

#### Case: 8 plus 5 is capped at 10
Labels: automated, e2e
- **Given** the basket holds "Chanel Gabrielle" 30 ml × 8
- **When** the visitor adds "Chanel Gabrielle" 30 ml × 5 on its product page
- **Then** the line holds 10
- **And** "You can add at most 10 of one product" is shown under "Add to basket"

#### Case: Adding to a full line keeps 10
Labels: automated
- **Given** the basket holds "Chanel Gabrielle" 30 ml × 10
- **When** the visitor adds "Chanel Gabrielle" 30 ml × 1
- **Then** the line still holds 10
- **And** "You can add at most 10 of one product" is shown

### Scenario: Limit message disappears on the next action

#### Case: Choosing another size hides the limit message
Labels: automated
- **Given** the limit message is shown under "Add to basket" on the page of "Chanel Gabrielle"
- **When** the visitor chooses 50 ml
- **Then** the limit message is no longer shown

### Scenario: Exactly 10 is not capped

#### Case: 7 plus 3 gives 10 without a message
Labels: automated
- **Given** the basket holds "Chanel Gabrielle" 30 ml × 7
- **When** the visitor adds "Chanel Gabrielle" 30 ml × 3
- **Then** the line holds 10
- **And** no message about the limit is shown and "Added to basket" is shown

### Scenario: Blocked storage keeps the basket in memory

#### Case: Blocked storage still adds to the basket
Labels: automated, e2e
- **Given** a browser that blocks saving data and an empty basket
- **When** the visitor adds "Chanel Gabrielle" 30 ml × 1 on its product page and opens `/basket` through the header basket icon
- **Then** the message "Your choices will not be saved after you close this page" was shown after adding
- **And** the header counter shows 1 and the basket page shows "Chanel Gabrielle" 30 ml × 1

#### Case: Full storage behaves like blocked storage
Labels: automated
- **Given** a browser whose storage is full, so every write fails, and the basket holds nothing
- **When** the visitor adds "Dior Sauvage" 100 ml × 2
- **Then** the header counter shows 2 and the message "Your choices will not be saved after you close this page" is shown

### Scenario: Counter shows the sum of quantities

#### Case: Counter shows units across lines
Labels: automated, e2e
- **Given** the basket holds "Chanel Gabrielle" 30 ml × 2 and "Dior Sauvage" 100 ml × 1
- **When** the visitor opens the catalog
- **Then** the basket icon in the header shows 3

### Scenario: Counter updates after adding

#### Case: Counter goes from 3 to 5 without reload
Labels: automated, e2e
- **Given** the header counter shows 3 and the visitor is on the page of "Creed Aventus"
- **When** the visitor adds "Creed Aventus" with quantity 2
- **Then** the counter shows 5 without a page reload

### Scenario: Basket page lists the lines and the total

#### Case: Two lines and the total
Labels: automated, e2e
- **Given** the basket holds "Chanel Gabrielle" 30 ml × 2 at $40 and "Creed Aventus" 50 ml × 1 at $150
- **When** the visitor clicks the basket icon in the header
- **Then** the page `/basket` shows both lines with photo, name, size, quantity, unit price and line totals "$80" and "$150"
- **And** the total is "$230"
- **And** there is no checkout button

### Scenario: Total with cents

#### Case: Three at 81.60 gives 244.80
Labels: automated
- **Given** the basket holds "Burberry Goddess" 100 ml × 3 at $81.60
- **When** the visitor opens the basket page
- **Then** the line total is "$244.80" and the total is "$244.80"

#### Case: Total in thousands
Labels: automated
- **Given** the basket holds "Versace Dylan Blue" 100 ml × 4 at $400
- **When** the visitor opens the basket page
- **Then** the total is "$1,600"

### Scenario: Line name opens the product

#### Case: Clicking a line name
Labels: e2e
- **Given** the basket page shows the line "Creed Aventus" 50 ml × 1
- **When** the visitor clicks "Creed Aventus"
- **Then** the address is `/products/creed-aventus`

### Scenario: Raise a line quantity

#### Case: Plus on a line updates all totals
Labels: automated, e2e
- **Given** the basket page shows "Chanel Gabrielle" 30 ml × 2 at $40 and "Creed Aventus" 50 ml × 1 at $150, total "$230", counter 3
- **When** the visitor clicks "+" on the "Chanel Gabrielle" line
- **Then** the line shows quantity 3 and line total "$120"
- **And** the total is "$270" and the header counter shows 4

#### Case: Minus on a line updates all totals
Labels: automated
- **Given** the same basket with "Chanel Gabrielle" 30 ml × 3
- **When** the visitor clicks "−" on that line
- **Then** the line shows quantity 2 and line total "$80"

### Scenario: Quantity limits on the basket page

#### Case: Minus inactive at 1 and plus inactive at 10
Labels: automated
- **Given** the basket page shows a line with quantity 1 and another with quantity 10
- **When** the visitor looks at their buttons and clicks the inactive ones
- **Then** the first line's "−" is inactive and its quantity stays 1
- **And** the second line's "+" is inactive and its quantity stays 10

### Scenario: Remove a line

#### Case: Removing one of two lines
Labels: automated, e2e
- **Given** the basket page shows "Chanel Gabrielle" 30 ml × 2 at $40 and "Creed Aventus" 50 ml × 1 at $150
- **When** the visitor clicks the remove button of "Chanel Gabrielle"
- **Then** only "Creed Aventus" is shown
- **And** the total is "$150" and the header counter shows 1

### Scenario: Price changed after adding

#### Case: Basket shows the new sale price
Labels: automated, e2e
- **Given** the visitor added "Chanel Gabrielle" 30 ml × 1 while it cost $40
- **When** an admin user changes the 30 ml sale price to $35 and the visitor opens the basket page
- **Then** the line shows the unit price "$35" and the total "$35"

### Scenario: Failed check removes nothing

#### Case: Unreachable backend keeps the basket
Labels: automated, e2e
- **Given** the basket holds "Chanel Gabrielle" 30 ml × 1 and "Dior Sauvage" 100 ml × 1, and the availability check fails with a network error
- **When** the visitor opens the page of "Dior Sauvage"
- **Then** both lines stay in the basket and the header counter shows 2
- **And** no message about unavailable products is shown
- **And** when the backend answers again and the visitor opens the catalog, the check is sent again

### Scenario: Hidden product removed from the basket

#### Case: Hidden product disappears from the basket page
Labels: automated, e2e
- **Given** the basket holds "Chanel Gabrielle" 30 ml × 1 and "Dior Sauvage" 100 ml × 1
- **When** an admin user turns "show on site" off for "Chanel Gabrielle" and the visitor opens the basket page
- **Then** only "Dior Sauvage" 100 ml is shown
- **And** the message "Some products are no longer available and were removed" is shown

### Scenario: Deleted size removed from the basket

#### Case: Deleted size noticed on the catalog
Labels: automated, e2e
- **Given** the basket holds "Chanel Gabrielle" 15 ml × 2 and "Dior Sauvage" 100 ml × 1, counter 3
- **When** an admin user deletes the 15 ml size of "Chanel Gabrielle" and the visitor opens the catalog
- **Then** the message "Some products are no longer available and were removed" is shown
- **And** the header counter shows 1

#### Case: Deleted product removed from the basket
Labels: automated, e2e
- **Given** the basket holds "Creed Aventus" 50 ml × 1 and "Dior Sauvage" 100 ml × 1
- **When** an admin user deletes "Creed Aventus" and the visitor opens the basket page
- **Then** only "Dior Sauvage" 100 ml is shown
- **And** the message "Some products are no longer available and were removed" is shown

### Scenario: Start page does not check the basket

#### Case: Start page makes no backend call
Labels: e2e
- **Given** the basket holds "Chanel Gabrielle" 30 ml × 1, which an admin user has hidden
- **When** the visitor opens `/`
- **Then** no message about unavailable products is shown
- **And** the browser sends no request to the backend address

### Scenario: One message for basket and wishlist

#### Case: One message when both lose the same product
Labels: automated, e2e
- **Given** "Chanel Gabrielle" is in the basket (30 ml × 1) and in the wishlist
- **When** an admin user hides "Chanel Gabrielle" and the visitor opens the catalog
- **Then** "Some products are no longer available and were removed" is shown exactly once
- **And** "Chanel Gabrielle" is in neither the basket nor the wishlist

### Scenario: Placeholders while the basket loads

#### Case: Two grey lines while prices load
Labels: automated
- **Given** the basket holds two lines and the availability answer is delayed by 2 seconds
- **When** the visitor opens `/basket`
- **Then** two grey placeholder lines are shown
- **And** after the answer arrives, the two lines with prices are shown

### Scenario: Basket error and retry

#### Case: Basket error then retry
Labels: automated, e2e
- **Given** the basket holds "Dior Sauvage" 100 ml × 1 and the backend cannot be reached
- **When** the visitor opens `/basket`
- **Then** the page shows "Could not load the basket" and a "Retry" button
- **And** after the backend answers again, clicking "Retry" shows "Dior Sauvage" with its price

#### Case: Basket answer with status 500
Labels: automated
- **Given** the basket holds one line and the availability check answers with status 500
- **When** the visitor opens `/basket`
- **Then** the page shows "Could not load the basket" and a "Retry" button
- **And** the basket line is not removed

### Scenario: Empty basket page

#### Case: Empty basket message and link
Labels: automated, e2e
- **Given** an empty basket
- **When** the visitor opens `/basket`
- **Then** the page shows "Your basket is empty" and a link to the catalog
- **And** clicking the link opens `/products`

### Scenario: Last line removed

#### Case: Removing the last line empties the basket
Labels: automated, e2e
- **Given** the basket holds only "Creed Aventus" 50 ml × 1
- **When** the visitor removes it on the basket page
- **Then** the page shows "Your basket is empty"
- **And** the header basket icon shows no number

### Scenario: Basket button labels

#### Case: Accessible names on a basket line
Labels: automated
- **Given** the basket page shows one line
- **When** the accessible names of the line's buttons are read
- **Then** they are "Decrease quantity", "Increase quantity" and "Remove from basket"
- **And** the line photo's text description is the product name

### Scenario: Remove a line by keyboard only

#### Case: Keyboard-only removal
Labels: e2e
- **Given** the basket page shows "Creed Aventus" 50 ml × 1 and "Dior Sauvage" 100 ml × 1
- **When** the visitor uses only Tab and Enter to reach and press "Remove from basket" on "Creed Aventus"
- **Then** only "Dior Sauvage" is shown

## wishlist

### Scenario: Wishlist survives a reload

#### Case: Wishlist survives a reload
Labels: automated, e2e
- **Given** an empty wishlist and the page of "Chanel Gabrielle"
- **When** the visitor clicks the heart and reloads the page
- **Then** "Chanel Gabrielle" is still in the wishlist
- **And** the heart on its product page is shown filled

#### Case: Product is held once
Labels: automated, e2e
- **Given** an empty wishlist and the page of "Chanel Gabrielle" open in two tabs of the same browser, both showing an empty heart
- **When** the visitor clicks the heart in the first tab and then the heart in the second tab
- **Then** `/wishlist` shows the card of "Chanel Gabrielle" exactly once

### Scenario: Blocked storage keeps the wishlist in memory

#### Case: Blocked storage still adds to the wishlist
Labels: automated, e2e
- **Given** a browser that blocks saving data and an empty wishlist
- **When** the visitor clicks the heart on the page of "Chanel Gabrielle" and opens `/wishlist` through the header heart icon
- **Then** the heart was shown filled and the message "Your choices will not be saved after you close this page" was shown
- **And** the wishlist page shows the card of "Chanel Gabrielle"

### Scenario: Wishlist page shows the products

#### Case: Header heart opens the wishlist with two cards
Labels: automated, e2e
- **Given** the wishlist holds "Chanel Gabrielle" and "Dior Sauvage"
- **When** the visitor clicks the heart icon in the header
- **Then** the address is `/wishlist`
- **And** the page shows the cards of "Chanel Gabrielle" and "Dior Sauvage" with their photos and prices

### Scenario: Wishlist card opens the product

#### Case: Clicking a wishlist card
Labels: e2e
- **Given** the wishlist page shows the card of "Dior Sauvage"
- **When** the visitor clicks it
- **Then** the address is `/products/dior-sauvage`

### Scenario: Removed product leaves the wishlist page

#### Case: Removed on the product page, gone from the wishlist page
Labels: automated, e2e
- **Given** the wishlist holds "Chanel Gabrielle" and "Dior Sauvage"
- **When** the visitor clicks the filled heart on the page of "Dior Sauvage" and opens `/wishlist`
- **Then** only the card of "Chanel Gabrielle" is shown

### Scenario: Failed check keeps the wishlist

#### Case: Unreachable backend keeps the wishlist
Labels: automated, e2e
- **Given** the wishlist holds "Chanel Gabrielle" and "Dior Sauvage" and the availability check fails with a network error
- **When** the visitor opens the catalog
- **Then** both products stay in the wishlist
- **And** no message about unavailable products is shown

### Scenario: Hidden product removed from the wishlist

#### Case: Hidden product disappears from the wishlist page
Labels: automated, e2e
- **Given** the wishlist holds "Chanel Gabrielle" and "Dior Sauvage"
- **When** an admin user turns "show on site" off for "Chanel Gabrielle" and the visitor opens `/wishlist`
- **Then** only the card of "Dior Sauvage" is shown
- **And** the message "Some products are no longer available and were removed" is shown

### Scenario: Deleted product removed from the wishlist

#### Case: Deleted product noticed on the catalog
Labels: automated, e2e
- **Given** the wishlist holds "Creed Aventus"
- **When** an admin user deletes "Creed Aventus" and the visitor opens the catalog
- **Then** the message "Some products are no longer available and were removed" is shown
- **And** `/wishlist` then shows "Your wishlist is empty"

### Scenario: Empty wishlist page

#### Case: Empty wishlist message and link
Labels: automated, e2e
- **Given** an empty wishlist
- **When** the visitor opens `/wishlist`
- **Then** the page shows "Your wishlist is empty" and a link to the catalog
- **And** clicking the link opens `/products`

### Scenario: Placeholders while the wishlist loads

#### Case: Two grey cards while loading
Labels: automated
- **Given** the wishlist holds two products and the answer is delayed by 2 seconds
- **When** the visitor opens `/wishlist`
- **Then** two grey placeholder cards are shown
- **And** after the answer arrives, the two product cards are shown

### Scenario: Wishlist error and retry

#### Case: Wishlist error then retry
Labels: automated, e2e
- **Given** the wishlist holds "Dior Sauvage" and the backend cannot be reached
- **When** the visitor opens `/wishlist`
- **Then** the page shows "Could not load the wishlist" and a "Retry" button
- **And** after the backend answers again, clicking "Retry" shows the "Dior Sauvage" card

#### Case: Wishlist answer with status 500
Labels: automated
- **Given** the wishlist holds "Dior Sauvage" and the availability check answers with status 500
- **When** the visitor opens `/wishlist`
- **Then** the page shows "Could not load the wishlist" and a "Retry" button
- **And** "Dior Sauvage" is not removed from the wishlist

### Scenario: Wishlist card photo description

#### Case: Wishlist card photo text
Labels: automated
- **Given** the wishlist holds "Dior Sauvage"
- **When** the wishlist page shows its card
- **Then** the card photo's text description is "Dior Sauvage"

### Scenario: Open a wishlist card by keyboard only

#### Case: Keyboard-only open of a wishlist card
Labels: e2e
- **Given** the wishlist page shows the card of "Dior Sauvage"
- **When** the visitor uses only Tab and Enter to reach and open it
- **Then** the address is `/products/dior-sauvage`

## site-navigation

### Scenario: Header and footer on the shop pages

#### Case: Header and footer on five pages
Labels: e2e
- **Given** a visible product "Chanel Gabrielle"
- **When** the visitor opens `/products`, `/products/chanel-gabrielle`, `/basket`, `/wishlist` and `/no-such-page` in turn
- **Then** each page shows the header with the "Lunisse" logo and the footer

### Scenario: Start page unchanged

#### Case: Start page has no shop header
Labels: automated, e2e
- **Given** the website is running
- **When** a visitor opens `/`
- **Then** the page shows exactly one `h1` and no shop header and no shop footer

### Scenario: Header logo

#### Case: Header logo opens the start page
Labels: e2e
- **Given** a visitor on `/products`
- **When** the visitor clicks the "Lunisse" logo in the header
- **Then** the address is `/`

### Scenario: Footer logo

#### Case: Footer logo opens the start page
Labels: e2e
- **Given** a visitor on `/products/chanel-gabrielle`
- **When** the visitor clicks the "Lunisse" logo in the footer
- **Then** the address is `/`

### Scenario: Perfumes opens the whole catalog

#### Case: Perfumes from the women's catalog
Labels: automated, e2e
- **Given** a visitor on `/products?gender=women` and visible products of every gender
- **When** the visitor clicks "Perfumes" under the header
- **Then** the address is `/products`
- **And** the catalog shows products of every gender

### Scenario: Category link clears the search and the sort

#### Case: Women's link resets search, sort and page
Labels: automated, e2e
- **Given** a visitor on `/products?q=chanel&sort=price-asc&page=2`
- **When** the visitor clicks "Women's perfumes" under the header
- **Then** the address is `/products?gender=women`
- **And** the catalog shows page 1 of all women's products sorted by "New"

### Scenario: Women's perfumes opens the filtered catalog

#### Case: Women's link from a product page
Labels: automated, e2e
- **Given** a visitor on `/products/creed-aventus`
- **When** the visitor clicks "Women's perfumes" under the header
- **Then** the catalog shows only women's products
- **And** when the filter panel is opened, "Women's perfumes" is marked

#### Case: Men's and unisex links
Labels: automated, e2e
- **Given** a visitor on `/products`
- **When** the visitor clicks "Men's perfumes", and then "Unisex perfumes"
- **Then** the address is first `/products?gender=men` and then `/products?gender=unisex`

### Scenario: Search from the header

#### Case: Search chanel from a product page
Labels: automated, e2e
- **Given** visible products "Chanel Gabrielle", "Chanel No. 5" and "Dior Sauvage", and a visitor on `/products/dior-sauvage`
- **When** the visitor clicks the search icon, types `chanel` and presses Enter
- **Then** the address is `/products?q=chanel`
- **And** the catalog shows "Chanel Gabrielle" and "Chanel No. 5" only

#### Case: Search text with capitals
Labels: automated, e2e
- **Given** the visible product "Bleu de Chanel"
- **When** the visitor searches `BLEU de` from the header
- **Then** the catalog shows "Bleu de Chanel"

### Scenario: Search keeps the gender and the sort

#### Case: Search on women's sorted by price
Labels: automated, e2e
- **Given** a visitor on `/products?gender=women&sort=price-asc&page=2`
- **When** the visitor searches `chanel` from the header
- **Then** the catalog shows page 1 of women's products whose name contains "chanel", by price low to high
- **And** the address contains `gender=women`, `sort=price-asc` and `q=chanel` and no `page=2`

### Scenario: Empty search from the header

#### Case: Enter on an empty field
Labels: automated
- **Given** 20 visible products and a visitor on a product page
- **When** the visitor clicks the search icon and presses Enter with an empty field
- **Then** the catalog opens showing 16 cards with page numbers 1 and 2

### Scenario: Basket icon opens the basket

#### Case: Basket icon from the catalog
Labels: e2e
- **Given** a visitor on `/products`
- **When** the visitor clicks the basket icon in the header
- **Then** the address is `/basket`

### Scenario: Heart icon opens the wishlist

#### Case: Heart icon from a product page
Labels: e2e
- **Given** a visitor on `/products/chanel-gabrielle`
- **When** the visitor clicks the heart icon in the header
- **Then** the address is `/wishlist`

### Scenario: Profile icon does nothing

#### Case: Profile icon click changes nothing
Labels: automated
- **Given** a visitor on `/products?gender=women`
- **When** the visitor clicks the profile icon
- **Then** the address is still `/products?gender=women`
- **And** the same product cards are shown and no dialog opens

### Scenario: Information link does nothing

#### Case: Blog link click changes nothing
Labels: automated
- **Given** a visitor on `/products`
- **When** the visitor clicks "Blog" in the header and "Privacy Policy" in the footer
- **Then** the address is still `/products` and the page content is unchanged

### Scenario: Header on a phone

#### Case: 375 px header
Labels: e2e
- **Given** a browser window 375 px wide
- **When** the visitor opens `/products`
- **Then** the page width does not exceed 375 px (no horizontal scrolling)
- **And** tapping the basket icon opens `/basket` and tapping "Women's perfumes" opens `/products?gender=women`

### Scenario: Header icon labels

#### Case: Header icons have accessible names
Labels: automated
- **Given** a visitor on `/products`
- **When** the accessible names of the header icons are read
- **Then** they are "Search", "Wishlist", "Account" and "Basket"

### Scenario: Search by keyboard only

#### Case: Keyboard-only header search
Labels: e2e
- **Given** a visitor on `/products`
- **When** the visitor uses only Tab and Enter to open the search, types `dior` and presses Enter
- **Then** the address contains `q=dior`

## General remarks

## Spec changes during test-case review

- Finding "Empty input not covered for product-catalog/Product list parameters: no case settles `gender=` or `sort=` with an empty value" → added scenario "Empty gender and sort are ignored" (product-catalog), answered in Q70
- Finding "Unavailable external service not covered for catalog-page/Gender filter: no case settles what "See results (N)" shows when the count request fails" → added scenario "Count request fails" (catalog-page), answered in Q71
- Finding "Unavailable storage not covered for basket/Basket kept in the browser and wishlist/Wishlist kept in the browser: no case settles adding when browser storage is blocked or full" → added scenarios "Blocked storage keeps the basket in memory" (basket) and "Blocked storage keeps the wishlist in memory" (wishlist), answered in Q72
- Finding "Case "Name of only spaces is refused" treats a name of spaces as no name, which product-catalog/Required product fields does not state" → added scenario "Product with a name of only spaces is refused" (product-catalog)
- Design round decision (not a review finding): at most 50 items per availability check, answered in Q77 → added requirement "Availability check size limit" with scenarios "Exactly 50 items are accepted", "51 items are refused" and "A long basket is checked in several requests" (product-catalog)

## Stage result

Accepted findings:
- Case "Staff with add right creates a product" and the case "Staff without catalog rights cannot change the shared texts" check the requirement product-catalog/Catalog management permissions but sit under scenarios that describe only editing and the admin home page — product-catalog, accepted: the requirement text covers both cases
- The specs say the message is shown "after each change" — basket and wishlist "without browser storage", accepted: removals showing the same message is harmless
- A page reload empties the basket and wishlist in this mode, but the specs don't say so — basket and wishlist, accepted: follows from storing in page memory only
- No confirmed answer covers whitespace-only names — product-catalog, accepted: the natural reading of "no name"
- Count unavailable does not cover a failed count when the panel first opens or a list that fails after the click — catalog-page, accepted: the list's own error state covers a failed load
- Not reviewed by the AI QA reviewer: Empty gender with a valid sort (product-catalog)
- Not reviewed by the AI QA reviewer: Clearing the rating is accepted (product-catalog)

Handed over to QA

[Answer]: Looks correct
