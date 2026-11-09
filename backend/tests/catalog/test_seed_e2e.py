from decimal import Decimal

import pytest
from django.core.management import CommandError, call_command

from catalog.models import Product, ProductPhoto, ProductSize, SharedTexts


def seed(*args):
    call_command("seed_e2e", *args)


@pytest.fixture
def seeded(db):
    seed()


def detail(client, slug):
    return client.get(f"/api/products/{slug}/")


def test_seed_creates_named_products_with_sizes_and_photos(client, seeded):
    body = detail(client, "chanel-gabrielle").json()
    assert body["name"] == "Chanel Gabrielle"
    assert [s["volume"] for s in body["sizes"]] == [15, 30, 50]
    assert [s["regular_price"] for s in body["sizes"]] == [20, 60, 80]
    assert [s["sale_price"] for s in body["sizes"]] == [None, 40, None]
    assert [s["is_default"] for s in body["sizes"]] == [False, True, False]
    for slug in ("dior-sauvage", "creed-aventus", "burberry-goddess"):
        assert detail(client, slug).status_code == 200
    goddess = Product.objects.get(slug="burberry-goddess")
    default = goddess.sizes.get(is_default=True)
    assert (default.regular_price, default.sale_price) == (136, Decimal("81.60"))
    assert all(p.photos.exists() for p in Product.objects.all())
    assert SharedTexts.load().shipping


def test_seed_is_idempotent(seeded):
    counts = (Product.objects.count(), ProductSize.objects.count())
    photos = ProductPhoto.objects.count()
    seed()
    assert (Product.objects.count(), ProductSize.objects.count()) == counts
    assert ProductPhoto.objects.count() == photos


def test_bulk_adds_visible_products_of_the_gender(client, seeded):
    before = Product.objects.filter(gender="women").count()
    seed("--bulk", "20", "--gender", "women")
    assert Product.objects.filter(gender="women").count() == before + 20
    seed("--bulk", "20", "--gender", "women")
    assert Product.objects.filter(gender="women").count() == before + 20
    assert client.get("/api/products/", {"gender": "women"}).json()["total"] >= 20


def test_bulk_volume_sets_the_size_of_bulk_products(client, seeded):
    seed("--bulk", "2", "--bulk-volume", "30")
    sizes = detail(client, "bulk-women-001").json()["sizes"]
    assert [(s["volume"], s["is_default"]) for s in sizes] == [(30, True)]


def test_hide_and_show(client, seeded):
    seed("--hide", "dior-sauvage")
    assert detail(client, "dior-sauvage").status_code == 404
    seed("--show", "dior-sauvage")
    assert detail(client, "dior-sauvage").status_code == 200


def test_delete_size(client, seeded):
    seed("--delete-size", "chanel-gabrielle:15")
    volumes = [s["volume"] for s in detail(client, "chanel-gabrielle").json()["sizes"]]
    assert volumes == [30, 50]


def test_set_price_with_and_without_sale(client, seeded):
    seed("--set-price", "chanel-gabrielle:50:90:70")
    size = ProductSize.objects.get(product__slug="chanel-gabrielle", volume=50)
    assert (size.regular_price, size.sale_price) == (90, 70)
    seed("--set-price", "chanel-gabrielle:50:95")
    size.refresh_from_db()
    assert (size.regular_price, size.sale_price) == (95, None)


def test_delete_product_and_reset(client, seeded):
    seed("--delete-product", "creed-aventus")
    assert detail(client, "creed-aventus").status_code == 404
    seed("--reset")
    assert Product.objects.count() == 0


@pytest.mark.parametrize(
    "option",
    [
        ["--hide", "nope"],
        ["--show", "nope"],
        ["--delete-product", "nope"],
        ["--delete-size", "nope:30"],
        ["--delete-size", "chanel-gabrielle:999"],
        ["--set-price", "nope:30:10"],
        ["--set-price", "chanel-gabrielle:999:10"],
    ],
)
def test_unknown_target_is_an_error(seeded, option):
    with pytest.raises(CommandError):
        seed(*option)
