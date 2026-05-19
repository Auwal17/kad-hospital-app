# admissions/models.py
from django.db import models
from django.conf import settings
from visits.models import Visit

class Ward(models.Model):
    name = models.CharField(max_length=100, unique=True)
    capacity = models.IntegerField(help_text="Total number of beds in this ward")

    def __str__(self):
        return f"{self.name} (Capacity: {self.capacity})"

class Bed(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Under Maintenance'),
    ]

    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='beds')
    bed_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')

    class Meta:
        unique_together = ('ward', 'bed_number') # Ensures no duplicate bed numbers in the same ward

    def __str__(self):
        return f"Bed {self.bed_number} - {self.ward.name} ({self.get_status_display()})"

class Admission(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('discharged', 'Discharged'),
    ]

    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name='admission_record')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='admitted_patients')
    bed = models.ForeignKey(Bed, on_delete=models.PROTECT, related_name='current_admission')
    admission_date = models.DateTimeField(auto_now_add=True)
    discharge_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    def __str__(self):
        return f"Admission for Visit #{self.visit.id} in {self.bed}"