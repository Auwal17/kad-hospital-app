# visits/views.py
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Visit, Queue
from .serializers import VisitSerializer, QueueSerializer

class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all().order_by('-visit_date')
    serializer_class = VisitSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ['status', 'patient']

    def perform_create(self, serializer):
        # Automatically set the 'created_by' field to the logged-in staff member
        serializer.save(created_by=self.request.user)

class QueueViewSet(viewsets.ModelViewSet):
    serializer_class = QueueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'department']

    def get_queryset(self):
        # Only return today's queue by default, ordered by queue number
        today = timezone.now().date()
        return Queue.objects.filter(created_at__date=today).order_by('queue_number')