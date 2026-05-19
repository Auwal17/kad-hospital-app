# laboratory/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import LabTestType, LabRequest, LabResult
from .serializers import LabTestTypeSerializer, LabRequestSerializer, LabResultSerializer

class LabTestTypeViewSet(viewsets.ModelViewSet):
    queryset = LabTestType.objects.all().order_by('name')
    serializer_class = LabTestTypeSerializer
    permission_classes = [IsAuthenticated]

class LabRequestViewSet(viewsets.ModelViewSet):
    queryset = LabRequest.objects.all().order_by('-requested_at')
    serializer_class = LabRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['visit', 'status']

    def perform_create(self, serializer):
        # Tag the doctor who ordered it
        serializer.save(doctor=self.request.user)

        # Update the Visit status so the queue knows the patient is at the lab
        visit = serializer.validated_data['visit']
        visit.status = 'lab_pending'
        visit.save()

class LabResultViewSet(viewsets.ModelViewSet):
    queryset = LabResult.objects.all().order_by('-completed_at')
    serializer_class = LabResultSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Tag the lab technician who uploaded the result
        serializer.save(technician=self.request.user)
        
        # When a result is uploaded, send the patient back to the doctor's queue!
        lab_request = serializer.validated_data['lab_request']
        visit = lab_request.visit
        visit.status = 'waiting' # Back to waiting for the doctor
        visit.save()