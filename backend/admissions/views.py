# admissions/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Ward, Bed, Admission
from .serializers import WardSerializer, BedSerializer, AdmissionSerializer

class WardViewSet(viewsets.ModelViewSet):
    queryset = Ward.objects.all().order_by('name')
    serializer_class = WardSerializer
    permission_classes = [IsAuthenticated]

class BedViewSet(viewsets.ModelViewSet):
    queryset = Bed.objects.all().order_by('ward__name', 'bed_number')
    serializer_class = BedSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ward', 'status']

class AdmissionViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.all().order_by('-admission_date')
    serializer_class = AdmissionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'visit']

    def perform_create(self, serializer):
        bed = serializer.validated_data['bed']
        
        # 1. Save the admission and tag the admitting doctor
        admission = serializer.save(doctor=self.request.user)
        
        # 2. Mark the bed as occupied
        bed.status = 'occupied'
        bed.save()

        # 3. Update the visit status
        visit = admission.visit
        visit.status = 'admitted'
        visit.save()

    # Custom endpoint: PUT /api/admissions/:id/discharge/
    @action(detail=True, methods=['put'])
    def discharge(self, request, pk=None):
        admission = self.get_object()
        
        if admission.status == 'discharged':
            return Response({'detail': 'Patient is already discharged.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Update Admission record
        admission.status = 'discharged'
        admission.discharge_date = timezone.now()
        admission.save()

        # 2. Free up the bed
        bed = admission.bed
        bed.status = 'available'
        bed.save()

        # 3. Mark the overall Visit as completed
        visit = admission.visit
        visit.status = 'completed'
        visit.completed_at = timezone.now()
        visit.save()

        return Response({'status': 'Patient successfully discharged and bed cleared.'})