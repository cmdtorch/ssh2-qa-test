import pytest

from catalog.models import Product

from .conftest import make_product

pytestmark = pytest.mark.django_db


# @scenario backend-app :: Unknown API address
# @case backend-app :: Unknown API address answers 404
def test_unknown_api_address_answers_404(client):
    make_product()
    assert client.get("/api/does-not-exist/").status_code == 404


# @scenario backend-app :: Product catalog endpoints are public
# @case backend-app :: Catalog endpoints answer without sign-in
def test_catalog_endpoints_answer_without_sign_in(client):
    make_product()
    for path in (
        "/api/products/",
        "/api/products/availability/?items=chanel-gabrielle:30",
        "/api/products/chanel-gabrielle/",
    ):
        assert client.get(path).status_code == 200, path


# @scenario backend-app :: Product catalog is read-only
# @case backend-app :: POST to the product list is rejected
def test_post_to_the_product_list_is_rejected(client):
    for name in ("A", "B", "C"):
        make_product(name)
    response = client.post(
        "/api/products/",
        {"name": "Fake Perfume", "gender": "women"},
        content_type="application/json",
    )
    assert response.status_code == 405
    assert Product.objects.count() == 3


# @scenario backend-app :: Product catalog is read-only
# @case backend-app :: Write methods on a product detail are rejected
def test_write_methods_on_a_product_detail_are_rejected(client):
    make_product()
    for method in ("put", "patch", "delete"):
        response = getattr(client, method)(
            "/api/products/chanel-gabrielle/",
            {"name": "Changed"},
            content_type="application/json",
        )
        assert response.status_code == 405, method
    assert Product.objects.get().name == "Chanel Gabrielle"
    assert client.get("/api/products/").json()["total"] == 1
