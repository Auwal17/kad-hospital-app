# patients/views.py
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Patient
from .serializers import PatientSerializer

class PatientViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows patients to be viewed, created, or edited.
    """
    queryset = Patient.objects.all().order_by('-created_at')
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated] # Locks the endpoint behind JWT
    
    # Enable powerful searching and filtering for the HIM Officer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['patient_number', 'first_name', 'last_name', 'phone']
    filterset_fields = ['gender', 'blood_group']