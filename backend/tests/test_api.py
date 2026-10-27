import pytest


# @scenario backend-app :: Unknown API address
# @case backend-app :: Unknown address under /api/
# @case backend-app :: API root has no endpoint list
@pytest.mark.parametrize("path", ["/api/does-not-exist/", "/api/"])
def test_unknown_api_address_is_not_found(client, path):
    assert client.get(path).status_code == 404


# @scenario backend-app :: No sign-in or registration outside the admin panel
# @case backend-app :: Common sign-in and registration addresses return 404
@pytest.mark.parametrize(
    "path", ["/api-auth/login/", "/accounts/login/", "/accounts/signup/", "/register/"]
)
def test_no_sign_in_or_registration_pages(client, path):
    assert client.get(path).status_code == 404
