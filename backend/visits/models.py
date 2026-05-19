# visits/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

class Visit(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting for Doctor'),
        ('consultation', 'In Consultation'),
        ('lab_pending', 'Waiting for Lab Results'),
        ('pharmacy', 'Waiting at Pharmacy'),
        ('admitted', 'Admitted to Ward'),
        ('completed', 'Completed/Discharged'),
    ]

    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='visits')
    # The staff member who registered the visit
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='registered_visits')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    visit_date = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Visit: {self.patient.first_name} {self.patient.last_name} - {self.visit_date.strftime('%Y-%m-%d')}"

class Queue(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]

    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name='queue_entry')
    queue_number = models.IntegerField(blank=True)
    department = models.CharField(max_length=50, default='General Practice')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Automatically generate the next queue number for TODAY
        if not self.queue_number:
            today = timezone.now().date()
            # Count how many people are already in the queue today
            current_count = Queue.objects.filter(created_at__date=today).count()
            self.queue_number = current_count + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Queue #{self.queue_number} - {self.visit.patient.first_name}"