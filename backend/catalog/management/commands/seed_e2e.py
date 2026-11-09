import io
from decimal import Decimal

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from PIL import Image

from catalog.models import Product, ProductPhoto, ProductSize, SharedTexts

# (name, gender, [(volume, regular, sale)], default volume)
PRODUCTS = [
    (
        "Chanel Gabrielle",
        "women",
        [(15, "20", None), (30, "60", "40"), (50, "80", None)],
        30,
    ),
    ("Chanel No. 5", "women", [(50, "120", None)], 50),
    ("Dior J'adore", "women", [(50, "92.40", None)], 50),
    ("YSL Libre", "women", [(50, "220", None)], 50),
    ("Burberry Goddess", "women", [(100, "136", "81.60")], 100),
    ("Dior Sauvage", "men", [(100, "130", None)], 100),
    ("Creed Aventus", "men", [(50, "150", None), (100, "150", None)], 100),
    ("Bleu de Chanel", "men", [(100, "78", None)], 100),
    ("Acqua di Gio", "men", [(100, "220", None)], 100),
    ("Versace Dylan Blue", "men", [(100, "400", None)], 100),
    ("CK One", "unisex", [(100, "70", None)], 100),
]


def png_file(name):
    buffer = io.BytesIO()
    Image.new("RGB", (8, 8), "navy").save(buffer, format="PNG")
    return ContentFile(buffer.getvalue(), name=name)


def get_product(slug):
    try:
        return Product.objects.get(slug=slug)
    except Product.DoesNotExist:
        raise CommandError(f"No product with short name '{slug}'.") from None


def get_size(spec):
    slug, _, volume = spec.partition(":")
    product = get_product(slug)
    try:
        return product.sizes.get(volume=int(volume))
    except (ValueError, ProductSize.DoesNotExist):
        raise CommandError(f"'{slug}' has no {volume} ml size.") from None


def create_product(name, gender, sizes, default, slug=None):
    product, created = Product.objects.get_or_create(
        name=name,
        defaults={
            "gender": gender,
            "rating": Decimal("4.5"),
            **({"slug": slug} if slug else {}),
        },
    )
    if created:
        product.descriptor_line = "Eau de parfum"
        product.description = f"{name} test description."
        product.top_notes, product.heart_notes, product.base_notes = (
            "Top",
            "Heart",
            "Base",
        )
        product.ingredients = "Alcohol, Parfum"
        product.save()
        ProductPhoto.objects.create(
            product=product, image=png_file(f"{product.slug}.png")
        )
        for volume, regular, sale in sizes:
            ProductSize.objects.create(
                product=product,
                volume=volume,
                regular_price=regular,
                sale_price=sale,
                is_default=volume == default,
            )
    return created


class Command(BaseCommand):
    help = (
        "FOR TESTS ONLY. Seed a deterministic catalog (idempotent) or change it: "
        "hide/show a product, delete a product or size, set a price, reset. "
        "Mutation options skip the default seeding."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--bulk", type=int, metavar="N", help="also ensure N visible bulk products"
        )
        parser.add_argument(
            "--gender",
            default="women",
            choices=Product.Gender.values,
            help="gender of bulk products",
        )
        parser.add_argument(
            "--bulk-volume",
            type=int,
            default=100,
            metavar="ML",
            help="volume in ml of the single (default) size of bulk products",
        )
        parser.add_argument("--hide", action="append", default=[], metavar="SLUG")
        parser.add_argument("--show", action="append", default=[], metavar="SLUG")
        parser.add_argument(
            "--delete-product", action="append", default=[], metavar="SLUG"
        )
        parser.add_argument(
            "--delete-size", action="append", default=[], metavar="SLUG:VOLUME"
        )
        parser.add_argument(
            "--set-price",
            action="append",
            default=[],
            metavar="SLUG:VOLUME:REGULAR[:SALE]",
        )
        parser.add_argument("--reset", action="store_true", help="delete all products")

    def handle(self, *args, **o):
        mutating = any(
            o[k]
            for k in (
                "hide",
                "show",
                "delete_product",
                "delete_size",
                "set_price",
                "reset",
            )
        )
        if o["reset"]:
            Product.objects.all().delete()
            self.stdout.write("reset: all products deleted")
        for slug in o["hide"] + o["show"]:
            get_product(slug)
        for slug in o["hide"]:
            Product.objects.filter(slug=slug).update(show_on_site=False)
            self.stdout.write(f"hidden {slug}")
        for slug in o["show"]:
            Product.objects.filter(slug=slug).update(show_on_site=True)
            self.stdout.write(f"shown {slug}")
        for spec in o["delete_size"]:
            get_size(spec).delete()
            self.stdout.write(f"deleted size {spec}")
        for spec in o["set_price"]:
            self.set_price(spec)
        for slug in o["delete_product"]:
            get_product(slug).delete()
            self.stdout.write(f"deleted product {slug}")
        if not mutating:
            self.seed(o["bulk"], o["gender"], o["bulk_volume"])

    def set_price(self, spec):
        parts = spec.split(":")
        if len(parts) not in (3, 4):
            raise CommandError(
                f"Bad --set-price '{spec}', use SLUG:VOLUME:REGULAR[:SALE]."
            )
        size = get_size(":".join(parts[:2]))
        size.regular_price = parts[2]
        size.sale_price = parts[3] if len(parts) == 4 else None
        size.save()
        self.stdout.write(f"set price {spec}")

    def seed(self, bulk, gender, bulk_volume=100):
        for name, product_gender, sizes, default in PRODUCTS:
            create_product(name, product_gender, sizes, default)
        texts = SharedTexts.load()
        texts.shipping = texts.shipping or "Free delivery over $100"
        texts.questions = texts.questions or "Write to support@example.com"
        texts.save()
        for i in range(1, (bulk or 0) + 1):
            create_product(
                f"Bulk {gender.title()} {i:03d}",
                gender,
                [(bulk_volume, "100", None)],
                bulk_volume,
            )
        self.stdout.write(
            f"seeded {len(PRODUCTS)} products and {bulk or 0} bulk {gender} products"
        )
