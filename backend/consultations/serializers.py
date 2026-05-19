# consultations/serializers.py
from rest_framework import serializers
from .models import Consultation
from pharmacy.models import Prescription, Medication

class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = '__all__'
        read_only_fields = ['doctor', 'created_at']

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    medication_name = serializers.CharField(source='medication.name', read_only=True)

    class Meta:
        model = Prescription
        fields = '__all__'
        read_only_fields = ['doctor', 'status', 'created_at']