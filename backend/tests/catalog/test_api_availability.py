import pytest

from catalog.models import ProductSize

from .conftest import make_product

pytestmark = pytest.mark.django_db

URL = "/api/products/availability/"


def check(client, items):
    return client.get(URL, {"items": items})


def gabrielle(**fields):
    return make_product(
        "Chanel Gabrielle",
        sizes=(
            (15, "20.00", None, False),
            (30, "60.00", "40.00", True),
            (50, "80.00", None, False),
        ),
        **fields,
    )


# @scenario product-catalog :: Deleted size is reported unavailable
# @case product-catalog :: Existing and missing sizes in one check
def test_existing_and_missing_sizes_in_one_check(client):
    gabrielle()
    response = check(client, "chanel-gabrielle:30,chanel-gabrielle:100")
    assert response.status_code == 200
    ok, missing = response.json()["results"]
    assert ok["available"] is True
    assert (ok["regular_price"], ok["sale_price"]) == (60, 40)
    assert missing == {"item": "chanel-gabrielle:100", "available": False}


# @scenario product-catalog :: Deleted size is reported unavailable
# @case product-catalog :: Size deleted after it was added
def test_size_deleted_after_it_was_added(client):
    gabrielle()
    ProductSize.objects.get(volume=15).delete()
    result = check(client, "chanel-gabrielle:15").json()["results"][0]
    assert result == {"item": "chanel-gabrielle:15", "available": False}


# @scenario product-catalog :: Hidden product is reported unavailable
# @case product-catalog :: Hidden product without a size is unavailable
def test_hidden_product_without_a_size_is_unavailable(client):
    gabrielle(show_on_site=False)
    result = check(client, "chanel-gabrielle").json()["results"][0]
    assert result == {"item": "chanel-gabrielle", "available": False}


# @scenario product-catalog :: Hidden product is reported unavailable
# @case product-catalog :: Hidden product with a size is unavailable
def test_hidden_product_with_a_size_is_unavailable(client):
    gabrielle(show_on_site=False)
    result = check(client, "chanel-gabrielle:30").json()["results"][0]
    assert result == {"item": "chanel-gabrielle:30", "available": False}


# @scenario product-catalog :: Unknown product is reported unavailable
# @case product-catalog :: Unknown product with a size is unavailable
def test_unknown_product_with_a_size_is_unavailable(client):
    response = check(client, "no-such-perfume:50")
    assert response.status_code == 200
    assert response.json()["results"] == [
        {"item": "no-such-perfume:50", "available": False}
    ]


# @scenario product-catalog :: Malformed item is refused
# @case product-catalog :: Volume abc is refused
def test_volume_abc_is_refused(client):
    gabrielle()
    assert check(client, "chanel-gabrielle:abc").status_code == 400


# @scenario product-catalog :: Malformed item is refused
# @case product-catalog :: Item with an empty short name is refused
def test_item_with_an_empty_short_name_is_refused(client):
    assert check(client, ":30").status_code == 400


# @scenario product-catalog :: Missing or empty items are refused
# @case product-catalog :: No items parameter and empty items
def test_no_items_parameter_and_empty_items(client):
    assert client.get(URL).status_code == 400
    assert check(client, "").status_code == 400


# @scenario product-catalog :: Result of a basket item
# @case product-catalog :: Available basket item carries all fields
def test_available_basket_item_carries_all_fields(client):
    gabrielle()
    response = check(client, "chanel-gabrielle:30")
    results = response.json()["results"]
    assert len(results) == 1
    result = results[0]
    assert result["item"] == "chanel-gabrielle:30"
    assert result["available"] is True
    assert result["slug"] == "chanel-gabrielle"
    assert result["name"] == "Chanel Gabrielle"
    assert result["photo"].startswith("/media/products/")
    assert result["volume"] == 30
    assert result["regular_price"] == 60
    assert result["sale_price"] == 40
    assert result["discount_percent"] == 33


# @scenario product-catalog :: Wishlist item without a volume uses the default size
# @case product-catalog :: Item without volume gets the default size
def test_item_without_volume_gets_the_default_size(client):
    make_product(
        "Chanel Gabrielle",
        sizes=((15, "20.00", None, False), (30, "60.00", "40.00", True)),
    )
    result = check(client, "chanel-gabrielle").json()["results"][0]
    assert result["available"] is True
    assert (result["volume"], result["regular_price"], result["sale_price"]) == (
        30,
        60,
        40,
    )


# @scenario product-catalog :: Results keep the request order
# @case product-catalog :: Mixed items keep their order
def test_mixed_items_keep_their_order(client):
    make_product("Dior Sauvage", "men", sizes=((100, "120.00", None, True),))
    gabrielle()
    results = check(
        client, "dior-sauvage:100,no-such-perfume,chanel-gabrielle:30"
    ).json()["results"]
    assert [r["item"] for r in results] == [
        "dior-sauvage:100",
        "no-such-perfume",
        "chanel-gabrielle:30",
    ]
    assert results[1] == {"item": "no-such-perfume", "available": False}


# @scenario product-catalog :: Results keep the request order
# @case product-catalog :: Same item twice gives two results
def test_same_item_twice_gives_two_results(client):
    gabrielle()
    results = check(client, "chanel-gabrielle:30,chanel-gabrielle:30").json()["results"]
    assert [(r["item"], r["available"]) for r in results] == [
        ("chanel-gabrielle:30", True)
    ] * 2


def many_products(count):
    for i in range(count):
        make_product(f"Perfume {i:02d}")
    return ",".join(f"perfume-{i:02d}" for i in range(count))


# @scenario product-catalog :: Exactly 50 items are accepted
# @case product-catalog :: 50 items give 50 results
def test_50_items_give_50_results(client):
    response = check(client, many_products(50))
    assert response.status_code == 200
    assert len(response.json()["results"]) == 50


# @scenario product-catalog :: 51 items are refused
# @case product-catalog :: 51 items are refused with no results
def test_51_items_are_refused_with_no_results(client):
    response = check(client, many_products(51))
    assert response.status_code == 400
    assert not response.json().get("results")


# @scenario product-catalog :: A long basket is checked in several requests
# The case "60 basket lines are checked in two requests" is e2e only; this
# proves its backend half: two checks of 50 and 10 items join in order.
def test_60_items_in_two_checks_join_in_order(client):
    slugs = many_products(60).split(",")
    first = check(client, ",".join(slugs[:50])).json()["results"]
    second = check(client, ",".join(slugs[50:])).json()["results"]
    assert (len(first), len(second)) == (50, 10)
    assert [r["slug"] for r in first + second] == slugs
