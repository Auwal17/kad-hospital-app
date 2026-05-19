# laboratory/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LabTestTypeViewSet, LabRequestViewSet, LabResultViewSet

router = DefaultRouter()
router.register(r'test-types', LabTestTypeViewSet, basename='test-type')
router.register(r'requests', LabRequestViewSet, basename='lab-request')
router.register(r'results', LabResultViewSet, basename='lab-result')

urlpatterns = [
    path('', include(router.urls)),
]