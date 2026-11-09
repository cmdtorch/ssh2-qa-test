import datetime as dt
import time
from decimal import Decimal

import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext

from catalog.models import Product, ProductPhoto, ProductSize

from .conftest import make_product

pytestmark = pytest.mark.django_db

LIST_URL = "/api/products/"


def names(response):
    return [item["name"] for item in response.json()["results"]]


def get(client, **params):
    return client.get(LIST_URL, params)


def priced(name, regular, sale=None, **kwargs):
    return make_product(name, sizes=((30, regular, sale, True),), **kwargs)


def set_added(product, *args):
    Product.objects.filter(pk=product.pk).update(
        date_added=dt.datetime(*args, tzinfo=dt.UTC)
    )


def bulk_products(count, gender="women", prefix="Perfume"):
    """Many visible products fast, with one default size and one photo each."""
    start = Product.objects.count()
    Product.objects.bulk_create(
        Product(
            name=f"{prefix} {start + i:04d}",
            slug=f"{prefix.lower()}-{start + i:04d}",
            gender=gender(start + i) if callable(gender) else gender,
        )
        for i in range(count)
    )
    products = list(Product.objects.filter(slug__startswith=prefix.lower()))
    ProductSize.objects.bulk_create(
        ProductSize(
            product=p,
            volume=30,
            regular_price=Decimal(50 + p.id % 100),
            is_default=True,
        )
        for p in products
    )
    ProductPhoto.objects.bulk_create(
        ProductPhoto(product=p, image=f"products/{p.slug}.png") for p in products
    )


# --- hidden products ---------------------------------------------------------


# @scenario product-catalog :: Hidden product is not listed
# @case product-catalog :: Hidden product is left out of the list and the count
def test_hidden_product_is_left_out_of_list_and_count(client):
    for name in ("Dior Sauvage", "Creed Aventus", "Versace Eros"):
        make_product(name)
    make_product("Chanel Gabrielle", show_on_site=False)
    body = get(client).json()
    assert "Chanel Gabrielle" not in [i["name"] for i in body["results"]]
    assert len(body["results"]) == 3
    assert body["total"] == 3


# @scenario product-catalog :: Hidden product is not listed
# @case product-catalog :: Showing the product again lists it
def test_showing_the_product_again_lists_it(client):
    product = make_product("Chanel Gabrielle", show_on_site=False)
    assert names(get(client)) == []
    Product.objects.filter(pk=product.pk).update(show_on_site=True)
    assert names(get(client)) == ["Chanel Gabrielle"]


# @scenario product-catalog :: Hidden product is not found by search
# @case product-catalog :: Search does not find a hidden product
def test_search_does_not_find_a_hidden_product(client):
    make_product("Chanel Gabrielle", show_on_site=False)
    body = get(client, q="gabrielle").json()
    assert body["results"] == []
    assert body["total"] == 0


# --- list shape and paging ---------------------------------------------------


# @scenario product-catalog :: First page of a large catalog
# @case product-catalog :: 500 products give 32 pages of 16
def test_500_products_give_32_pages_of_16(client):
    bulk_products(500)
    response = get(client)
    body = response.json()
    assert response.status_code == 200
    assert len(body["results"]) == 16
    assert (body["total"], body["pages"], body["page"]) == (500, 32, 1)


# @scenario product-catalog :: First page of a large catalog
# @case product-catalog :: Exactly 16 products give one page
def test_16_products_give_one_page(client):
    bulk_products(16)
    body = get(client).json()
    assert len(body["results"]) == 16
    assert body["pages"] == 1


# @scenario product-catalog :: First page of a large catalog
# @case product-catalog :: 17 products give two pages
def test_17_products_give_two_pages(client):
    bulk_products(17)
    body = get(client, page=2).json()
    assert len(body["results"]) == 1
    assert (body["pages"], body["page"]) == (2, 2)


# @scenario product-catalog :: List item shows the default size prices
# @case product-catalog :: List item carries the default size prices and discount
def test_list_item_carries_default_size_prices_and_discount(client):
    make_product(
        "Chanel Gabrielle",
        sizes=((15, "20.00", None, False), (30, "60.00", "40.00", True)),
    )
    item = get(client).json()["results"][0]
    assert item["regular_price"] == 60
    assert item["sale_price"] == 40
    assert item["discount_percent"] == 33
    assert item["slug"] == "chanel-gabrielle"
    assert item["name"] == "Chanel Gabrielle"
    assert item["gender"] == "women"
    assert item["photo"].startswith("/media/products/")


# @scenario product-catalog :: List item without a discount
# @case product-catalog :: List item without a sale price
def test_list_item_without_a_sale_price(client):
    make_product("Creed Aventus", "men", sizes=((100, "150.00", None, True),))
    item = get(client).json()["results"][0]
    assert item["regular_price"] == 150
    assert item["sale_price"] is None
    assert item["discount_percent"] is None


# @scenario product-catalog :: Empty catalog
# @case product-catalog :: Empty catalog answers an empty list
def test_empty_catalog_answers_an_empty_list(client):
    response = get(client)
    assert response.status_code == 200
    assert response.json()["results"] == []
    assert response.json()["total"] == 0


# @scenario product-catalog :: Empty catalog
# @case product-catalog :: Catalog with only hidden products is empty
def test_catalog_with_only_hidden_products_is_empty(client):
    make_product("Chanel Gabrielle", show_on_site=False)
    make_product("Creed Aventus", "men", show_on_site=False)
    body = get(client).json()
    assert body["results"] == []
    assert body["total"] == 0


# --- discount percentage -----------------------------------------------------


@pytest.mark.parametrize(
    "regular, sale, expected",
    [("136.00", "81.60", 40), ("60.00", "40.00", 33), ("200.00", "198.80", 1)]
    + [("60.00", "20.00", 67)],
)
def test_discount_percent_of_the_default_size(client, regular, sale, expected):
    priced("Chanel Gabrielle", regular, sale)
    assert get(client).json()["results"][0]["discount_percent"] == expected


# @scenario product-catalog :: Whole discount percentage
# @case product-catalog :: 136 to 81.60 is 40 percent
def test_136_to_81_60_is_40_percent(client):
    priced("Chanel Gabrielle", "136.00", "81.60")
    assert get(client).json()["results"][0]["discount_percent"] == 40


# @scenario product-catalog :: Rounded discount percentage
# @case product-catalog :: 60 to 40 rounds down to 33
def test_60_to_40_rounds_down_to_33(client):
    priced("Chanel Gabrielle", "60.00", "40.00")
    assert get(client).json()["results"][0]["discount_percent"] == 33


# @scenario product-catalog :: Rounded discount percentage
# @case product-catalog :: Under one percent rounds up to 1
def test_under_one_percent_rounds_up_to_1(client):
    priced("Chanel Gabrielle", "200.00", "198.80")
    assert get(client).json()["results"][0]["discount_percent"] == 1


# @scenario product-catalog :: Rounded discount percentage
# @case product-catalog :: 66.67 percent rounds up to 67
def test_66_67_percent_rounds_up_to_67(client):
    priced("Chanel Gabrielle", "60.00", "20.00")
    assert get(client).json()["results"][0]["discount_percent"] == 67


# --- gender filter -----------------------------------------------------------


def mixed(women=0, men=0, unisex=0):
    for gender, count in (("women", women), ("men", men), ("unisex", unisex)):
        for i in range(count):
            make_product(f"{gender.title()} {i}", gender)


# @scenario product-catalog :: Women's filter
# @case product-catalog :: Women's filter returns only women's products
def test_womens_filter_returns_only_womens_products(client):
    mixed(women=3, men=2, unisex=1)
    body = get(client, gender="women").json()
    assert sorted(names(get(client, gender="women"))) == [
        "Women 0",
        "Women 1",
        "Women 2",
    ]
    assert body["total"] == 3


# @scenario product-catalog :: Men's filter excludes unisex
# @case product-catalog :: Men's filter leaves out unisex
def test_mens_filter_leaves_out_unisex(client):
    mixed(men=2, unisex=1)
    assert sorted(names(get(client, gender="men"))) == ["Men 0", "Men 1"]


# @scenario product-catalog :: Men's filter excludes unisex
# @case product-catalog :: Unisex filter returns only unisex
def test_unisex_filter_returns_only_unisex(client):
    mixed(women=2, men=2, unisex=1)
    assert names(get(client, gender="unisex")) == ["Unisex 0"]


# @scenario product-catalog :: Unknown gender value
# @case product-catalog :: Gender kids answers 400
def test_gender_kids_answers_400(client):
    mixed(women=1)
    assert get(client, gender="kids").status_code == 400


# --- search ------------------------------------------------------------------


# @scenario product-catalog :: Search by part of the name ignoring case
# @case product-catalog :: Lowercase search finds capitalised names
def test_lowercase_search_finds_capitalised_names(client):
    for name in ("Chanel Gabrielle", "Chanel No. 5", "Dior Sauvage"):
        make_product(name)
    found = names(get(client, q="chanel"))
    assert sorted(found) == ["Chanel Gabrielle", "Chanel No. 5"]


# @scenario product-catalog :: Search by part of the name ignoring case
# @case product-catalog :: Uppercase search in the middle of a name
def test_uppercase_search_in_the_middle_of_a_name(client):
    make_product("Chanel Gabrielle")
    make_product("Dior Sauvage")
    assert names(get(client, q="SAUV")) == ["Dior Sauvage"]


# @scenario product-catalog :: Empty search returns everything
# @case product-catalog :: Empty q returns all products
def test_empty_q_returns_all_products(client):
    bulk_products(20)
    assert get(client, q="").json()["total"] == 20


# @scenario product-catalog :: Search combined with the gender filter
# @case product-catalog :: Search chanel within men's
def test_search_chanel_within_mens(client):
    make_product("Chanel Gabrielle", "women")
    make_product("Bleu de Chanel", "men")
    assert names(get(client, q="chanel", gender="men")) == ["Bleu de Chanel"]


# @scenario product-catalog :: Search with no match
# @case product-catalog :: Search zzz finds nothing
def test_search_zzz_finds_nothing(client):
    make_product("Chanel Gabrielle")
    response = get(client, q="zzz")
    assert response.status_code == 200
    assert response.json()["results"] == []
    assert response.json()["total"] == 0


# --- sorting -----------------------------------------------------------------


def three_added_in_order():
    products = [
        priced("A", "50.00"),
        priced("B", "60.00", "40.00"),
        priced("C", "45.00"),
    ]
    for day, product in enumerate(products, start=1):
        set_added(product, 2026, 10, day)


# @scenario product-catalog :: Default sorting is newest first
# @case product-catalog :: No sort parameter gives newest first
def test_no_sort_parameter_gives_newest_first(client):
    three_added_in_order()
    assert names(get(client)) == ["C", "B", "A"]


# @scenario product-catalog :: Default sorting is newest first
# @case product-catalog :: Sort new gives newest first
def test_sort_new_gives_newest_first(client):
    three_added_in_order()
    assert names(get(client, sort="new")) == ["C", "B", "A"]


# @scenario product-catalog :: Price low to high uses the sale price
# @case product-catalog :: Ascending price uses the sale price
def test_ascending_price_uses_the_sale_price(client):
    three_added_in_order()
    assert names(get(client, sort="price-asc")) == ["B", "C", "A"]


# @scenario product-catalog :: Price high to low
# @case product-catalog :: Descending price uses the sale price
def test_descending_price_uses_the_sale_price(client):
    three_added_in_order()
    assert names(get(client, sort="price-desc")) == ["A", "C", "B"]


# @scenario product-catalog :: Equal prices are ordered by name
# @case product-catalog :: Equal prices ordered A to Z
def test_equal_prices_are_ordered_a_to_z(client):
    priced("YSL Libre", "220.00")
    priced("Acqua di Gio", "220.00")
    assert names(get(client, sort="price-asc")) == ["Acqua di Gio", "YSL Libre"]


# @scenario product-catalog :: Equal prices are ordered by name
# @case product-catalog :: Same date added ordered A to Z
def test_same_date_added_ordered_a_to_z(client):
    for name in ("Versace Eros", "Dior Sauvage"):
        set_added(make_product(name), 2026, 10, 1)
    assert names(get(client, sort="new")) == ["Dior Sauvage", "Versace Eros"]


# @scenario product-catalog :: Equal prices are ordered by name
# @case product-catalog :: Ties stay stable across pages
def test_ties_stay_stable_across_pages(client):
    for i in range(20):
        priced(f"Perfume {i:02d}", "100.00")
    both = names(get(client, sort="price-asc", page=1)) + names(
        get(client, sort="price-asc", page=2)
    )
    assert both == [f"Perfume {i:02d}" for i in range(20)]


# @scenario product-catalog :: Unknown sort value
# @case product-catalog :: Sort rating answers 400
def test_sort_rating_answers_400(client):
    priced("A", "50.00")
    assert get(client, sort="rating").status_code == 400


# --- parameters --------------------------------------------------------------


# @scenario product-catalog :: Parameters combined
# @case product-catalog :: All four parameters together
def test_all_four_parameters_together(client):
    priced("Chanel Gabrielle", "40.00")
    priced("Chanel No. 5", "120.00")
    priced("Bleu de Chanel", "78.00", gender="men")
    priced("Dior J'adore", "92.40")
    response = get(client, gender="women", sort="price-asc", q="chanel", page=1)
    assert response.status_code == 200
    assert names(response) == ["Chanel Gabrielle", "Chanel No. 5"]


# @scenario product-catalog :: Invalid page number returns page 1
# @case product-catalog :: Pages 0, -1 and abc return page 1
@pytest.mark.parametrize("page", ["0", "-1", "abc"])
def test_invalid_page_returns_page_1(client, page):
    bulk_products(40)
    response = get(client, page=page)
    assert response.status_code == 200
    assert response.json()["page"] == 1
    assert len(response.json()["results"]) == 16


# @scenario product-catalog :: Empty gender and sort are ignored
# @case product-catalog :: Empty gender and sort give the whole catalog
def test_empty_gender_and_sort_give_the_whole_catalog(client):
    letters = "ABCDEF"
    genders = ["women", "women", "men", "men", "unisex", "unisex"]
    for i, (letter, gender) in enumerate(zip(letters, genders, strict=True), start=1):
        set_added(make_product(letter, gender), 2026, 10, i)
    response = get(client, gender="", sort="")
    assert response.status_code == 200
    assert names(response) == list("FEDCBA")


# @scenario product-catalog :: Empty gender and sort are ignored
# @case product-catalog :: Empty gender with a valid sort
def test_empty_gender_with_a_valid_sort(client):
    genders = ["women", "men", "unisex", "women", "men", "unisex"]
    for i, (price, gender) in enumerate(
        zip(["50", "60", "45", "70", "55", "40"], genders, strict=True)
    ):
        priced(f"P{i}", f"{price}.00", gender=gender)
    response = get(client, gender="", sort="price-asc")
    assert response.status_code == 200
    assert [i["regular_price"] for i in response.json()["results"]] == [
        40,
        45,
        50,
        55,
        60,
        70,
    ]


# @scenario product-catalog :: Page 99 of 3
# @case product-catalog :: Page 99 returns the last page
def test_page_99_returns_the_last_page(client):
    bulk_products(40)
    response = get(client, page=99)
    assert response.status_code == 200
    assert response.json()["page"] == 3
    assert len(response.json()["results"]) == 8


# @scenario product-catalog :: Page 99 of 3
# @case product-catalog :: Page beyond the last of an empty result
def test_page_beyond_the_last_of_an_empty_result(client):
    make_product("Chanel Gabrielle")
    response = get(client, q="zzz", page=5)
    assert response.status_code == 200
    assert response.json()["results"] == []
    assert response.json()["total"] == 0


# --- speed -------------------------------------------------------------------


def timed(client, **params):
    started = time.perf_counter()
    response = get(client, **params)
    return response, (time.perf_counter() - started) * 1000


# @scenario product-catalog :: List answers fast with 500 products
# @case product-catalog :: Filtered sorted page answers within 500 ms
def test_filtered_sorted_page_answers_within_500_ms(client):
    bulk_products(500, gender=lambda i: "women" if i % 2 == 0 else "men")
    params = {"gender": "women", "sort": "price-asc", "page": 10}
    get(client, **params)  # warm-up
    with CaptureQueriesContext(connection) as queries:
        response, elapsed = timed(client, **params)
    assert response.status_code == 200
    assert response.json()["total"] == 250
    assert len(response.json()["results"]) == 16
    assert elapsed < 500
    assert len(queries) <= 3  # page + count (+ nothing per product)


# @scenario product-catalog :: List answers fast with 500 products
# @case product-catalog :: Search over 500 products answers within 500 ms
def test_search_over_500_products_answers_within_500_ms(client):
    bulk_products(250, prefix="Chanel")
    bulk_products(250, prefix="Dior")
    get(client, q="chanel", sort="new")  # warm-up
    response, elapsed = timed(client, q="chanel", sort="new")
    assert response.status_code == 200
    assert response.json()["total"] == 250
    assert elapsed < 500
