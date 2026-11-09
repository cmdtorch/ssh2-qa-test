from decimal import ROUND_HALF_UP, Decimal


def number(value):
    """A decimal price as a JSON number (None stays None)."""
    return None if value is None else float(value)


def discount_percent(regular_price, sale_price):
    """(regular - sale) / regular * 100 rounded to a whole number; None without a sale."""
    if sale_price is None or not regular_price:
        return None
    percent = (Decimal(regular_price) - Decimal(sale_price)) / Decimal(regular_price)
    return int((percent * 100).quantize(Decimal(1), rounding=ROUND_HALF_UP))


def photo_url(name):
    return f"/media/{name}" if name else None


def prices(regular_price, sale_price):
    return {
        "regular_price": number(regular_price),
        "sale_price": number(sale_price),
        "discount_percent": discount_percent(regular_price, sale_price),
    }


def list_item(product):
    """A product annotated by `catalog.views.with_list_data`."""
    return {
        "slug": product.slug,
        "name": product.name,
        "gender": product.gender,
        "photo": photo_url(product.first_photo),
        **prices(product.default_regular, product.default_sale),
    }


def size_item(size):
    return {
        "volume": size.volume,
        "is_default": size.is_default,
        **prices(size.regular_price, size.sale_price),
    }


def detail_item(product, related, shared):
    data = {
        "slug": product.slug,
        "name": product.name,
        "gender": product.gender,
        "photos": [photo_url(p.image.name) for p in product.photos.all()],
        "sizes": [size_item(s) for s in product.sizes.all()],
        "description": product.description,
        "top_notes": product.top_notes,
        "heart_notes": product.heart_notes,
        "base_notes": product.base_notes,
        "ingredients": product.ingredients,
        "shipping": shared.shipping,
        "questions": shared.questions,
        "related": [list_item(p) for p in related],
    }
    if product.descriptor_line:
        data["descriptor_line"] = product.descriptor_line
    if product.rating is not None:
        data["rating"] = number(product.rating)
    return data
