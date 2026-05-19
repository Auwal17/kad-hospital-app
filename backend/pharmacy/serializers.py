from rest_framework import serializers
from .models import Medication, Prescription

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['id', 'name', 'stock_quantity', 'unit', 'price', 'created_at']


class PrescriptionSerializer(serializers.ModelSerializer):
    # This is a magic field! It looks at the linked Medication model and grabs its 'name'.
    # This matches exactly what our React frontend is looking for: `rx.medication_name`
    medication_name = serializers.CharField(source='medication.name', read_only=True)

    class Meta:
        model = Prescription
        fields = [
            'id', 
            'visit', 
            'medication', 
            'medication_name',  # 👈 Exposing the magic field to React
            'dosage', 
            'frequency', 
            'duration', 
            'instructions', 
            'status', 
            'created_at'
        ]
        # We don't make 'status' read-only because the Pharmacist needs to PATCH it to 'dispensed'
        read_only_fields = ['created_at']