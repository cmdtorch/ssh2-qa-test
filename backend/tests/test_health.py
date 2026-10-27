from unittest.mock import patch

import pytest
from django.db import OperationalError, connections

HEALTHY = {"status": "ok", "database": "ok"}
UNAVAILABLE = {"status": "error", "database": "unavailable"}

pytestmark = pytest.mark.django_db


# @scenario backend-app :: Healthy backend
# @case backend-app :: Health check with a reachable database
def test_health_check_with_reachable_database(client):
    response = client.get("/api/health/")
    assert response.status_code == 200
    assert response["Content-Type"].startswith("application/json")
    assert response.json() == HEALTHY


# @scenario backend-app :: Healthy backend
# @case backend-app :: Health check with debug mode off
@pytest.mark.parametrize("debug", [False, True])
def test_health_check_with_debug_on_or_off(client, settings, debug):
    settings.DEBUG = debug
    response = client.get("/api/health/", HTTP_HOST="localhost")
    assert response.status_code == 200
    assert response.json() == HEALTHY


# @scenario backend-app :: Database unavailable
# @case backend-app :: Health check with the database down
def test_health_check_with_database_down(client):
    failure = OperationalError("connection refused")
    with patch.object(connections["default"], "cursor", side_effect=failure):
        response = client.get("/api/health/")
    assert response.status_code == 503
    assert response["Content-Type"].startswith("application/json")
    assert response.json() == UNAVAILABLE


# @scenario backend-app :: Method other than GET
# @case backend-app :: POST to the health check
def test_post_to_health_check_is_rejected(client):
    response = client.post("/api/health/", {}, content_type="application/json")
    assert response.status_code == 405


# @scenario backend-app :: Method other than GET
# @case backend-app :: PUT and DELETE to the health check
def test_put_and_delete_to_health_check_are_rejected(client):
    assert client.put("/api/health/").status_code == 405
    assert client.delete("/api/health/").status_code == 405
