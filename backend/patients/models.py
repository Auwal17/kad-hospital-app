# patients/models.py
from django.db import models
import uuid
from datetime import datetime

class Patient(models.Model):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('O+', 'O+'), ('O-', 'O-'), ('AB+', 'AB+'), ('AB-', 'AB-')
    ]

    patient_number = models.CharField(max_length=30, unique=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS, blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    next_of_kin = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto-generate Patient Number on creation
        if not self.patient_number:
            date_str = datetime.now().strftime('%Y%m%d')
            # Generate a random 4-character alphanumeric string
            unique_id = str(uuid.uuid4().hex)[:4].upper()
            self.patient_number = f"PT-{date_str}-{unique_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.patient_number})"