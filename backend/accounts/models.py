# accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class Role(models.Model):
    """Defines the hospital system roles (Admin, Doctor, HIM, Lab, etc.)"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class CustomUserManager(BaseUserManager):
    """Custom manager needed for custom User model"""
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        # Automatically assign an 'Admin' role if it exists
        admin_role, created = Role.objects.get_or_create(name='Admin')
        extra_fields.setdefault('role', admin_role)

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    """The central user model for all hospital staff"""
    email = models.EmailField(unique=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    
    objects = CustomUserManager()

    def __str__(self):
        role_name = self.role.name if self.role else "No Role"
        return f"{self.first_name} {self.last_name} ({role_name})"