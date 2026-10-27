import subprocess
import sys
from pathlib import Path

import pytest

pytestmark = pytest.mark.tooling

BACKEND_DIR = Path(__file__).resolve().parents[2]
CONFIG = BACKEND_DIR / "pyproject.toml"


def ruff(*args: str, cwd: Path = BACKEND_DIR) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, "-m", "ruff", *args, "--config", str(CONFIG), "--no-cache"],
        cwd=cwd,
        capture_output=True,
        text=True,
        check=False,
    )


# @scenario backend-app :: Clean backend passes the checks
# @case backend-app :: ruff check and ruff format on delivered code
def test_delivered_backend_passes_lint_and_format_checks():
    lint = ruff("check", ".")
    fmt = ruff("format", "--check", ".")

    assert lint.returncode == 0, lint.stdout + lint.stderr
    assert "All checks passed!" in lint.stdout
    assert fmt.returncode == 0, fmt.stdout + fmt.stderr
    assert "already formatted" in fmt.stdout


# @scenario backend-app :: Lint violation is reported
# @case backend-app :: Unused import in a backend file
def test_unused_import_is_reported_with_file_and_rule(tmp_path):
    module = tmp_path / "unused_import.py"
    module.write_text("import os\n")

    result = ruff("check", str(module), cwd=tmp_path)

    assert result.returncode == 1
    assert (
        "F401 [*] `os` imported but unused\n --> unused_import.py:1:8" in result.stdout
    )


# @scenario backend-app :: Format violation is reported
# @case backend-app :: Badly formatted backend file
def test_badly_formatted_file_is_reported_with_file(tmp_path):
    module = tmp_path / "badly_formatted.py"
    module.write_text("x  =  {'a':1}\n")

    result = ruff("format", "--check", str(module), cwd=tmp_path)

    assert result.returncode == 1
    assert (
        "unformatted: File would be reformatted\n --> badly_formatted.py:1:"
        in result.stdout
    )
    assert "1 file would be reformatted" in result.stdout
