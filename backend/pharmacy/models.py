# pharmacy/models.py
from django.db import models
from django.conf import settings
from visits.models import Visit

class Medication(models.Model):
    name = models.CharField(max_length=255)
    stock_quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=50) # e.g., 'Tablet', 'ml', 'Bottle'
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} ({self.stock_quantity} {self.unit} available)"

class Prescription(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Pharmacy'),
        ('dispensed', 'Dispensed'),
    ]

    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    medication = models.ForeignKey(Medication, on_delete=models.PROTECT)
    dosage = models.CharField(max_length=100) # e.g., '500mg'
    frequency = models.CharField(max_length=100) # e.g., '2 times daily'
    duration = models.CharField(max_length=100) # e.g., '5 days'
    instructions = models.TextField(blank=True, help_text="e.g., Take after meals")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medication.name} for Visit #{self.visit.id}"