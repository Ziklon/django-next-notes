from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, NoteViewSet, TagViewSet

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"tags", TagViewSet, basename="tag")
router.register(r"notes", NoteViewSet, basename="note")

urlpatterns = router.urls
