from rest_framework import serializers
from .models import Visit, Queue
from patients.serializers import PatientSerializer

# Import your serializers
from consultations.serializers import ConsultationSerializer, PrescriptionSerializer
from laboratory.serializers import LabRequestSerializer

class VisitSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    
    consultation = serializers.SerializerMethodField()
    lab_requests = serializers.SerializerMethodField()
    prescriptions = serializers.SerializerMethodField()

    class Meta:
        model = Visit
        fields = [
            'id', 'patient', 'patient_details', 'created_by', 'status', 
            'visit_date', 'completed_at', 
            'consultation', 'lab_requests', 'prescriptions'
        ]
        read_only_fields = ['created_by', 'visit_date', 'completed_at']

    def get_consultation(self, obj):
        # Safety Net 1: If you used a OneToOneField
        if hasattr(obj, 'consultation'):
            return ConsultationSerializer(obj.consultation).data
        
        # Safety Net 2: If you used a ForeignKey
        if hasattr(obj, 'consultation_set') and obj.consultation_set.exists():
            return ConsultationSerializer(obj.consultation_set.first()).data
            
        return None

    def get_lab_requests(self, obj):
        try:
            labs = obj.labrequest_set.all()
            return LabRequestSerializer(labs, many=True).data
        except AttributeError:
            return []

    def get_prescriptions(self, obj):
        try:
            rx = obj.prescription_set.all()
            return PrescriptionSerializer(rx, many=True).data
        except AttributeError:
            return []

# 👈 THIS WAS MISSING! I brought it back.
class QueueSerializer(serializers.ModelSerializer):
    visit_details = VisitSerializer(source='visit', read_only=True)

    class Meta:
        model = Queue
        fields = ['id', 'visit', 'visit_details', 'queue_number', 'department', 'status', 'created_at']
        read_only_fields = ['queue_number', 'created_at']