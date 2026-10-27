import pytest
from django.contrib.auth.models import User
from django.core.management import CommandError, call_command

PASSWORD = "Adm1n-pass-2026"
INVALID_CREDENTIALS = (
    "Please enter the correct username and password for a staff account. "
    "Note that both fields may be case-sensitive."
)
LOGIN_URL = "/admin/login/?next=/admin/"

pytestmark = pytest.mark.django_db


@pytest.fixture
def administrator(monkeypatch):
    monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", PASSWORD)
    call_command(
        "createsuperuser",
        interactive=False,
        username="admin",
        email="admin@example.com",
        verbosity=0,
    )


def sign_in(client, username, password):
    return client.post(
        LOGIN_URL, {"username": username, "password": password}, follow=True
    )


# @scenario backend-app :: Anonymous visitor is sent to the admin login
# @case backend-app :: Redirect from /admin/ to the login page
def test_anonymous_visitor_is_redirected_to_login(client):
    response = client.get("/admin/")
    assert response.status_code == 302
    assert response["Location"] == "/admin/login/?next=/admin/"


# @scenario backend-app :: Administrator signs in to the admin panel
# @case backend-app :: Sign-in with correct credentials
def test_administrator_signs_in(client, administrator):
    response = sign_in(client, "admin", PASSWORD)
    assert response.redirect_chain == [("/admin/", 302)]
    assert response.status_code == 200
    assert "<h1>Site administration</h1>" in response.content.decode()


# @scenario backend-app :: Wrong administrator password
# @case backend-app :: Correct username, wrong password
# @case backend-app :: Unknown username
@pytest.mark.parametrize(
    ("username", "password"), [("admin", "wrong-pass"), ("ghost", PASSWORD)]
)
def test_wrong_credentials_show_login_error(client, administrator, username, password):
    response = sign_in(client, username, password)
    content = response.content.decode()
    assert response.redirect_chain == []
    assert response.status_code == 200
    assert response.request["PATH_INFO"] == "/admin/login/"
    assert INVALID_CREDENTIALS in content
    assert "Site administration</h1>" not in content


# @scenario backend-app :: Wrong administrator password
# @case backend-app :: Empty login form
def test_empty_login_form_requires_both_fields(client):
    response = sign_in(client, "", "")
    content = response.content.decode()
    assert response.redirect_chain == []
    assert response.request["PATH_INFO"] == "/admin/login/"
    assert content.count("This field is required.") == 2
    assert "Site administration</h1>" not in content


# @scenario backend-app :: Administrator with an existing username
# @case backend-app :: Second administrator named admin
def test_existing_username_is_refused(administrator, monkeypatch):
    monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", "Second-pass-2026")
    with pytest.raises(
        CommandError, match=r"^Error: That username is already taken\.$"
    ):
        call_command(
            "createsuperuser",
            interactive=False,
            username="admin",
            email="admin2@example.com",
            verbosity=0,
        )
    assert User.objects.filter(username="admin").count() == 1
