# consultations/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Consultation
from pharmacy.models import Medication, Prescription
from .serializers import ConsultationSerializer, MedicationSerializer, PrescriptionSerializer

class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all().order_by('-created_at')
    serializer_class = ConsultationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['visit']

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)

class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.all().order_by('name')
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all().order_by('-created_at')
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['visit', 'status']

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)