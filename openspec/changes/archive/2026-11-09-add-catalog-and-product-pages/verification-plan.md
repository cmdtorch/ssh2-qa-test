# Verification Plan

## Scenario coverage

| Capability | Requirement | Scenario | Level | Critical | Test data / setup | Manual reason |
|---|---|---|---|---|---|---|
| backend-app | REST API baseline without business endpoints | Unknown API address | integration | no | a running API, no products | — |
| backend-app | REST API baseline without business endpoints | Product catalog endpoints are public | integration | no | a running API, no products | — |
| backend-app | REST API baseline without business endpoints | Product catalog is read-only | integration | no | a running API, no products | — |
| product-catalog | Product data | Product with all data is saved | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product data | Date added does not change on edit | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product descriptor line | Descriptor line saved and returned | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product descriptor line | Product without a descriptor line | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Required product fields | Product without a name is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Required product fields | Product with a name of only spaces is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Required product fields | Product without a gender is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Required product fields | Product without a photo is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Required product fields | Product without a size is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Required product fields | Product without a default size is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Required product fields | Product with two default sizes is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Required product fields | Sale price equal to the regular price is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Required product fields | Sale price above the regular price is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Unique size volumes | Two sizes with the same volume are refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product short name | Short name filled in from the name | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product short name | Duplicate short name is refused | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product short name | Reserved short name is refused | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product photo uploads | Valid photo is accepted | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product photo uploads | Photo over 5 MB is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product photo uploads | Photo in another format is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product rating | Valid rating is accepted | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product rating | Rating out of range is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product rating | Rating off the half-step is refused | unit | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Shared shipping and questions texts | Shared text edited in the admin panel | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Catalog management permissions | Staff user with catalog rights edits a product | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Catalog management permissions | Staff user with catalog rights deletes a product | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Catalog management permissions | Staff user without catalog rights cannot edit | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Hidden products | Hidden product is not listed | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Hidden products | Hidden product is not found by search | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Hidden products | Hidden product detail is not found | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Public product list | First page of a large catalog | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Public product list | List item shows the default size prices | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Public product list | List item without a discount | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Public product list | Empty catalog | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Discount percentage | Whole discount percentage | unit | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Discount percentage | Rounded discount percentage | unit | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list gender filter | Women's filter | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list gender filter | Men's filter excludes unisex | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list gender filter | Unknown gender value | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list name search | Search by part of the name ignoring case | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list name search | Empty search returns everything | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list name search | Search combined with the gender filter | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list name search | Search with no match | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list sorting | Default sorting is newest first | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list sorting | Price low to high uses the sale price | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list sorting | Price high to low | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list sorting | Equal prices are ordered by name | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list sorting | Unknown sort value | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list parameters | Parameters combined | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list parameters | Invalid page number returns page 1 | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Empty list parameters | Empty gender and sort are ignored | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list page beyond the last | Page 99 of 3 | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product detail | Detail of a visible product | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product detail | Detail without a rating | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product detail | Unknown product | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Related products | Four related products | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Related products | Fewer than four related products | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Related products | No related products | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Related products | Hidden product is not related | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product availability check | Deleted size is reported unavailable | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product availability check | Hidden product is reported unavailable | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product availability check | Unknown product is reported unavailable | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product availability check | Malformed item is refused | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product availability check | Missing or empty items are refused | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Availability check answer | Result of a basket item | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Availability check answer | Wishlist item without a volume uses the default size | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Availability check answer | Results keep the request order | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Availability check size limit | Exactly 50 items are accepted | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Availability check size limit | 51 items are refused | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Availability check size limit | A long basket is checked in several requests | integration | yes | products with sizes, prices and generated test photos as named in the scenario | — |
| product-catalog | Product list speed | List answers fast with 500 products | integration | no | products with sizes, prices and generated test photos as named in the scenario | — |
| catalog-page | Catalog page | Catalog page opens | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog page | Breadcrumb from the catalog to the start page | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Product card | Card of a discounted product | integration | yes | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Product card | Card of a product without a discount | integration | yes | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Product card | Card opens the product page | integration | yes | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Price format | Whole price | unit | yes | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Price format | Price with cents | unit | yes | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Price format | Price in thousands | unit | yes | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog page numbers | Go to the second page | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog page numbers | Single page has no page numbers | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog page numbers | Page number beyond the last | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog sorting | Catalog opens sorted by new | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog sorting | Sort by price low to high | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog sorting | Sort by price high to low | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog sorting | Changing the sort returns to page 1 | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Filter panel | Open the filter panel | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Filter panel | Collapse and expand the Gender group | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Filter panel | Close the panel with the cross | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Gender filter | Marking a gender updates the count | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Gender filter | Count within the search results | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Gender filter | Marking another gender replaces the mark | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Gender filter | Apply the gender filter | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Gender filter | Clear the mark | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Gender filter | Clear an applied gender | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Gender filter | Unapplied mark is dropped when the panel closes | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Count unavailable | Count request fails | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog view in the page address | Shared address opens the same view | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog view in the page address | Back button returns the previous view | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog view in the page address | Unknown gender in the address is ignored | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog view in the page address | Unknown sort in the address is ignored | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog view in the page address | Invalid page number in the address | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Name search results | Search results in the catalog | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Name search results | Gender filter on search results | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog empty state | No product matches | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog empty state | Reset filters | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog empty state | Catalog with no products | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog loading and error states | Placeholders while loading | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog loading and error states | Error and retry | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog loading and error states | Backend cannot be reached | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog on narrow screens | Catalog on a phone | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog on narrow screens | Filter panel on a phone | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog accessibility | Filter by keyboard only | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog accessibility | Photo descriptions | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| catalog-page | Catalog accessibility | Filter panel button labels | integration | no | visible products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product page | Product page opens | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product page | Breadcrumb to the catalog | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product page | Breadcrumb to the start page | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product descriptor line display | Descriptor line shown | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product descriptor line display | No descriptor line | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product photo gallery | Thumbnail shows its photo | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product photo gallery | Arrows move between photos | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product photo gallery | Arrows at the ends | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product photo gallery | Product with one photo | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product rating display | Rating 4.5 | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product rating display | No rating | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Size choice and price | Default size chosen on open | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Size choice and price | Choosing another size changes the price | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Size choice and price | Chosen size with a discount | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Quantity selector | Quantity starts at 1 | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Quantity selector | Raise and lower the quantity | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Quantity selector | Quantity stops at 10 | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Add to basket from the product page | Confirmation after adding | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Add to basket from the product page | Capped add shows only the limit message | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Add to basket from the product page | Choosing a size keeps the quantity | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Add to basket from the product page | Add the chosen size and quantity | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Wishlist heart on the product page | Add to the wishlist | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Wishlist heart on the product page | Remove from the wishlist | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product content blocks | Blocks on open | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product content blocks | Notes are shown | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product content blocks | Collapse a block | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product content blocks | Collapse the description and the notes | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product content blocks | Expand the shared questions text | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product content blocks | Expand the shared shipping text | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product content blocks | Collapse the Size block | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | You may also like | Related products shown | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | You may also like | Related card opens its product | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | You may also like | No related products | integration | yes | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product not found | Unknown product address | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product not found | Other unknown address | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product not found | Back to catalog link | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product not found | Hidden product address | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product page loading and error states | Placeholders while loading | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product page loading and error states | Error and retry | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product page loading and error states | Backend cannot be reached | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product page on narrow screens | Product page on a phone | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product page accessibility | Add to basket by keyboard only | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product page accessibility | Icon buttons have labels | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| product-page | Product page accessibility | Filled heart label | integration | no | one or two products as named in the scenario; backend answers mocked per scenario | — |
| basket | Basket kept in the browser | Basket survives a reload | integration | no | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Basket without browser storage | Blocked storage keeps the basket in memory | integration | no | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Adding to the basket | Add a new line | unit | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Adding to the basket | Same product and size adds to the line | unit | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Adding to the basket | Sum over 10 is capped | unit | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Adding to the basket | Limit message disappears on the next action | unit | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Adding to the basket | Exactly 10 is not capped | unit | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Basket counter in the header | Counter shows the sum of quantities | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Basket counter in the header | Counter updates after adding | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Basket page | Basket page lists the lines and the total | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Basket page | Total with cents | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Basket page | Line name opens the product | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Changing the basket | Raise a line quantity | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Changing the basket | Quantity limits on the basket page | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Changing the basket | Remove a line | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Basket shows current prices | Price changed after adding | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Unavailable products leave the basket | Failed check removes nothing | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Unavailable products leave the basket | Hidden product removed from the basket | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Unavailable products leave the basket | Deleted size removed from the basket | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Unavailable products leave the basket | Start page does not check the basket | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Unavailable products leave the basket | One message for basket and wishlist | integration | yes | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Basket page loading and error states | Placeholders while the basket loads | integration | no | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Basket page loading and error states | Basket error and retry | integration | no | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Empty basket | Empty basket page | integration | no | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Empty basket | Last line removed | integration | no | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Basket page accessibility | Basket button labels | integration | no | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| basket | Basket page accessibility | Remove a line by keyboard only | integration | no | basket lines as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Wishlist kept in the browser | Wishlist survives a reload | integration | yes | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Wishlist without browser storage | Blocked storage keeps the wishlist in memory | integration | no | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Wishlist page | Wishlist page shows the products | integration | yes | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Wishlist page | Wishlist card opens the product | integration | yes | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Wishlist page | Removed product leaves the wishlist page | integration | yes | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Unavailable products leave the wishlist | Failed check keeps the wishlist | integration | yes | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Unavailable products leave the wishlist | Hidden product removed from the wishlist | integration | yes | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Unavailable products leave the wishlist | Deleted product removed from the wishlist | integration | yes | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Empty wishlist | Empty wishlist page | integration | no | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Wishlist page loading and error states | Placeholders while the wishlist loads | integration | no | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Wishlist page loading and error states | Wishlist error and retry | integration | no | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Wishlist page accessibility | Wishlist card photo description | integration | no | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| wishlist | Wishlist page accessibility | Open a wishlist card by keyboard only | integration | no | wishlist products as named in the scenario in browser storage; availability answers mocked | — |
| site-navigation | Shared header and footer | Header and footer on the shop pages | integration | no | a rendered page with the header and footer | — |
| site-navigation | Shared header and footer | Start page unchanged | integration | no | a rendered page with the header and footer | — |
| site-navigation | Logo opens the start page | Header logo | integration | no | a rendered page with the header and footer | — |
| site-navigation | Logo opens the start page | Footer logo | integration | no | a rendered page with the header and footer | — |
| site-navigation | Category links | Perfumes opens the whole catalog | integration | no | a rendered page with the header and footer | — |
| site-navigation | Category links | Category link clears the search and the sort | integration | no | a rendered page with the header and footer | — |
| site-navigation | Category links | Women's perfumes opens the filtered catalog | integration | no | a rendered page with the header and footer | — |
| site-navigation | Product search entry | Search from the header | integration | no | a rendered page with the header and footer | — |
| site-navigation | Product search entry | Search keeps the gender and the sort | integration | no | a rendered page with the header and footer | — |
| site-navigation | Product search entry | Empty search from the header | integration | no | a rendered page with the header and footer | — |
| site-navigation | Basket and wishlist icons | Basket icon opens the basket | integration | no | a rendered page with the header and footer | — |
| site-navigation | Basket and wishlist icons | Heart icon opens the wishlist | integration | no | a rendered page with the header and footer | — |
| site-navigation | Elements without behaviour | Profile icon does nothing | integration | no | a rendered page with the header and footer | — |
| site-navigation | Elements without behaviour | Information link does nothing | integration | no | a rendered page with the header and footer | — |
| site-navigation | Header and footer on narrow screens | Header on a phone | integration | no | a rendered page with the header and footer | — |
| site-navigation | Header accessibility | Header icon labels | integration | no | a rendered page with the header and footer | — |
| site-navigation | Header accessibility | Search by keyboard only | integration | no | a rendered page with the header and footer | — |

## Exclusions

| Capability | Scenario | Reason |
|---|---|---|
| — | — | None. |

## Requirement trace

| Capability | Requirement | Sources |
|---|---|---|
| backend-app | REST API baseline without business endpoints | [Q2][Q3] |
| product-catalog | Product data | [Q2][Q14][Q15][Q16][Q17][Q32][Q33] |
| product-catalog | Product descriptor line | [Q61] |
| product-catalog | Required product fields | [Q48][Q33][Q32] |
| product-catalog | Unique size volumes | [Q14] |
| product-catalog | Product short name | [Q37][Q48] |
| product-catalog | Product photo uploads | [Q51] |
| product-catalog | Product rating | [Q16] |
| product-catalog | Shared shipping and questions texts | [Q18] |
| product-catalog | Catalog management permissions | [Q50] |
| product-catalog | Hidden products | [Q49][Q56] |
| product-catalog | Public product list | [Q2][Q3][Q12][Q13] |
| product-catalog | Discount percentage | [Q13][Q32] |
| product-catalog | Product list gender filter | [Q10][Q43] |
| product-catalog | Product list name search | [Q29][Q44] |
| product-catalog | Product list sorting | [Q11][Q41][Q42] |
| product-catalog | Product list parameters | [Q60][Q45] |
| product-catalog | Empty list parameters | [Q70] |
| product-catalog | Product list page beyond the last | [Q46] |
| product-catalog | Product detail | [Q2][Q3][Q14][Q15][Q16][Q17][Q18] |
| product-catalog | Related products | [Q19][Q47] |
| product-catalog | Product availability check | [Q40][Q56][Q65] |
| product-catalog | Availability check answer | [Q40][Q56][Q65] |
| product-catalog | Availability check size limit | [Q77] |
| product-catalog | Product list speed | [Q54][Q63][Q80] |
| catalog-page | Catalog page | [Q4][Q12] |
| catalog-page | Product card | [Q13][Q32][Q33] |
| catalog-page | Price format | [Q62] |
| catalog-page | Catalog page numbers | [Q12][Q46] |
| catalog-page | Catalog sorting | [Q11][Q42] |
| catalog-page | Filter panel | [Q10][Q28][Q34] |
| catalog-page | Gender filter | [Q10][Q35][Q43][Q66] |
| catalog-page | Count unavailable | [Q71] |
| catalog-page | Catalog view in the page address | [Q45][Q59][Q60][Q67] |
| catalog-page | Name search results | [Q29][Q44][Q59] |
| catalog-page | Catalog empty state | [Q21] |
| catalog-page | Catalog loading and error states | [Q23] |
| catalog-page | Catalog on narrow screens | [Q24][Q81][Q82] |
| catalog-page | Catalog accessibility | [Q55] |
| product-page | Product page | [Q4][Q37] |
| product-page | Product descriptor line display | [Q61] |
| product-page | Product photo gallery | [Q15] |
| product-page | Product rating display | [Q16][Q53] |
| product-page | Size choice and price | [Q14][Q32][Q33] |
| product-page | Quantity selector | [Q8][Q38] |
| product-page | Add to basket from the product page | [Q8][Q38][Q39][Q57][Q68] |
| product-page | Wishlist heart on the product page | [Q9] |
| product-page | Product content blocks | [Q17][Q18][Q36] |
| product-page | You may also like | [Q19][Q47] |
| product-page | Product not found | [Q22] |
| product-page | Product page loading and error states | [Q23] |
| product-page | Product page on narrow screens | [Q24][Q81][Q82] |
| product-page | Product page accessibility | [Q55] |
| basket | Basket kept in the browser | [Q8][Q30] |
| basket | Basket without browser storage | [Q72] |
| basket | Adding to the basket | [Q38][Q39][Q57][Q68] |
| basket | Basket counter in the header | [Q8] |
| basket | Basket page | [Q30][Q52][Q62] |
| basket | Changing the basket | [Q30][Q38] |
| basket | Basket shows current prices | [Q40] |
| basket | Unavailable products leave the basket | [Q56][Q65] |
| basket | Basket page loading and error states | [Q58] |
| basket | Empty basket | [Q52] |
| basket | Basket page accessibility | [Q55] |
| wishlist | Wishlist kept in the browser | [Q9][Q31] |
| wishlist | Wishlist without browser storage | [Q72] |
| wishlist | Wishlist page | [Q31] |
| wishlist | Unavailable products leave the wishlist | [Q56][Q65] |
| wishlist | Empty wishlist | [Q52] |
| wishlist | Wishlist page loading and error states | [Q58] |
| wishlist | Wishlist page accessibility | [Q55] |
| site-navigation | Shared header and footer | [Q6][Q7] |
| site-navigation | Logo opens the start page | [Q4] |
| site-navigation | Category links | [Q5] |
| site-navigation | Product search entry | [Q7][Q29] |
| site-navigation | Basket and wishlist icons | [Q30][Q31] |
| site-navigation | Elements without behaviour | [Q6][Q7] |
| site-navigation | Header and footer on narrow screens | [Q24][Q81][Q82] |
| site-navigation | Header accessibility | [Q55] |

## Environment

- Backend tests run with pytest on the in-memory SQLite database of the test settings (`make test`); the 500-product speed scenario is checked there too, so its figure is not a PostgreSQL measurement [Q80].
- Frontend tests run with Vitest and Testing Library in jsdom (`pnpm --filter frontend test`); backend answers are replaced by mocked `fetch` responses, and browser storage by the jsdom storage or a throwing replacement for the blocked-storage scenarios [Q76][Q72].
- Product photos in tests are small images generated in the right format (JPG, PNG, WebP, GIF) and, for the size limit, a generated file over 5 MB [Q51].
- E2E tests run with Playwright on Chromium at desktop width against the real backend and a PostgreSQL database that starts empty (`make e2e`, docker compose with `docker-compose.e2e.yml` and a media volume); the `seed_e2e` command creates products and changes them mid-test, and five narrow-layout tests set their own window width (375 px, 1023 px and 1024 px) [Q27][Q78][Q81][Q82].
- Critical areas: hidden and deleted products, prices and discounts and totals, the basket, the wishlist [Q79].
- No scenario is dangerous (no payments, no mass actions, no irreversible changes), so there are no manual rows.
- Running application: yes

## Test case coverage

| Capability | Scenario | Case | Labels | Level |
|---|---|---|---|---|
| backend-app | Unknown API address | Unknown API address answers 404 | automated | integration |
| backend-app | Product catalog endpoints are public | Catalog endpoints answer without sign-in | automated | integration |
| backend-app | Product catalog is read-only | POST to the product list is rejected | automated | integration |
| backend-app | Product catalog is read-only | Write methods on a product detail are rejected | automated | integration |
| product-catalog | Product with all data is saved | Admin saves a product with three sizes | automated | integration |
| product-catalog | Date added does not change on edit | Editing the description keeps the date added | automated | integration |
| product-catalog | Descriptor line saved and returned | Descriptor line round-trips through the API | automated | integration |
| product-catalog | Product without a descriptor line | Empty descriptor line is absent from the detail | automated | integration |
| product-catalog | Product without a name is refused | Empty name is refused | automated | unit |
| product-catalog | Product with a name of only spaces is refused | Name of only spaces is refused | automated | unit |
| product-catalog | Product without a gender is refused | Missing gender is refused | automated | unit |
| product-catalog | Product without a photo is refused | Product with no photo is refused | automated | unit |
| product-catalog | Product without a photo is refused | Removing the last photo of an existing product is refused | automated | unit |
| product-catalog | Product without a size is refused | Product with no size is refused | automated | unit |
| product-catalog | Product without a default size is refused | Two sizes and no default are refused | automated | unit |
| product-catalog | Product with two default sizes is refused | Two default sizes are refused | automated | unit |
| product-catalog | Sale price equal to the regular price is refused | Sale price equal to the regular price | automated | unit |
| product-catalog | Sale price equal to the regular price is refused | Sale price one cent below the regular price is accepted | automated | unit |
| product-catalog | Sale price above the regular price is refused | Sale price above the regular price | automated | unit |
| product-catalog | Two sizes with the same volume are refused | Duplicate 30 ml sizes are refused | automated | unit |
| product-catalog | Short name filled in from the name | Short name is generated from the name | automated | integration |
| product-catalog | Short name filled in from the name | Name with punctuation gives a clean short name | automated | integration |
| product-catalog | Duplicate short name is refused | Second product with the same short name is refused | automated | integration |
| product-catalog | Reserved short name is refused | Short name availability is refused | automated | integration |
| product-catalog | Valid photo is accepted | 2 MB PNG photo is accepted | automated | unit |
| product-catalog | Valid photo is accepted | Photo of exactly 5 MB is accepted | automated | unit |
| product-catalog | Photo over 5 MB is refused | 6 MB JPG photo is refused | automated | unit |
| product-catalog | Photo over 5 MB is refused | Photo one byte over 5 MB is refused | automated | unit |
| product-catalog | Photo in another format is refused | GIF photo is refused | automated | unit |
| product-catalog | Photo in another format is refused | Text file renamed to .png is refused | automated | unit |
| product-catalog | Valid rating is accepted | Rating 4.5 is accepted | automated | unit |
| product-catalog | Valid rating is accepted | Rating bounds 0 and 5 are accepted | automated | unit |
| product-catalog | Valid rating is accepted | Clearing the rating is accepted | automated | unit |
| product-catalog | Rating out of range is refused | Rating 5.5 is refused | automated | unit |
| product-catalog | Rating out of range is refused | Negative rating is refused | automated | unit |
| product-catalog | Rating off the half-step is refused | Rating 4.3 is refused | automated | unit |
| product-catalog | Shared text edited in the admin panel | New shipping text appears on every product | automated | integration |
| product-catalog | Shared text edited in the admin panel | New questions text appears on every product | automated | integration |
| product-catalog | Staff user with catalog rights edits a product | Staff with change right renames a product | automated | integration |
| product-catalog | Staff user with catalog rights edits a product | Staff with add right creates a product | automated | integration |
| product-catalog | Staff user with catalog rights deletes a product | Staff with delete right deletes a product | automated | integration |
| product-catalog | Staff user without catalog rights cannot edit | Staff without catalog rights sees no catalog | automated | integration |
| product-catalog | Staff user without catalog rights cannot edit | Staff with view right only cannot save changes | automated | integration |
| product-catalog | Staff user without catalog rights cannot edit | Staff without catalog rights cannot change the shared texts | automated | integration |
| product-catalog | Hidden product is not listed | Hidden product is left out of the list and the count | automated | integration |
| product-catalog | Hidden product is not listed | Showing the product again lists it | automated | integration |
| product-catalog | Hidden product is not found by search | Search does not find a hidden product | automated | integration |
| product-catalog | Hidden product detail is not found | Hidden product detail answers 404 | automated | integration |
| product-catalog | First page of a large catalog | 500 products give 32 pages of 16 | automated | integration |
| product-catalog | First page of a large catalog | Exactly 16 products give one page | automated | integration |
| product-catalog | First page of a large catalog | 17 products give two pages | automated | integration |
| product-catalog | List item shows the default size prices | List item carries the default size prices and discount | automated | integration |
| product-catalog | List item without a discount | List item without a sale price | automated | integration |
| product-catalog | Empty catalog | Empty catalog answers an empty list | automated | integration |
| product-catalog | Empty catalog | Catalog with only hidden products is empty | automated | integration |
| product-catalog | Whole discount percentage | 136 to 81.60 is 40 percent | automated | unit |
| product-catalog | Rounded discount percentage | 60 to 40 rounds down to 33 | automated | unit |
| product-catalog | Rounded discount percentage | Under one percent rounds up to 1 | automated | unit |
| product-catalog | Rounded discount percentage | 66.67 percent rounds up to 67 | automated | unit |
| product-catalog | Women's filter | Women's filter returns only women's products | automated | integration |
| product-catalog | Men's filter excludes unisex | Men's filter leaves out unisex | automated | integration |
| product-catalog | Men's filter excludes unisex | Unisex filter returns only unisex | automated | integration |
| product-catalog | Unknown gender value | Gender kids answers 400 | automated | integration |
| product-catalog | Search by part of the name ignoring case | Lowercase search finds capitalised names | automated | integration |
| product-catalog | Search by part of the name ignoring case | Uppercase search in the middle of a name | automated | integration |
| product-catalog | Empty search returns everything | Empty q returns all products | automated | integration |
| product-catalog | Search combined with the gender filter | Search chanel within men's | automated | integration |
| product-catalog | Search with no match | Search zzz finds nothing | automated | integration |
| product-catalog | Default sorting is newest first | No sort parameter gives newest first | automated | integration |
| product-catalog | Default sorting is newest first | Sort new gives newest first | automated | integration |
| product-catalog | Price low to high uses the sale price | Ascending price uses the sale price | automated | integration |
| product-catalog | Price high to low | Descending price uses the sale price | automated | integration |
| product-catalog | Equal prices are ordered by name | Equal prices ordered A to Z | automated | integration |
| product-catalog | Equal prices are ordered by name | Same date added ordered A to Z | automated | integration |
| product-catalog | Equal prices are ordered by name | Ties stay stable across pages | automated | integration |
| product-catalog | Unknown sort value | Sort rating answers 400 | automated | integration |
| product-catalog | Parameters combined | All four parameters together | automated | integration |
| product-catalog | Invalid page number returns page 1 | Pages 0, -1 and abc return page 1 | automated | integration |
| product-catalog | Empty gender and sort are ignored | Empty gender and sort give the whole catalog | automated | integration |
| product-catalog | Empty gender and sort are ignored | Empty gender with a valid sort | automated | integration |
| product-catalog | Page 99 of 3 | Page 99 returns the last page | automated | integration |
| product-catalog | Page 99 of 3 | Page beyond the last of an empty result | automated | integration |
| product-catalog | Detail of a visible product | Full detail of a product | automated | integration |
| product-catalog | Detail without a rating | Detail of a product without a rating | automated | integration |
| product-catalog | Unknown product | Unknown short name answers 404 | automated | integration |
| product-catalog | Four related products | Four related products of the same gender | automated | integration |
| product-catalog | Fewer than four related products | Two unisex products are related | automated | integration |
| product-catalog | No related products | Only men's product has no related products | automated | integration |
| product-catalog | Hidden product is not related | Hidden women's product is not related | automated | integration |
| product-catalog | Deleted size is reported unavailable | Existing and missing sizes in one check | automated | integration |
| product-catalog | Deleted size is reported unavailable | Size deleted after it was added | automated | integration |
| product-catalog | Hidden product is reported unavailable | Hidden product without a size is unavailable | automated | integration |
| product-catalog | Hidden product is reported unavailable | Hidden product with a size is unavailable | automated | integration |
| product-catalog | Unknown product is reported unavailable | Unknown product with a size is unavailable | automated | integration |
| product-catalog | Malformed item is refused | Volume abc is refused | automated | integration |
| product-catalog | Malformed item is refused | Item with an empty short name is refused | automated | integration |
| product-catalog | Missing or empty items are refused | No items parameter and empty items | automated | integration |
| product-catalog | Result of a basket item | Available basket item carries all fields | automated | integration |
| product-catalog | Wishlist item without a volume uses the default size | Item without volume gets the default size | automated | integration |
| product-catalog | Results keep the request order | Mixed items keep their order | automated | integration |
| product-catalog | Results keep the request order | Same item twice gives two results | automated | integration |
| product-catalog | Exactly 50 items are accepted | 50 items give 50 results | automated | integration |
| product-catalog | 51 items are refused | 51 items are refused with no results | automated | integration |
| product-catalog | A long basket is checked in several requests | 60 basket lines are checked in two requests | automated, e2e | integration |
| product-catalog | List answers fast with 500 products | Filtered sorted page answers within 500 ms | automated | integration |
| product-catalog | List answers fast with 500 products | Search over 500 products answers within 500 ms | automated | integration |
| catalog-page | Catalog page opens | Anonymous visitor sees the first 16 cards | automated, e2e | integration |
| catalog-page | Breadcrumb from the catalog to the start page | Home page breadcrumb opens the start page | e2e | — |
| catalog-page | Card of a discounted product | Discounted card shows old price, new price and badge | automated, e2e | integration |
| catalog-page | Card of a product without a discount | Card without discount shows one price | automated, e2e | integration |
| catalog-page | Card opens the product page | Clicking a card opens its product | e2e | — |
| catalog-page | Whole price | 40 dollars is shown as $40 | automated | unit |
| catalog-page | Price with cents | 81.6 dollars is shown as $81.60 | automated | unit |
| catalog-page | Price with cents | 92.4 dollars is shown as $92.40 | automated | unit |
| catalog-page | Price in thousands | 1250 dollars is shown as $1,250 | automated | unit |
| catalog-page | Price in thousands | 1250.5 dollars is shown as $1,250.50 | automated | unit |
| catalog-page | Price in thousands | 999 dollars has no separator | automated | unit |
| catalog-page | Price in thousands | 1000 dollars gets the separator | automated | unit |
| catalog-page | Go to the second page | Page 2 of 20 products shows 4 cards | automated, e2e | integration |
| catalog-page | Go to the second page | 17 products give a second page with one card | automated, e2e | integration |
| catalog-page | Single page has no page numbers | Ten products show no page numbers | automated, e2e | integration |
| catalog-page | Single page has no page numbers | Exactly 16 products show no page numbers | automated | integration |
| catalog-page | Page number beyond the last | Page 99 shows the last page | automated, e2e | integration |
| catalog-page | Catalog opens sorted by new | Newest product first on open | automated, e2e | integration |
| catalog-page | Sort by price low to high | Choosing price low to high | automated, e2e | integration |
| catalog-page | Sort by price high to low | Choosing price high to low | automated, e2e | integration |
| catalog-page | Changing the sort returns to page 1 | Sorting from page 2 goes to page 1 | automated, e2e | integration |
| catalog-page | Open the filter panel | Filter panel shows only the Gender group | automated, e2e | integration |
| catalog-page | Collapse and expand the Gender group | Gender group collapses and expands | automated, e2e | integration |
| catalog-page | Close the panel with the cross | Cross closes the panel without applying | automated, e2e | integration |
| catalog-page | Marking a gender updates the count | Marking women's shows the count 8 | automated, e2e | integration |
| catalog-page | Marking a gender updates the count | Marking a gender with no products shows zero | automated, e2e | integration |
| catalog-page | Count within the search results | Count counts within the search | automated, e2e | integration |
| catalog-page | Marking another gender replaces the mark | Second mark replaces the first | automated, e2e | integration |
| catalog-page | Apply the gender filter | See results applies the women's filter | automated, e2e | integration |
| catalog-page | Apply the gender filter | Applying the filter from page 2 shows page 1 | automated, e2e | integration |
| catalog-page | Clear the mark | Clear removes the mark and shows the full count | automated, e2e | integration |
| catalog-page | Clear the mark | Clear within a search counts the search results | automated, e2e | integration |
| catalog-page | Clear an applied gender | Clear and apply removes the gender | automated, e2e | integration |
| catalog-page | Unapplied mark is dropped when the panel closes | Reopened panel shows the applied state | automated, e2e | integration |
| catalog-page | Unapplied mark is dropped when the panel closes | Reopened panel keeps the applied gender | automated | integration |
| catalog-page | Count request fails | Count request answers 500 | automated, e2e | integration |
| catalog-page | Count request fails | Count request fails with a network error | automated | integration |
| catalog-page | Shared address opens the same view | Address with gender, sort and page | automated, e2e | integration |
| catalog-page | Back button returns the previous view | Back after applying a filter | e2e | — |
| catalog-page | Unknown gender in the address is ignored | Gender kids shows everything | automated, e2e | integration |
| catalog-page | Unknown sort in the address is ignored | Sort rating falls back to New | automated, e2e | integration |
| catalog-page | Invalid page number in the address | Pages 0, -1 and abc show page 1 | automated, e2e | integration |
| catalog-page | Search results in the catalog | Search chanel shows two cards | automated, e2e | integration |
| catalog-page | Search results in the catalog | Empty search text shows the whole catalog | automated | integration |
| catalog-page | Gender filter on search results | Men's filter on chanel results | automated, e2e | integration |
| catalog-page | No product matches | Search zzz shows Nothing found | automated, e2e | integration |
| catalog-page | Reset filters | Reset filters clears search and gender | automated, e2e | integration |
| catalog-page | Catalog with no products | Empty catalog shows Nothing found | automated, e2e | integration |
| catalog-page | Placeholders while loading | Grey placeholders before the list arrives | automated, e2e | integration |
| catalog-page | Error and retry | Server error then successful retry | automated, e2e | integration |
| catalog-page | Error and retry | Retry while the error persists | automated, e2e | integration |
| catalog-page | Backend cannot be reached | Network failure shows the error | automated, e2e | integration |
| catalog-page | Catalog on a phone | 375 px wide screen | e2e | — |
| catalog-page | Catalog on a phone | 1023 px uses the narrow layout and 1024 px the desktop layout | e2e | — |
| catalog-page | Filter panel on a phone | Filter panel takes the full width | e2e | — |
| catalog-page | Filter by keyboard only | Keyboard-only filtering | e2e | — |
| catalog-page | Photo descriptions | Card photo has the product name as its text | automated | integration |
| catalog-page | Filter panel button labels | Labels of the cross and the Gender toggle | automated | integration |
| product-page | Product page opens | Anonymous visitor opens a product page | automated, e2e | integration |
| product-page | Breadcrumb to the catalog | Products breadcrumb opens the catalog | e2e | — |
| product-page | Breadcrumb to the start page | Home page breadcrumb opens the start page | e2e | — |
| product-page | Descriptor line shown | Descriptor line under the name | automated, e2e | integration |
| product-page | No descriptor line | No descriptor text without a descriptor line | automated | integration |
| product-page | Thumbnail shows its photo | Third thumbnail shows the third photo | automated, e2e | integration |
| product-page | Arrows move between photos | Forward twice then back once | automated, e2e | integration |
| product-page | Arrows at the ends | Arrows inactive at first and last photo | automated, e2e | integration |
| product-page | Product with one photo | Single photo disables both arrows | automated | integration |
| product-page | Rating 4.5 | Rating 4.5 shows four and a half stars | automated | integration |
| product-page | Rating 4.5 | Rating 0 shows five empty stars | automated | integration |
| product-page | Rating 4.5 | Rating 5 shows five filled stars | automated | integration |
| product-page | No rating | Product without rating shows no stars | automated | integration |
| product-page | Default size chosen on open | Default 30 ml chosen with its price | automated, e2e | integration |
| product-page | Choosing another size changes the price | Choosing 50 ml shows $80 | automated, e2e | integration |
| product-page | Chosen size with a discount | Discounted size shows the struck regular price | automated, e2e | integration |
| product-page | Chosen size with a discount | Switching to a size without discount removes the struck price | automated | integration |
| product-page | Quantity starts at 1 | Quantity 1 and minus inactive on open | automated, e2e | integration |
| product-page | Raise and lower the quantity | Plus twice and minus once gives 2 | automated, e2e | integration |
| product-page | Quantity stops at 10 | Plus is inactive at 10 | automated, e2e | integration |
| product-page | Confirmation after adding | Added to basket shown for 3 seconds and quantity reset | automated, e2e | integration |
| product-page | Confirmation after adding | Adding twice quickly | automated | integration |
| product-page | Capped add shows only the limit message | Adding 5 to 8 shows the limit message | automated, e2e | integration |
| product-page | Choosing a size keeps the quantity | Quantity 4 survives a size change | automated | integration |
| product-page | Add the chosen size and quantity | Add 50 ml times 2 to an empty basket | automated, e2e | integration |
| product-page | Add to the wishlist | Heart adds the product | automated, e2e | integration |
| product-page | Remove from the wishlist | Filled heart removes the product | automated, e2e | integration |
| product-page | Blocks on open | Four blocks expanded and two collapsed | automated | integration |
| product-page | Notes are shown | Three note groups with their texts | automated | integration |
| product-page | Collapse a block | Ingredients collapse and expand | automated, e2e | integration |
| product-page | Collapse the description and the notes | Description and notes collapse and expand | automated, e2e | integration |
| product-page | Expand the shared questions text | Questions block shows the shared text | automated, e2e | integration |
| product-page | Expand the shared shipping text | Shipping block shows the shared text | automated, e2e | integration |
| product-page | Collapse the Size block | Size block collapses and keeps the choice | automated, e2e | integration |
| product-page | Related products shown | Four related women's cards | automated, e2e | integration |
| product-page | Related card opens its product | Clicking a related card | e2e | — |
| product-page | No related products | Only men's product shows no block | automated | integration |
| product-page | Unknown product address | Unknown product shows Page not found | automated, e2e | integration |
| product-page | Other unknown address | Unknown site address shows Page not found | automated, e2e | integration |
| product-page | Back to catalog link | Back to catalog opens the catalog | e2e | — |
| product-page | Hidden product address | Hidden product shows Page not found | automated, e2e | integration |
| product-page | Placeholders while loading | Grey placeholders before the product arrives | automated, e2e | integration |
| product-page | Error and retry | Server error then successful retry | automated, e2e | integration |
| product-page | Backend cannot be reached | Network failure shows the product error | automated, e2e | integration |
| product-page | Product page on a phone | 375 px product page | e2e | — |
| product-page | Add to basket by keyboard only | Keyboard-only add to basket | e2e | — |
| product-page | Icon buttons have labels | Accessible names of the icon buttons | automated | integration |
| product-page | Filled heart label | Filled heart is labelled Remove from wishlist | automated | integration |
| basket | Basket survives a reload | Basket line survives a reload | automated, e2e | integration |
| basket | Basket survives a reload | Basket survives closing the tab | e2e | — |
| basket | Add a new line | Different size makes a second line | automated | unit |
| basket | Same product and size adds to the line | Same size adds to the quantity | automated | unit |
| basket | Sum over 10 is capped | 8 plus 5 is capped at 10 | automated, e2e | unit |
| basket | Sum over 10 is capped | Adding to a full line keeps 10 | automated | unit |
| basket | Limit message disappears on the next action | Choosing another size hides the limit message | automated | unit |
| basket | Exactly 10 is not capped | 7 plus 3 gives 10 without a message | automated | unit |
| basket | Blocked storage keeps the basket in memory | Blocked storage still adds to the basket | automated, e2e | integration |
| basket | Blocked storage keeps the basket in memory | Full storage behaves like blocked storage | automated | integration |
| basket | Counter shows the sum of quantities | Counter shows units across lines | automated, e2e | integration |
| basket | Counter updates after adding | Counter goes from 3 to 5 without reload | automated, e2e | integration |
| basket | Basket page lists the lines and the total | Two lines and the total | automated, e2e | integration |
| basket | Total with cents | Three at 81.60 gives 244.80 | automated | integration |
| basket | Total with cents | Total in thousands | automated | integration |
| basket | Line name opens the product | Clicking a line name | e2e | — |
| basket | Raise a line quantity | Plus on a line updates all totals | automated, e2e | integration |
| basket | Raise a line quantity | Minus on a line updates all totals | automated | integration |
| basket | Quantity limits on the basket page | Minus inactive at 1 and plus inactive at 10 | automated | integration |
| basket | Remove a line | Removing one of two lines | automated, e2e | integration |
| basket | Price changed after adding | Basket shows the new sale price | automated, e2e | integration |
| basket | Failed check removes nothing | Unreachable backend keeps the basket | automated, e2e | integration |
| basket | Hidden product removed from the basket | Hidden product disappears from the basket page | automated, e2e | integration |
| basket | Deleted size removed from the basket | Deleted size noticed on the catalog | automated, e2e | integration |
| basket | Deleted size removed from the basket | Deleted product removed from the basket | automated, e2e | integration |
| basket | Start page does not check the basket | Start page makes no backend call | e2e | — |
| basket | One message for basket and wishlist | One message when both lose the same product | automated, e2e | integration |
| basket | Placeholders while the basket loads | Two grey lines while prices load | automated | integration |
| basket | Basket error and retry | Basket error then retry | automated, e2e | integration |
| basket | Basket error and retry | Basket answer with status 500 | automated | integration |
| basket | Empty basket page | Empty basket message and link | automated, e2e | integration |
| basket | Last line removed | Removing the last line empties the basket | automated, e2e | integration |
| basket | Basket button labels | Accessible names on a basket line | automated | integration |
| basket | Remove a line by keyboard only | Keyboard-only removal | e2e | — |
| wishlist | Wishlist survives a reload | Wishlist survives a reload | automated, e2e | integration |
| wishlist | Wishlist survives a reload | Product is held once | automated, e2e | integration |
| wishlist | Blocked storage keeps the wishlist in memory | Blocked storage still adds to the wishlist | automated, e2e | integration |
| wishlist | Wishlist page shows the products | Header heart opens the wishlist with two cards | automated, e2e | integration |
| wishlist | Wishlist card opens the product | Clicking a wishlist card | e2e | — |
| wishlist | Removed product leaves the wishlist page | Removed on the product page, gone from the wishlist page | automated, e2e | integration |
| wishlist | Failed check keeps the wishlist | Unreachable backend keeps the wishlist | automated, e2e | integration |
| wishlist | Hidden product removed from the wishlist | Hidden product disappears from the wishlist page | automated, e2e | integration |
| wishlist | Deleted product removed from the wishlist | Deleted product noticed on the catalog | automated, e2e | integration |
| wishlist | Empty wishlist page | Empty wishlist message and link | automated, e2e | integration |
| wishlist | Placeholders while the wishlist loads | Two grey cards while loading | automated | integration |
| wishlist | Wishlist error and retry | Wishlist error then retry | automated, e2e | integration |
| wishlist | Wishlist error and retry | Wishlist answer with status 500 | automated | integration |
| wishlist | Wishlist card photo description | Wishlist card photo text | automated | integration |
| wishlist | Open a wishlist card by keyboard only | Keyboard-only open of a wishlist card | e2e | — |
| site-navigation | Header and footer on the shop pages | Header and footer on five pages | e2e | — |
| site-navigation | Start page unchanged | Start page has no shop header | automated, e2e | integration |
| site-navigation | Header logo | Header logo opens the start page | e2e | — |
| site-navigation | Footer logo | Footer logo opens the start page | e2e | — |
| site-navigation | Perfumes opens the whole catalog | Perfumes from the women's catalog | automated, e2e | integration |
| site-navigation | Category link clears the search and the sort | Women's link resets search, sort and page | automated, e2e | integration |
| site-navigation | Women's perfumes opens the filtered catalog | Women's link from a product page | automated, e2e | integration |
| site-navigation | Women's perfumes opens the filtered catalog | Men's and unisex links | automated, e2e | integration |
| site-navigation | Search from the header | Search chanel from a product page | automated, e2e | integration |
| site-navigation | Search from the header | Search text with capitals | automated, e2e | integration |
| site-navigation | Search keeps the gender and the sort | Search on women's sorted by price | automated, e2e | integration |
| site-navigation | Empty search from the header | Enter on an empty field | automated | integration |
| site-navigation | Basket icon opens the basket | Basket icon from the catalog | e2e | — |
| site-navigation | Heart icon opens the wishlist | Heart icon from a product page | e2e | — |
| site-navigation | Profile icon does nothing | Profile icon click changes nothing | automated | integration |
| site-navigation | Information link does nothing | Blog link click changes nothing | automated | integration |
| site-navigation | Header on a phone | 375 px header | e2e | — |
| site-navigation | Header icon labels | Header icons have accessible names | automated | integration |
| site-navigation | Search by keyboard only | Keyboard-only header search | e2e | — |
