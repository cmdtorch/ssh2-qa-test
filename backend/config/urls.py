from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

from core.views import HealthView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthView.as_view()),
    path("api/", include("catalog.urls")),
    re_path(
        r"^media/(?P<path>.*)$",
        serve,
        {"document_root": settings.MEDIA_ROOT},
    ),
]
