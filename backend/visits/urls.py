# visits/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitViewSet, QueueViewSet

router = DefaultRouter()
router.register(r'visits', VisitViewSet, basename='visit')
router.register(r'queue', QueueViewSet, basename='queue')

urlpatterns = [
    path('', include(router.urls)),
]