from io import StringIO
from unittest.mock import patch

import pytest
from django.core.management import CommandError, call_command
from django.db import OperationalError, connections


class FakeClock:
    def __init__(self):
        self.now = 0.0
        self.sleeps = []

    def monotonic(self):
        return self.now

    def sleep(self, seconds):
        self.sleeps.append(seconds)
        self.now += seconds


def database_ready_after(clock, seconds):
    def ensure_connection():
        if clock.now < seconds:
            raise OperationalError("connection refused")

    return ensure_connection


def wait_for_db(clock, ready_after):
    module = "core.management.commands.wait_for_db.time"
    out = StringIO()
    with (
        patch(f"{module}.monotonic", clock.monotonic),
        patch(f"{module}.sleep", clock.sleep),
        patch.object(
            connections["default"],
            "ensure_connection",
            side_effect=database_ready_after(clock, ready_after),
        ),
    ):
        call_command("wait_for_db", stdout=out)
    return out.getvalue()


def test_returns_at_once_when_database_is_ready():
    clock = FakeClock()
    assert wait_for_db(clock, ready_after=0) == "Database is available\n"
    assert clock.sleeps == []


def test_retries_every_second_until_database_is_ready():
    clock = FakeClock()
    assert wait_for_db(clock, ready_after=55) == "Database is available\n"
    assert clock.sleeps == [1] * 55


def test_gives_up_after_60_seconds():
    clock = FakeClock()
    with pytest.raises(CommandError) as error:
        wait_for_db(clock, ready_after=65)
    assert str(error.value) == "Database is unreachable after 60 seconds"
    assert error.value.returncode == 1
    assert clock.sleeps == [1] * 60
    assert clock.now == 60
