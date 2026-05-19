# laboratory/models.py
from django.db import models
from django.conf import settings
from visits.models import Visit

class LabTestType(models.Model):
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class LabRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
    ]

    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='lab_requests')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='requested_tests')
    test_type = models.ForeignKey(LabTestType, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.test_type.name} for Visit #{self.visit.id}"

class LabResult(models.Model):
    lab_request = models.OneToOneField(LabRequest, on_delete=models.CASCADE, related_name='result')
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    result_text = models.TextField(help_text="Detailed text findings of the test")
    
    # This creates a safe folder where all lab documents will be saved
    attachment = models.FileField(upload_to='lab_results/%Y/%m/', blank=True, null=True)
    
    completed_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Automatically mark the request as completed when the result is saved
        self.lab_request.status = 'completed'
        self.lab_request.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Result for {self.lab_request.test_type.name}"