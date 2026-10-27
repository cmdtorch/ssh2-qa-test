import time

from django.core.management import BaseCommand, CommandError
from django.db import OperationalError, connections

TIMEOUT_SECONDS = 60


class Command(BaseCommand):
    help = "Wait until the default database accepts connections."

    def handle(self, *args, **options):
        deadline = time.monotonic() + TIMEOUT_SECONDS
        while True:
            try:
                connections["default"].ensure_connection()
            except OperationalError:
                if time.monotonic() >= deadline:
                    raise CommandError(
                        f"Database is unreachable after {TIMEOUT_SECONDS} seconds"
                    ) from None
                time.sleep(1)
            else:
                self.stdout.write("Database is available")
                return
