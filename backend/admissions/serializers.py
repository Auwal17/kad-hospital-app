# admissions/serializers.py
from rest_framework import serializers
from .models import Ward, Bed, Admission

class WardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ward
        fields = '__all__'

class BedSerializer(serializers.ModelSerializer):
    ward_name = serializers.CharField(source='ward.name', read_only=True)

    class Meta:
        model = Bed
        fields = '__all__'

class AdmissionSerializer(serializers.ModelSerializer):
    bed_details = BedSerializer(source='bed', read_only=True)

    class Meta:
        model = Admission
        fields = '__all__'
        read_only_fields = ['doctor', 'admission_date', 'discharge_date', 'status']