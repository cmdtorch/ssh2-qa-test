import datetime as dt
from decimal import Decimal

import pytest
from django.utils import timezone

from catalog.models import Product, SharedTexts

from .conftest import (
    ADD_URL,
    change_url,
    edit_data,
    form_errors,
    make_product,
    new_product_data,
    photo_file,
    size_row,
    staff_with,
)

pytestmark = pytest.mark.django_db

FIVE_MB = 5 * 1024 * 1024


def freeze(monkeypatch, moment):
    monkeypatch.setattr(timezone, "now", lambda: moment)


# --- Product data -----------------------------------------------------------


# @scenario product-catalog :: Product with all data is saved
# @case product-catalog :: Admin saves a product with three sizes
def test_admin_saves_product_with_three_sizes(client, superuser, monkeypatch):
    moment = dt.datetime(2026, 10, 28, 10, 0, tzinfo=dt.UTC)
    freeze(monkeypatch, moment)
    data = new_product_data(
        name="Chanel Gabrielle",
        gender="women",
        sizes=[
            size_row(15, "20.00"),
            size_row(30, "60.00", "40.00", is_default=True),
            size_row(50, "80.00"),
        ],
        photos=[{"image": photo_file(total_size=2 * 1024 * 1024), "position": 0}],
    )
    response = client.post(ADD_URL, data)
    assert response.status_code == 302
    product = Product.objects.get()
    assert product.sizes.count() == 3
    assert [s.volume for s in product.sizes.filter(is_default=True)] == [30]
    assert product.photos.count() == 1
    assert abs(product.date_added - moment) < dt.timedelta(minutes=1)


# @scenario product-catalog :: Date added does not change on edit
# @case product-catalog :: Editing the description keeps the date added
def test_editing_description_keeps_date_added(client, superuser, monkeypatch):
    saved_at = dt.datetime(2026, 10, 27, 10, 0, tzinfo=dt.UTC)
    freeze(monkeypatch, saved_at)
    product = make_product()
    freeze(monkeypatch, dt.datetime(2026, 10, 28, 12, 0, tzinfo=dt.UTC))
    response = client.post(
        change_url(product), edit_data(product, description="New text")
    )
    assert response.status_code == 302
    product.refresh_from_db()
    assert product.description == "New text"
    assert product.date_added == saved_at


# --- Descriptor line (model level; the API part belongs to the detail tests) --


# @scenario product-catalog :: Descriptor line saved and returned
def test_descriptor_line_is_stored_as_entered(client, superuser):
    product = make_product()
    client.post(
        change_url(product),
        edit_data(product, descriptor_line="Edp | Floral | Gourmand"),
    )
    product.refresh_from_db()
    assert product.descriptor_line == "Edp | Floral | Gourmand"


# @scenario product-catalog :: Product without a descriptor line
def test_descriptor_line_is_optional(client, superuser):
    response = client.post(ADD_URL, new_product_data(name="Creed Aventus"))
    assert response.status_code == 302
    assert Product.objects.get().descriptor_line == ""


# --- Required product fields -------------------------------------------------


def assert_refused(response, field=None, message=None):
    errors, messages = form_errors(response)
    assert Product.objects.count() == 0 or message is not None
    if field:
        assert field in errors
    if message:
        assert message in messages
    return errors, messages


# @scenario product-catalog :: Product without a name is refused
# @case product-catalog :: Empty name is refused
def test_empty_name_is_refused(client, superuser):
    response = client.post(ADD_URL, new_product_data(name=""))
    errors, _ = form_errors(response)
    assert errors["name"] == ["This field is required."]
    assert Product.objects.count() == 0


# @scenario product-catalog :: Product with a name of only spaces is refused
# @case product-catalog :: Name of only spaces is refused
def test_name_of_only_spaces_is_refused(client, superuser):
    response = client.post(ADD_URL, new_product_data(name="   "))
    errors, _ = form_errors(response)
    assert errors["name"] == ["This field is required."]
    assert Product.objects.count() == 0


# @scenario product-catalog :: Product without a gender is refused
# @case product-catalog :: Missing gender is refused
def test_missing_gender_is_refused(client, superuser):
    response = client.post(ADD_URL, new_product_data(gender=""))
    errors, _ = form_errors(response)
    assert errors["gender"] == ["This field is required."]
    assert Product.objects.count() == 0


# @scenario product-catalog :: Product without a photo is refused
# @case product-catalog :: Product with no photo is refused
def test_product_without_photo_is_refused(client, superuser):
    response = client.post(ADD_URL, new_product_data(photos=[]))
    _, messages = form_errors(response)
    assert messages == ["A product needs at least one photo."]
    assert Product.objects.count() == 0


# @scenario product-catalog :: Product without a photo is refused
# @case product-catalog :: Removing the last photo of an existing product is refused
def test_removing_last_photo_is_refused(client, superuser):
    product = make_product(name="Creed Aventus", gender="men")
    data = edit_data(product)
    data["photos-0-DELETE"] = "on"
    response = client.post(change_url(product), data)
    _, messages = form_errors(response)
    assert messages == ["A product needs at least one photo."]
    assert product.photos.count() == 1


# @scenario product-catalog :: Product without a size is refused
# @case product-catalog :: Product with no size is refused
def test_product_without_size_is_refused(client, superuser):
    response = client.post(ADD_URL, new_product_data(sizes=[]))
    _, messages = form_errors(response)
    assert messages == ["A product needs at least one size."]
    assert Product.objects.count() == 0


# @scenario product-catalog :: Product without a default size is refused
# @case product-catalog :: Two sizes and no default are refused
def test_two_sizes_and_no_default_are_refused(client, superuser):
    sizes = [size_row(50, "100.00"), size_row(100, "150.00")]
    response = client.post(ADD_URL, new_product_data(sizes=sizes))
    _, messages = form_errors(response)
    assert messages == ["Exactly one size must be the default."]
    assert Product.objects.count() == 0


# @scenario product-catalog :: Product with two default sizes is refused
# @case product-catalog :: Two default sizes are refused
def test_two_default_sizes_are_refused(client, superuser):
    sizes = [
        size_row(50, "100.00", is_default=True),
        size_row(100, "150.00", is_default=True),
    ]
    response = client.post(ADD_URL, new_product_data(sizes=sizes))
    _, messages = form_errors(response)
    assert messages == ["Exactly one size must be the default."]
    assert Product.objects.count() == 0


def set_default_sale_price(client, sale_price):
    product = make_product()
    data = edit_data(product)
    data["sizes-0-sale_price"] = sale_price
    return product, client.post(change_url(product), data)


SALE_MESSAGE = "The sale price must be lower than the regular price."


# @scenario product-catalog :: Sale price equal to the regular price is refused
# @case product-catalog :: Sale price equal to the regular price
def test_sale_price_equal_to_regular_is_refused(client, superuser):
    product, response = set_default_sale_price(client, "60.00")
    _, messages = form_errors(response)
    assert messages == [SALE_MESSAGE]
    assert product.sizes.get().sale_price is None


# @scenario product-catalog :: Sale price equal to the regular price is refused
# @case product-catalog :: Sale price one cent below the regular price is accepted
def test_sale_price_one_cent_below_is_accepted(client, superuser):
    product, response = set_default_sale_price(client, "59.99")
    assert response.status_code == 302
    assert product.sizes.get().sale_price == Decimal("59.99")


# @scenario product-catalog :: Sale price above the regular price is refused
# @case product-catalog :: Sale price above the regular price
def test_sale_price_above_regular_is_refused(client, superuser):
    product, response = set_default_sale_price(client, "70.00")
    _, messages = form_errors(response)
    assert messages == [SALE_MESSAGE]
    assert product.sizes.get().sale_price is None


# --- Unique size volumes -----------------------------------------------------


# @scenario product-catalog :: Two sizes with the same volume are refused
# @case product-catalog :: Duplicate 30 ml sizes are refused
def test_duplicate_volumes_are_refused(client, superuser):
    product = make_product(sizes=())
    data = edit_data(
        product,
        extra_sizes=[
            size_row(30, "40.00", is_default=True),
            size_row(30, "50.00"),
        ],
    )
    response = client.post(change_url(product), data)
    _, messages = form_errors(response)
    assert messages == ["Each size must have a different volume."]
    assert product.sizes.count() == 0


# --- Product short name ------------------------------------------------------


# @scenario product-catalog :: Short name filled in from the name
# @case product-catalog :: Short name is generated from the name
def test_short_name_is_generated_from_name(client, superuser):
    response = client.post(ADD_URL, new_product_data(name="Chanel Gabrielle"))
    assert response.status_code == 302
    assert Product.objects.get().slug == "chanel-gabrielle"


# @scenario product-catalog :: Short name filled in from the name
# @case product-catalog :: Name with punctuation gives a clean short name
def test_short_name_from_name_with_punctuation(client, superuser):
    response = client.post(ADD_URL, new_product_data(name="Dior J'adore No. 5"))
    assert response.status_code == 302
    assert Product.objects.get().slug == "dior-jadore-no-5"


# @scenario product-catalog :: Duplicate short name is refused
# @case product-catalog :: Second product with the same short name is refused
def test_duplicate_short_name_is_refused(client, superuser):
    make_product(name="Chanel Gabrielle")
    response = client.post(
        ADD_URL, new_product_data(name="Another", slug="chanel-gabrielle")
    )
    errors, _ = form_errors(response)
    assert errors["slug"] == ["This short name is already taken."]
    assert Product.objects.count() == 1


# @scenario product-catalog :: Reserved short name is refused
# @case product-catalog :: Short name availability is refused
def test_reserved_short_name_is_refused(client, superuser):
    response = client.post(ADD_URL, new_product_data(slug="availability"))
    errors, _ = form_errors(response)
    assert errors["slug"] == ["This short name is reserved."]
    assert Product.objects.count() == 0


# --- Product photo uploads ---------------------------------------------------


def add_photo(client, file):
    product = make_product()
    data = edit_data(product, extra_photos=[{"image": file, "position": 1}])
    return product, client.post(change_url(product), data)


# @scenario product-catalog :: Valid photo is accepted
# @case product-catalog :: 2 MB PNG photo is accepted
def test_2mb_png_is_accepted(client, superuser):
    product, response = add_photo(client, photo_file(total_size=2 * 1024 * 1024))
    assert response.status_code == 302
    assert product.photos.count() == 2


# @scenario product-catalog :: Valid photo is accepted
# @case product-catalog :: Photo of exactly 5 MB is accepted
def test_photo_of_exactly_5mb_is_accepted(client, superuser):
    file = photo_file("photo.webp", "WEBP", total_size=FIVE_MB)
    product, response = add_photo(client, file)
    assert response.status_code == 302
    assert product.photos.count() == 2


SIZE_MESSAGE = "The photo must be at most 5 MB."
FORMAT_MESSAGE = "Only JPG, PNG or WebP are allowed."


# @scenario product-catalog :: Photo over 5 MB is refused
# @case product-catalog :: 6 MB JPG photo is refused
def test_6mb_jpg_is_refused(client, superuser):
    file = photo_file("photo.jpg", "JPEG", total_size=6 * 1024 * 1024)
    product, response = add_photo(client, file)
    _, messages = form_errors(response)
    assert messages == [SIZE_MESSAGE]
    assert product.photos.count() == 1


# @scenario product-catalog :: Photo over 5 MB is refused
# @case product-catalog :: Photo one byte over 5 MB is refused
def test_photo_one_byte_over_5mb_is_refused(client, superuser):
    file = photo_file("photo.jpg", "JPEG", total_size=FIVE_MB + 1)
    product, response = add_photo(client, file)
    _, messages = form_errors(response)
    assert messages == [SIZE_MESSAGE]
    assert product.photos.count() == 1


# @scenario product-catalog :: Photo in another format is refused
# @case product-catalog :: GIF photo is refused
def test_gif_is_refused(client, superuser):
    file = photo_file("photo.gif", "GIF", total_size=100 * 1024)
    product, response = add_photo(client, file)
    _, messages = form_errors(response)
    assert messages == [FORMAT_MESSAGE]
    assert product.photos.count() == 1


# @scenario product-catalog :: Photo in another format is refused
# @case product-catalog :: Text file renamed to .png is refused
def test_text_file_named_png_is_refused(client, superuser):
    from django.core.files.uploadedfile import SimpleUploadedFile

    file = SimpleUploadedFile("photo.png", b"just some plain text")
    product, response = add_photo(client, file)
    _, messages = form_errors(response)
    assert messages == [FORMAT_MESSAGE]
    assert product.photos.count() == 1


# --- Product rating ----------------------------------------------------------


def set_rating(client, rating, product=None):
    product = product or make_product()
    response = client.post(change_url(product), edit_data(product, rating=rating))
    product.refresh_from_db()
    return product, response


# @scenario product-catalog :: Valid rating is accepted
# @case product-catalog :: Rating 4.5 is accepted
def test_rating_4_5_is_accepted(client, superuser):
    product, response = set_rating(client, "4.5")
    assert response.status_code == 302
    assert product.rating == Decimal("4.5")


# @scenario product-catalog :: Valid rating is accepted
# @case product-catalog :: Rating bounds 0 and 5 are accepted
def test_rating_bounds_are_accepted(client, superuser):
    product, response = set_rating(client, "0")
    assert response.status_code == 302
    assert product.rating == Decimal("0")
    product, response = set_rating(client, "5", product)
    assert response.status_code == 302
    assert product.rating == Decimal("5")


# @scenario product-catalog :: Valid rating is accepted
# @case product-catalog :: Clearing the rating is accepted
def test_clearing_the_rating_is_accepted(client, superuser):
    product = make_product(rating=Decimal("4"))
    product, response = set_rating(client, "", product)
    assert response.status_code == 302
    assert product.rating is None


# @scenario product-catalog :: Rating out of range is refused
# @case product-catalog :: Rating 5.5 is refused
def test_rating_5_5_is_refused(client, superuser):
    product, response = set_rating(client, "5.5")
    errors, _ = form_errors(response)
    assert errors["rating"] == ["The rating must be from 0 to 5."]
    assert product.rating is None


# @scenario product-catalog :: Rating out of range is refused
# @case product-catalog :: Negative rating is refused
def test_negative_rating_is_refused(client, superuser):
    product, response = set_rating(client, "-0.5")
    errors, _ = form_errors(response)
    assert errors["rating"] == ["The rating must be from 0 to 5."]
    assert product.rating is None


# @scenario product-catalog :: Rating off the half-step is refused
# @case product-catalog :: Rating 4.3 is refused
def test_rating_4_3_is_refused(client, superuser):
    product, response = set_rating(client, "4.3")
    errors, _ = form_errors(response)
    assert errors["rating"] == ["The rating must be in steps of 0.5."]
    assert product.rating is None


# --- Shared texts ------------------------------------------------------------

SHARED_URL = "/admin/catalog/sharedtexts/1/change/"


# @scenario product-catalog :: Shared text edited in the admin panel
def test_shared_texts_are_edited_in_the_admin(client, superuser, shared_texts):
    shared_texts.shipping = "Delivery in 5 days"
    shared_texts.save()
    response = client.post(
        SHARED_URL,
        {"shipping": "Free delivery over $100", "questions": "Up to 8 hours."},
    )
    assert response.status_code == 302
    texts = SharedTexts.load()
    assert SharedTexts.objects.count() == 1
    assert texts.shipping == "Free delivery over $100"
    assert texts.questions == "Up to 8 hours."


# --- Catalog management permissions -----------------------------------------


# @scenario product-catalog :: Staff user with catalog rights edits a product
# @case product-catalog :: Staff with change right renames a product
def test_staff_with_change_right_renames_a_product(client):
    product = make_product(name="Creed Aventus", gender="men")
    staff_with(client, "view_product", "change_product")
    response = client.post(
        change_url(product), edit_data(product, name="Creed Aventus 2026")
    )
    assert response.status_code == 302
    product.refresh_from_db()
    assert product.name == "Creed Aventus 2026"
    assert product.sizes.count() == 1


# @scenario product-catalog :: Staff user with catalog rights edits a product
# @case product-catalog :: Staff with add right creates a product
def test_staff_with_add_right_creates_a_product(client):
    staff_with(client, "view_product", "add_product")
    data = new_product_data(
        name="Versace Eros", sizes=[size_row(100, "220.00", is_default=True)]
    )
    response = client.post(ADD_URL, data)
    assert response.status_code == 302
    product = Product.objects.get()
    assert product.name == "Versace Eros"
    assert product.photos.count() == 1
    assert product.sizes.get().regular_price == Decimal("220.00")


# @scenario product-catalog :: Staff user with catalog rights deletes a product
# @case product-catalog :: Staff with delete right deletes a product
def test_staff_with_delete_right_deletes_a_product(client):
    product = make_product(name="Creed Aventus", gender="men")
    staff_with(client, "view_product", "delete_product")
    response = client.post(
        f"/admin/catalog/product/{product.id}/delete/", {"post": "yes"}
    )
    assert response.status_code == 302
    assert not Product.objects.filter(slug="creed-aventus").exists()


# @scenario product-catalog :: Staff user without catalog rights cannot edit
# @case product-catalog :: Staff without catalog rights sees no catalog
def test_staff_without_catalog_rights_sees_no_catalog(client):
    product = make_product(name="Creed Aventus", gender="men")
    staff_with(client)
    home = client.get("/admin/")
    assert home.status_code == 200
    assert b"Catalog" not in home.content
    assert client.get(change_url(product)).status_code == 403


# @scenario product-catalog :: Staff user without catalog rights cannot edit
# @case product-catalog :: Staff with view right only cannot save changes
def test_staff_with_view_right_only_cannot_save(client):
    product = make_product(name="Creed Aventus", gender="men")
    staff_with(client, "view_product")
    response = client.post(change_url(product), edit_data(product, name="Hacked"))
    assert response.status_code == 403
    product.refresh_from_db()
    assert product.name == "Creed Aventus"


# @scenario product-catalog :: Staff user without catalog rights cannot edit
# @case product-catalog :: Staff without catalog rights cannot change the shared texts
def test_staff_without_rights_cannot_change_shared_texts(client, shared_texts):
    shared_texts.shipping = "Delivery in 5 days"
    shared_texts.save()
    staff_with(client)
    response = client.post(SHARED_URL, {"shipping": "Free delivery", "questions": ""})
    assert response.status_code == 403
    assert SharedTexts.load().shipping == "Delivery in 5 days"
