# admissions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WardViewSet, BedViewSet, AdmissionViewSet

router = DefaultRouter()
router.register(r'wards', WardViewSet, basename='ward')
router.register(r'beds', BedViewSet, basename='bed')
router.register(r'admissions', AdmissionViewSet, basename='admission')

urlpatterns = [
    path('', include(router.urls)),
]