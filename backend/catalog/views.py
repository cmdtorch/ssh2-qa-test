import math
import re

from django.db.models import OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product, ProductPhoto, ProductSize, SharedTexts
from .serializers import detail_item, list_item, photo_url, prices

PAGE_SIZE = 16
MAX_AVAILABILITY_ITEMS = 50
SORTS = {
    "new": ("-date_added", "name", "id"),
    "price-asc": ("current_price", "name", "id"),
    "price-desc": ("-current_price", "name", "id"),
}
ITEM_PATTERN = re.compile(r"^(?P<slug>[^:,\s]+)(?::(?P<volume>\d+))?$")


class PublicReadOnlyView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)


def visible_products():
    return Product.objects.filter(show_on_site=True)


def with_list_data(queryset):
    """First photo and default size prices as annotations: no query per product."""
    default = ProductSize.objects.filter(product=OuterRef("pk"), is_default=True)
    photo = ProductPhoto.objects.filter(product=OuterRef("pk")).order_by(
        "position", "id"
    )
    return queryset.annotate(
        first_photo=Subquery(photo.values("image")[:1]),
        default_regular=Subquery(default.values("regular_price")[:1]),
        default_sale=Subquery(default.values("sale_price")[:1]),
    ).annotate(current_price=Coalesce("default_sale", "default_regular"))


def bad_request(message):
    return Response({"error": message}, status=400)


def page_number(raw):
    try:
        page = int(raw)
    except (TypeError, ValueError):
        return 1
    return page if page >= 1 else 1


class ProductListView(PublicReadOnlyView):
    def get(self, request):
        gender = request.query_params.get("gender") or None
        sort = request.query_params.get("sort") or "new"
        if gender is not None and gender not in Product.Gender.values:
            return bad_request("Unknown gender.")
        if sort not in SORTS:
            return bad_request("Unknown sort.")
        products = visible_products()
        if gender:
            products = products.filter(gender=gender)
        text = request.query_params.get("q", "").strip()
        if text:
            products = products.filter(name__icontains=text)
        total = products.count()
        pages = math.ceil(total / PAGE_SIZE)
        page = min(page_number(request.query_params.get("page")), max(pages, 1))
        start = (page - 1) * PAGE_SIZE
        rows = with_list_data(products).order_by(*SORTS[sort])[
            start : start + PAGE_SIZE
        ]
        return Response(
            {
                "total": total,
                "pages": pages,
                "page": page,
                "results": [list_item(p) for p in rows],
            }
        )


class ProductDetailView(PublicReadOnlyView):
    def get(self, request, slug):
        product = get_object_or_404(
            visible_products().prefetch_related("sizes", "photos"), slug=slug
        )
        related = with_list_data(
            visible_products().filter(gender=product.gender).exclude(pk=product.pk)
        ).order_by(*SORTS["new"])[:4]
        return Response(detail_item(product, related, SharedTexts.load()))


def parse_items(raw):
    """The items of the availability check as (item, slug, volume); None if malformed."""
    parsed = []
    for item in raw.split(","):
        match = ITEM_PATTERN.match(item)
        if match is None:
            return None
        volume = match["volume"]
        parsed.append((item, match["slug"], None if volume is None else int(volume)))
    return parsed


class AvailabilityView(PublicReadOnlyView):
    def get(self, request):
        raw = request.query_params.get("items", "")
        if not raw:
            return bad_request("The items parameter is required.")
        parsed = parse_items(raw)
        if parsed is None:
            return bad_request(
                "Each item must be a short name with an optional :volume."
            )
        if len(parsed) > MAX_AVAILABILITY_ITEMS:
            return bad_request(f"At most {MAX_AVAILABILITY_ITEMS} items per check.")
        products = {
            p.slug: p
            for p in visible_products()
            .filter(slug__in={slug for _, slug, _ in parsed})
            .prefetch_related("sizes", "photos")
        }
        return Response(
            {"results": [self.result(products, *entry) for entry in parsed]}
        )

    @staticmethod
    def result(products, item, slug, volume):
        unavailable = {"item": item, "available": False}
        product = products.get(slug)
        if product is None:
            return unavailable
        sizes = list(product.sizes.all())
        size = next(
            (s for s in sizes if (s.volume == volume if volume else s.is_default)),
            None,
        )
        if size is None:
            return unavailable
        photos = list(product.photos.all())
        return {
            "item": item,
            "available": True,
            "slug": product.slug,
            "name": product.name,
            "photo": photo_url(photos[0].image.name) if photos else None,
            "volume": size.volume,
            **prices(size.regular_price, size.sale_price),
        }
