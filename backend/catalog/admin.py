from django.contrib import admin
from django.core.exceptions import ValidationError
from django.forms import BaseInlineFormSet

from .models import Product, ProductPhoto, ProductSize, SharedTexts


def _kept_forms(formset):
    """Forms with data that are not marked for deletion."""
    return [
        form
        for form in formset.forms
        if getattr(form, "cleaned_data", None) and not form.cleaned_data.get("DELETE")
    ]


def _has_errors(formset):
    return any(form.errors for form in formset.forms)


class SizeFormSet(BaseInlineFormSet):
    def clean(self):
        if _has_errors(self):
            return super().clean()
        kept = _kept_forms(self)
        volumes = [form.cleaned_data["volume"] for form in kept]
        if len(volumes) != len(set(volumes)):
            # before super().clean(), whose generic duplicate message would win
            raise ValidationError("Each size must have a different volume.")
        super().clean()
        if not kept:
            raise ValidationError("A product needs at least one size.")
        defaults = [form for form in kept if form.cleaned_data.get("is_default")]
        if len(defaults) != 1:
            raise ValidationError("Exactly one size must be the default.")


class PhotoFormSet(BaseInlineFormSet):
    def clean(self):
        super().clean()
        if _has_errors(self):
            return
        if not _kept_forms(self):
            raise ValidationError("A product needs at least one photo.")


class ProductPermissionsInline(admin.TabularInline):
    """Inline rows follow the permissions of the product itself."""

    extra = 0

    def has_view_permission(self, request, obj=None):
        return request.user.has_perm("catalog.view_product")

    def has_add_permission(self, request, obj=None):
        return request.user.has_perm("catalog.add_product")

    def has_change_permission(self, request, obj=None):
        return request.user.has_perm("catalog.change_product")

    def has_delete_permission(self, request, obj=None):
        return request.user.has_perm("catalog.change_product")


class ProductSizeInline(ProductPermissionsInline):
    model = ProductSize
    formset = SizeFormSet


class ProductPhotoInline(ProductPermissionsInline):
    model = ProductPhoto
    formset = PhotoFormSet


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "gender", "show_on_site", "date_added")
    list_filter = ("gender", "show_on_site")
    search_fields = ("name", "slug")
    inlines = [ProductSizeInline, ProductPhotoInline]


@admin.register(SharedTexts)
class SharedTextsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return super().has_add_permission(request) and not SharedTexts.objects.exists()
