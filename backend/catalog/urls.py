from django.urls import path

from .views import AvailabilityView, ProductDetailView, ProductListView

urlpatterns = [
    path("products/", ProductListView.as_view()),
    path("products/availability/", AvailabilityView.as_view()),
    path("products/<slug:slug>/", ProductDetailView.as_view()),
]
