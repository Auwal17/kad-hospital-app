# laboratory/serializers.py
from rest_framework import serializers
from .models import LabTestType, LabRequest, LabResult

class LabTestTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTestType
        fields = '__all__'

class LabResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabResult
        fields = '__all__'
        read_only_fields = ['technician', 'completed_at']

class LabRequestSerializer(serializers.ModelSerializer):
    test_name = serializers.CharField(source='test_type.name', read_only=True)
    result = LabResultSerializer(read_only=True) # Automatically attaches the result if it exists!

    class Meta:
        model = LabRequest
        fields = ['id', 'visit', 'doctor', 'test_type', 'test_name', 'status', 'requested_at', 'result']
        read_only_fields = ['doctor', 'status', 'requested_at']