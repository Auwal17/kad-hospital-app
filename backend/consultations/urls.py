# consultations/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsultationViewSet, MedicationViewSet, PrescriptionViewSet

router = DefaultRouter()
router.register(r'consultations', ConsultationViewSet, basename='consultation')
router.register(r'medications', MedicationViewSet, basename='medication')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')

urlpatterns = [
    path('', include(router.urls)),
]