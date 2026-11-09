from decimal import Decimal

from django.core.exceptions import ValidationError
from PIL import Image

MAX_PHOTO_BYTES = 5 * 1024 * 1024
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
FORMAT_MESSAGE = "Only JPG, PNG or WebP are allowed."
SIZE_MESSAGE = "The photo must be at most 5 MB."
RESERVED_SHORT_NAMES = {"availability"}


def validate_photo(value):
    """Refuse a new upload that is over 5 MB or is not a JPG, PNG or WebP image."""
    if getattr(value, "_committed", True):
        return
    if value.size > MAX_PHOTO_BYTES:
        raise ValidationError(SIZE_MESSAGE, code="photo_too_big")
    try:
        value.file.seek(0)
        with Image.open(value.file) as image:
            image_format = image.format
    except Exception:
        raise ValidationError(FORMAT_MESSAGE, code="photo_format") from None
    finally:
        value.file.seek(0)
    if image_format not in ALLOWED_FORMATS:
        raise ValidationError(FORMAT_MESSAGE, code="photo_format")


def validate_rating(value):
    if value is None:
        return
    if value < 0 or value > 5:
        raise ValidationError("The rating must be from 0 to 5.", code="rating_range")
    if value % Decimal("0.5") != 0:
        raise ValidationError("The rating must be in steps of 0.5.", code="rating_step")
