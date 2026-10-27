import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent
DATABASE_URL = "sqlite://:memory:"
HEALTHY = {"status": "ok", "database": "ok"}
STANDARD_404 = (
    "<h1>Not Found</h1><p>The requested resource was not found on this server.</p>"
)

REQUEST_SCRIPT = """
import json, sys
import django
django.setup()
from django.test import Client
response = Client().get(sys.argv[1], HTTP_HOST=sys.argv[2])
print(json.dumps({"status": response.status_code, "body": response.content.decode()}))
"""

SETTINGS_SCRIPT = """
import json
import django
django.setup()
from django.conf import settings
print(json.dumps({"debug": settings.DEBUG, "secret_key": settings.SECRET_KEY}))
"""


def backend_env(tmp_path, **variables):
    env = {
        "PATH": os.environ["PATH"],
        "DJANGO_SETTINGS_MODULE": "config.settings",
        "ENV_FILE": str(tmp_path / "missing.env"),
    }
    env.update(variables)
    return env


def start_backend(tmp_path, **variables):
    return subprocess.run(
        [sys.executable, "manage.py", "check"],
        cwd=BACKEND_DIR,
        env=backend_env(tmp_path, **variables),
        capture_output=True,
        text=True,
        check=False,
    )


def run_python(tmp_path, script, *args, **variables):
    result = subprocess.run(
        [sys.executable, "-c", script, *args],
        cwd=BACKEND_DIR,
        env=backend_env(tmp_path, **variables),
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def request(tmp_path, path, host, **variables):
    return run_python(tmp_path, REQUEST_SCRIPT, path, host, **variables)


def assert_standard_404(response):
    assert response["status"] == 404
    assert STANDARD_404 in response["body"]
    assert "URLconf" not in response["body"]
    assert "admin/" not in response["body"]


def assert_debug_404(response):
    assert response["status"] == 404
    assert "Using the URLconf defined in <code>config.urls</code>" in response["body"]
    assert "admin/" in response["body"]
    assert "api/health/" in response["body"]


def assert_healthy(response):
    assert response["status"] == 200
    assert json.loads(response["body"]) == HEALTHY


def assert_refused(result, name):
    assert result.returncode != 0
    assert "ImproperlyConfigured" in result.stderr
    assert f"Set the {name} environment variable" in result.stderr


# @scenario backend-app :: Debug variable unset
# @case backend-app :: Standard 404 page with DEBUG unset
def test_debug_unset_serves_standard_404(tmp_path):
    response = request(
        tmp_path,
        "/no-such-page/",
        "localhost",
        SECRET_KEY="test-secret-key",
        DATABASE_URL=DATABASE_URL,
    )
    assert_standard_404(response)


# @scenario backend-app :: Debug variable unset
# @case backend-app :: Empty DEBUG value means off
def test_empty_debug_serves_standard_404(tmp_path):
    response = request(
        tmp_path,
        "/no-such-page/",
        "localhost",
        SECRET_KEY="test-secret-key",
        DATABASE_URL=DATABASE_URL,
        DEBUG="",
    )
    assert_standard_404(response)


# @scenario backend-app :: Debug enabled with a true value
# @case backend-app :: DEBUG=TRUE turns debug on
def test_debug_upper_true_serves_debug_404(tmp_path):
    response = request(
        tmp_path, "/no-such-page/", "localhost", DATABASE_URL=DATABASE_URL, DEBUG="TRUE"
    )
    assert_debug_404(response)


# @scenario backend-app :: Debug enabled with a true value
# @case backend-app :: DEBUG=true and DEBUG=True turn debug on
@pytest.mark.parametrize("value", ["true", "True"])
def test_debug_true_any_case_serves_debug_404(tmp_path, value):
    response = request(
        tmp_path, "/no-such-page/", "localhost", DATABASE_URL=DATABASE_URL, DEBUG=value
    )
    assert_debug_404(response)


# @scenario backend-app :: Debug enabled with 1
# @case backend-app :: DEBUG=1 turns debug on
def test_debug_one_serves_debug_404(tmp_path):
    response = request(
        tmp_path, "/no-such-page/", "localhost", DATABASE_URL=DATABASE_URL, DEBUG="1"
    )
    assert_debug_404(response)


# @scenario backend-app :: Unrecognised debug value
# @case backend-app :: DEBUG=yes means off
def test_debug_yes_serves_standard_404(tmp_path):
    response = request(
        tmp_path,
        "/no-such-page/",
        "localhost",
        SECRET_KEY="test-secret-key",
        DATABASE_URL=DATABASE_URL,
        DEBUG="yes",
    )
    assert_standard_404(response)


# @scenario backend-app :: Unrecognised debug value
# @case backend-app :: DEBUG=0 and DEBUG=false mean off
@pytest.mark.parametrize("value", ["0", "false"])
def test_debug_zero_or_false_serves_standard_404(tmp_path, value):
    response = request(
        tmp_path,
        "/no-such-page/",
        "localhost",
        SECRET_KEY="test-secret-key",
        DATABASE_URL=DATABASE_URL,
        DEBUG=value,
    )
    assert_standard_404(response)


# @scenario backend-app :: Missing secret key outside debug mode
# @case backend-app :: Start refused without SECRET_KEY
def test_missing_secret_key_refuses_start(tmp_path):
    result = start_backend(
        tmp_path, DATABASE_URL="postgres://app:app@localhost:5432/app"
    )
    assert_refused(result, "SECRET_KEY")


# @scenario backend-app :: Missing secret key outside debug mode
# @case backend-app :: Empty SECRET_KEY counts as missing
def test_empty_secret_key_refuses_start(tmp_path):
    result = start_backend(
        tmp_path,
        DATABASE_URL="postgres://app:app@localhost:5432/app",
        SECRET_KEY="",
        DEBUG="0",
    )
    assert_refused(result, "SECRET_KEY")


# @scenario backend-app :: Missing database address outside debug mode
# @case backend-app :: Start refused without DATABASE_URL
def test_missing_database_url_refuses_start(tmp_path):
    result = start_backend(tmp_path, SECRET_KEY="test-secret-key")
    assert_refused(result, "DATABASE_URL")


# @scenario backend-app :: Missing database address outside debug mode
# @case backend-app :: Empty DATABASE_URL counts as missing
def test_empty_database_url_refuses_start(tmp_path):
    result = start_backend(
        tmp_path, SECRET_KEY="test-secret-key", DATABASE_URL="", DEBUG="0"
    )
    assert_refused(result, "DATABASE_URL")


# @scenario backend-app :: Missing database address outside debug mode
# @case backend-app :: Both settings missing
def test_both_settings_missing_refuses_start(tmp_path):
    result = start_backend(tmp_path)
    assert result.returncode != 0
    assert (
        "Set the SECRET_KEY environment variable" in result.stderr
        or "Set the DATABASE_URL environment variable" in result.stderr
    )


# @scenario backend-app :: Missing secret key in debug mode
# @case backend-app :: Development key used when SECRET_KEY is missing
def test_missing_secret_key_in_debug_uses_development_key(tmp_path):
    result = run_python(tmp_path, SETTINGS_SCRIPT, DEBUG="1", DATABASE_URL=DATABASE_URL)
    assert result == {"debug": True, "secret_key": "django-insecure-development-key"}
    response = request(
        tmp_path, "/api/health/", "localhost", DEBUG="1", DATABASE_URL=DATABASE_URL
    )
    assert_healthy(response)


# @scenario backend-app :: Missing secret key in debug mode
# @case backend-app :: Empty SECRET_KEY in debug mode uses the development key
def test_empty_secret_key_in_debug_uses_development_key(tmp_path):
    result = run_python(
        tmp_path, SETTINGS_SCRIPT, DEBUG="1", DATABASE_URL=DATABASE_URL, SECRET_KEY=""
    )
    assert result == {"debug": True, "secret_key": "django-insecure-development-key"}
    response = request(
        tmp_path,
        "/api/health/",
        "localhost",
        DEBUG="1",
        DATABASE_URL=DATABASE_URL,
        SECRET_KEY="",
    )
    assert_healthy(response)


# @scenario backend-app :: Missing database address in debug mode
# @case backend-app :: Start refused without DATABASE_URL in debug mode
def test_missing_database_url_in_debug_refuses_start(tmp_path):
    result = start_backend(tmp_path, DEBUG="1", SECRET_KEY="test-secret-key")
    assert_refused(result, "DATABASE_URL")


# @scenario backend-app :: Missing database address in debug mode
# @case backend-app :: Empty DATABASE_URL in debug mode
def test_empty_database_url_in_debug_refuses_start(tmp_path):
    result = start_backend(
        tmp_path, DEBUG="1", SECRET_KEY="test-secret-key", DATABASE_URL=""
    )
    assert_refused(result, "DATABASE_URL")


PRODUCTION = {"SECRET_KEY": "test-secret-key", "DATABASE_URL": DATABASE_URL}


# @scenario backend-app :: Request to an allowed host
# @case backend-app :: Host 127.0.0.1 is accepted
# @case backend-app :: Host localhost is accepted
@pytest.mark.parametrize("host", ["127.0.0.1", "localhost"])
def test_default_host_is_accepted(tmp_path, host):
    response = request(tmp_path, "/api/health/", host, **PRODUCTION)
    assert_healthy(response)


# @scenario backend-app :: Request to a host that is not allowed
# @case backend-app :: Host example.com is rejected
# @case backend-app :: Host with a localhost-like prefix is rejected
@pytest.mark.parametrize("host", ["example.com", "localhost.example.com"])
def test_unknown_host_is_rejected(tmp_path, host):
    response = request(tmp_path, "/api/health/", host, **PRODUCTION)
    assert response["status"] == 400


# @scenario backend-app :: Extra allowed host
# @case backend-app :: example.com allowed by the optional variable
# @case backend-app :: Defaults still allowed next to the extra host
@pytest.mark.parametrize("host", ["example.com", "localhost", "127.0.0.1"])
def test_extra_host_is_accepted_next_to_defaults(tmp_path, host):
    response = request(
        tmp_path, "/api/health/", host, ALLOWED_HOSTS="example.com", **PRODUCTION
    )
    assert_healthy(response)


def test_settings_file_is_loaded_and_environment_wins(tmp_path):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "DEBUG=1\nSECRET_KEY=from-file\nDATABASE_URL=sqlite://:memory:\n"
    )
    result = run_python(
        tmp_path, SETTINGS_SCRIPT, ENV_FILE=str(env_file), SECRET_KEY="from-environment"
    )
    assert result == {"debug": True, "secret_key": "from-environment"}


def git(*args):
    return subprocess.run(
        ["git", *args], cwd=REPO_ROOT, capture_output=True, text=True, check=True
    ).stdout


# @scenario backend-app :: Real settings file is not tracked
# @case backend-app :: .env at the root is ignored
def test_root_env_file_is_ignored():
    env_file = REPO_ROOT / ".env"
    created = not env_file.exists()
    if created:
        env_file.write_text("SECRET_KEY=local-secret\n")
    try:
        assert ".env" not in git("status", "--porcelain").split()
        assert git("check-ignore", ".env") == ".env\n"
    finally:
        if created:
            env_file.unlink()


# @scenario backend-app :: Real settings file is not tracked
# @case backend-app :: Example settings file is tracked
def test_example_settings_file_is_tracked():
    files = git("ls-files", "--cached", "--others", "--exclude-standard").splitlines()
    assert ".env.example" in files
    assert ".env" not in files
