import os

from django.contrib.staticfiles.management.commands.runserver import (
    Command as RunserverCommand,
)


class Command(RunserverCommand):
    def handle(self, *args, **options):
        self.default_port = os.environ.get("BACKEND_PORT") or "8000"
        super().handle(*args, **options)
