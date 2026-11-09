from django import forms
from django.db import models
from django.utils.text import slugify

from .validators import (
    FORMAT_MESSAGE,
    RESERVED_SHORT_NAMES,
    validate_photo,
    validate_rating,
)


class PhotoFormField(forms.ImageField):
    default_error_messages = {"invalid_image": FORMAT_MESSAGE}


class PhotoField(models.ImageField):
    def formfield(self, **kwargs):
        kwargs.setdefault("form_class", PhotoFormField)
        return super().formfield(**kwargs)


class Product(models.Model):
    class Gender(models.TextChoices):
        MEN = "men", "Men's"
        WOMEN = "women", "Women's"
        UNISEX = "unisex", "Unisex"

    name = models.CharField(max_length=200)
    slug = models.SlugField(
        "short name",
        max_length=200,
        unique=True,
        blank=True,
        error_messages={"unique": "This short name is already taken."},
        help_text="Filled in from the name when left empty.",
    )
    gender = models.CharField(max_length=10, choices=Gender.choices)
    show_on_site = models.BooleanField(default=True)
    date_added = models.DateTimeField(auto_now_add=True)
    descriptor_line = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    top_notes = models.CharField(max_length=300, blank=True)
    heart_notes = models.CharField(max_length=300, blank=True)
    base_notes = models.CharField(max_length=300, blank=True)
    ingredients = models.TextField(blank=True)
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[validate_rating],
    )

    class Meta:
        ordering = ["-date_added", "name"]
        indexes = [models.Index(fields=["gender", "-date_added"])]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug and self.name.strip():
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def clean(self):
        super().clean()
        if not self.slug and self.name.strip():
            self.slug = slugify(self.name)
        if self.slug in RESERVED_SHORT_NAMES:
            raise forms.ValidationError({"slug": "This short name is reserved."})


class ProductSize(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="sizes")
    volume = models.PositiveIntegerField(help_text="Millilitres")
    regular_price = models.DecimalField(max_digits=8, decimal_places=2)
    sale_price = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    is_default = models.BooleanField("default", default=False)

    class Meta:
        ordering = ["volume"]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "volume"],
                name="unique_volume_per_product",
                violation_error_message="Each size must have a different volume.",
            )
        ]

    def __str__(self):
        return f"{self.product} {self.volume} ml"

    def clean(self):
        super().clean()
        if (
            self.sale_price is not None
            and self.regular_price is not None
            and self.sale_price >= self.regular_price
        ):
            raise forms.ValidationError(
                {"sale_price": "The sale price must be lower than the regular price."}
            )


class ProductPhoto(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="photos"
    )
    image = PhotoField(upload_to="products/", validators=[validate_photo])
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self):
        return f"{self.product} photo {self.position}"


class SharedTexts(models.Model):
    """The single row with the texts shown on every product page."""

    shipping = models.TextField("Shipping & handling", blank=True)
    questions = models.TextField("Questions", blank=True)

    class Meta:
        verbose_name = "shared texts"
        verbose_name_plural = "shared texts"

    def __str__(self):
        return "Shared texts"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        return cls.objects.get_or_create(pk=1)[0]
