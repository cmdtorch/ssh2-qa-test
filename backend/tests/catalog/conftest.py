import io

import pytest
from django.contrib.auth.models import Permission, User
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from catalog.models import Product, ProductPhoto, ProductSize, SharedTexts

PASSWORD = "Adm1n-pass-2026"
ADD_URL = "/admin/catalog/product/add/"


@pytest.fixture(autouse=True)
def media_root(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path / "media"


def image_bytes(image_format="PNG", total_size=None):
    """A real image; padded after the image data to exactly `total_size` bytes."""
    buffer = io.BytesIO()
    Image.new("RGB", (8, 8), "navy").save(buffer, format=image_format)
    data = buffer.getvalue()
    if total_size is not None:
        assert len(data) <= total_size
        data += b"\0" * (total_size - len(data))
    return data


def photo_file(name="photo.png", image_format="PNG", total_size=None):
    return SimpleUploadedFile(name, image_bytes(image_format, total_size))


def make_product(
    name="Chanel Gabrielle",
    gender="women",
    sizes=((30, "60.00", None, True),),
    slug=None,
    **fields,
):
    """A saved product with one photo and the sizes (volume, regular, sale, default)."""
    product = Product.objects.create(
        name=name, gender=gender, **({"slug": slug} if slug else {}), **fields
    )
    ProductPhoto.objects.create(product=product, image=photo_file())
    for volume, regular, sale, is_default in sizes:
        ProductSize.objects.create(
            product=product,
            volume=volume,
            regular_price=regular,
            sale_price=sale,
            is_default=is_default,
        )
    return product


def _inline(prefix, rows, initial):
    data = {
        f"{prefix}-TOTAL_FORMS": str(len(rows)),
        f"{prefix}-INITIAL_FORMS": str(initial),
        f"{prefix}-MIN_NUM_FORMS": "0",
        f"{prefix}-MAX_NUM_FORMS": "1000",
    }
    for index, row in enumerate(rows):
        for key, value in row.items():
            if value is True:
                value = "on"
            if value is False or value is None:
                continue
            data[f"{prefix}-{index}-{key}"] = value
    return data


def size_row(volume, regular, sale=None, is_default=False, **extra):
    return {
        "volume": volume,
        "regular_price": regular,
        "sale_price": "" if sale is None else sale,
        "is_default": is_default,
        **extra,
    }


def post_data(fields, sizes, photos, initial_sizes=0, initial_photos=0):
    data = {"show_on_site": "on", **fields}
    data.update(_inline("sizes", sizes, initial_sizes))
    data.update(_inline("photos", photos, initial_photos))
    return data


def new_product_data(sizes=None, photos=None, **fields):
    """The POST data of the admin "add product" form (valid unless overridden)."""
    fields = {"name": "Creed Aventus", "gender": "men", **fields}
    fields = {k: v for k, v in fields.items() if v is not None}
    sizes = [size_row(100, "150.00", is_default=True)] if sizes is None else sizes
    photos = [{"image": photo_file(), "position": 0}] if photos is None else photos
    return post_data(fields, sizes, photos)


def edit_data(product, extra_sizes=(), extra_photos=(), **overrides):
    """The POST data of the admin change form of a saved product."""
    fields = {
        "name": product.name,
        "slug": product.slug,
        "gender": product.gender,
        "descriptor_line": product.descriptor_line,
        "description": product.description,
        "top_notes": product.top_notes,
        "heart_notes": product.heart_notes,
        "base_notes": product.base_notes,
        "ingredients": product.ingredients,
        "rating": "" if product.rating is None else str(product.rating),
    }
    fields.update(overrides)
    sizes = [
        size_row(
            s.volume,
            s.regular_price,
            s.sale_price,
            s.is_default,
            id=s.id,
            product=product.id,
        )
        for s in product.sizes.all()
    ]
    photos = [
        {"id": p.id, "product": product.id, "position": p.position}
        for p in product.photos.all()
    ]
    return post_data(
        fields,
        sizes + list(extra_sizes),
        photos + list(extra_photos),
        initial_sizes=len(sizes),
        initial_photos=len(photos),
    )


def change_url(product):
    return f"/admin/catalog/product/{product.id}/change/"


def form_errors(response):
    """Errors of the main form, of the inline formsets and the formset-level ones."""
    context = response.context
    assert context is not None, f"form was accepted (status {response.status_code})"
    errors = dict(context["adminform"].form.errors)
    messages = [m for field in errors.values() for m in field]
    for formset in context["inline_admin_formsets"]:
        messages += [m for m in formset.formset.non_form_errors()]
        for form in formset.formset.forms:
            messages += [m for field in form.errors.values() for m in field]
    return errors, messages


@pytest.fixture
def superuser(client):
    user = User.objects.create_superuser("admin", "admin@example.com", PASSWORD)
    client.force_login(user)
    return user


def staff_with(client, *codenames, username="staff"):
    user = User.objects.create_user(username, password=PASSWORD, is_staff=True)
    user.user_permissions.set(Permission.objects.filter(codename__in=codenames))
    client.force_login(user)
    return user


@pytest.fixture
def shared_texts():
    return SharedTexts.load()
