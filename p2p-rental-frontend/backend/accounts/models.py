from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('RENTER', 'Renter'),
        ('OWNER', 'Owner'),
        ('ADMIN', 'Admin'),
    )
    
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    roles = models.JSONField(default=list)  # e.g., ["RENTER", "OWNER"]
    kyc_status = models.CharField(max_length=20, default='PENDING')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
