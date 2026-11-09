import pytest

from catalog.models import Product, ProductPhoto, ProductSize, SharedTexts

from .conftest import (
    ADD_URL,
    change_url,
    edit_data,
    make_product,
    new_product_data,
    size_row,
    staff_with,
)

pytestmark = pytest.mark.django_db


def detail(client, slug):
    return client.get(f"/api/products/{slug}/")


# @scenario product-catalog :: Detail of a visible product
# @case product-catalog :: Full detail of a product
def test_full_detail_of_a_product(client, shared_texts):
    shared_texts.shipping = "Delivery in 5 days"
    shared_texts.questions = "How long does a scent last?"
    shared_texts.save()
    product = make_product(
        "Chanel Gabrielle",
        sizes=(
            (15, "20.00", None, False),
            (30, "60.00", "40.00", True),
            (50, "80.00", None, False),
        ),
        rating="4.5",
        description="A floral scent.",
        top_notes="African Marigold, Bergamot, Buchu",
        heart_notes="Cyclamen, Violet",
        base_notes="Cedarwood, Vetiver",
        ingredients="Alcohol Denat., Parfum",
    )
    for position in (1, 2, 3):
        ProductPhoto.objects.create(
            product=product, image=f"products/extra-{position}.png", position=position
        )
    response = detail(client, "chanel-gabrielle")
    body = response.json()
    assert response.status_code == 200
    assert body["name"] == "Chanel Gabrielle"
    assert body["gender"] == "women"
    assert len(body["photos"]) == 4
    assert all(url.startswith("/media/products/") for url in body["photos"])
    first_photo = product.photos.order_by("position", "id").first()
    assert body["photos"][0] == first_photo.image.url
    assert body["photos"][0] not in body["photos"][1:]
    assert body["photos"][1:] == [f"/media/products/extra-{n}.png" for n in (1, 2, 3)]
    assert [s["volume"] for s in body["sizes"]] == [15, 30, 50]
    assert [s["regular_price"] for s in body["sizes"]] == [20, 60, 80]
    assert [s["sale_price"] for s in body["sizes"]] == [None, 40, None]
    assert [s["discount_percent"] for s in body["sizes"]] == [None, 33, None]
    assert [s["is_default"] for s in body["sizes"]] == [False, True, False]
    assert body["rating"] == 4.5
    assert body["description"] == "A floral scent."
    assert body["top_notes"] == "African Marigold, Bergamot, Buchu"
    assert body["heart_notes"] == "Cyclamen, Violet"
    assert body["base_notes"] == "Cedarwood, Vetiver"
    assert body["ingredients"] == "Alcohol Denat., Parfum"
    assert body["shipping"] == "Delivery in 5 days"
    assert body["questions"] == "How long does a scent last?"


# @scenario product-catalog :: Detail without a rating
# @case product-catalog :: Detail of a product without a rating
def test_detail_of_a_product_without_a_rating(client):
    make_product("Creed Aventus", "men")
    body = detail(client, "creed-aventus").json()
    assert body.get("rating") is None


# @scenario product-catalog :: Unknown product
# @case product-catalog :: Unknown short name answers 404
def test_unknown_short_name_answers_404(client):
    assert detail(client, "no-such-perfume").status_code == 404


# @scenario product-catalog :: Hidden product detail is not found
# @case product-catalog :: Hidden product detail answers 404
def test_hidden_product_detail_answers_404(client):
    make_product("Chanel Gabrielle", show_on_site=False)
    assert detail(client, "chanel-gabrielle").status_code == 404


# --- related products --------------------------------------------------------


def related(client, slug):
    return detail(client, slug).json()["related"]


# @scenario product-catalog :: Four related products
# @case product-catalog :: Four related products of the same gender
def test_four_related_products_of_the_same_gender(client):
    make_product("Chanel Gabrielle")
    for i in range(5):
        make_product(f"Women {i}")
    for i in range(3):
        make_product(f"Men {i}", "men")
    items = related(client, "chanel-gabrielle")
    assert len(items) == 4
    assert all(i["gender"] == "women" for i in items)
    assert "chanel-gabrielle" not in [i["slug"] for i in items]
    assert {"slug", "name", "photo", "regular_price", "sale_price"} <= items[0].keys()


# @scenario product-catalog :: Fewer than four related products
# @case product-catalog :: Two unisex products are related
def test_two_unisex_products_are_related(client):
    for i in range(3):
        make_product(f"Unisex {i}", "unisex")
    make_product("Men 0", "men")
    make_product("Women 0", "women")
    items = related(client, "unisex-0")
    assert sorted(i["name"] for i in items) == ["Unisex 1", "Unisex 2"]


# @scenario product-catalog :: No related products
# @case product-catalog :: Only men's product has no related products
def test_only_mens_product_has_no_related_products(client):
    make_product("Creed Aventus", "men")
    for i in range(5):
        make_product(f"Women {i}")
    assert related(client, "creed-aventus") == []


# @scenario product-catalog :: Hidden product is not related
# @case product-catalog :: Hidden women's product is not related
def test_hidden_womens_product_is_not_related(client):
    make_product("Chanel Gabrielle")
    make_product("YSL Libre", show_on_site=False)
    assert related(client, "chanel-gabrielle") == []


# --- task 2.1 leftovers: admin edits seen through the API --------------------


# @scenario product-catalog :: Descriptor line saved and returned
# @case product-catalog :: Descriptor line round-trips through the API
def test_descriptor_line_round_trips_through_the_api(client, superuser):
    product = make_product("Chanel Gabrielle")
    assert "descriptor_line" not in detail(client, "chanel-gabrielle").json()
    response = client.post(
        change_url(product),
        edit_data(product, descriptor_line="Edp | Floral | Gourmand"),
    )
    assert response.status_code == 302
    body = detail(client, "chanel-gabrielle").json()
    assert body["descriptor_line"] == "Edp | Floral | Gourmand"


# @scenario product-catalog :: Product without a descriptor line
# @case product-catalog :: Empty descriptor line is absent from the detail
def test_empty_descriptor_line_is_absent_from_the_detail(client):
    make_product("Creed Aventus", "men")
    assert detail(client, "creed-aventus").json().get("descriptor_line") is None


def edit_shared_texts(client, **fields):
    response = client.post(
        "/admin/catalog/sharedtexts/1/change/",
        {"shipping": "", "questions": "", **fields},
    )
    assert response.status_code == 302, response.status_code


# @scenario product-catalog :: Shared text edited in the admin panel
# @case product-catalog :: New shipping text appears on every product
def test_new_shipping_text_appears_on_every_product(client, superuser, shared_texts):
    shared_texts.shipping = "Delivery in 5 days"
    shared_texts.save()
    make_product("Chanel Gabrielle")
    make_product("Creed Aventus", "men")
    edit_shared_texts(client, shipping="Free delivery over $100")
    for slug in ("chanel-gabrielle", "creed-aventus"):
        assert detail(client, slug).json()["shipping"] == "Free delivery over $100"


# @scenario product-catalog :: Shared text edited in the admin panel
# @case product-catalog :: New questions text appears on every product
def test_new_questions_text_appears_on_every_product(client, superuser, shared_texts):
    make_product("Chanel Gabrielle")
    make_product("Creed Aventus", "men")
    text = "How long does a scent last? Up to 8 hours."
    edit_shared_texts(client, questions=text)
    for slug in ("chanel-gabrielle", "creed-aventus"):
        assert detail(client, slug).json()["questions"] == text
    assert SharedTexts.load().questions == text


# @scenario product-catalog :: Staff user with catalog rights edits a product
# @case product-catalog :: Staff with add right creates a product
def test_staff_created_product_is_listed_by_the_api(client):
    staff_with(client, "view_product", "add_product")
    data = new_product_data(
        name="Versace Eros", sizes=[size_row(100, "220.00", is_default=True)]
    )
    assert client.post(ADD_URL, data).status_code == 302
    listed = client.get("/api/products/").json()
    assert [i["name"] for i in listed["results"]] == ["Versace Eros"]
    assert listed["results"][0]["regular_price"] == 220
    assert detail(client, "versace-eros").status_code == 200


# @scenario product-catalog :: Staff user with catalog rights deletes a product
# @case product-catalog :: Staff with delete right deletes a product
def test_staff_deleted_product_is_gone_from_the_api(client):
    product = make_product("Creed Aventus", "men")
    make_product("Dior Sauvage", "men")
    assert detail(client, "creed-aventus").status_code == 200
    staff_with(client, "view_product", "delete_product")
    response = client.post(
        f"/admin/catalog/product/{product.id}/delete/", {"post": "yes"}
    )
    assert response.status_code == 302
    listed = client.get("/api/products/").json()
    assert [i["name"] for i in listed["results"]] == ["Dior Sauvage"]
    assert detail(client, "creed-aventus").status_code == 404
    assert Product.objects.count() == 1 and ProductSize.objects.count() == 1
