# consultations/models.py
from django.db import models
from django.conf import settings
from visits.models import Visit

class Consultation(models.Model):
    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name='consultation_record')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    symptoms = models.TextField()
    
    # JSONField allows flexible key-value pairs like {"BP": "120/80", "Temp": "37.5C", "Weight": "70kg"}
    vitals = models.JSONField(default=dict, blank=True)
    
    diagnosis = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Consultation: Visit #{self.visit.id}"