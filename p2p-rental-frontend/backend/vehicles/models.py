from django.db import models
from django.conf import settings


class Vehicle(models.Model):
    """
    Core vehicle listing owned by a host.
    """

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING_VERIFICATION = 'PENDING_VERIFICATION', 'Pending Verification'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    class VehicleType(models.TextChoices):
        SEDAN = 'Sedan'
        SUV = 'SUV'
        HATCHBACK = 'Hatchback'
        SPORTS = 'Sports'
        LUXURY = 'Luxury'
        ELECTRIC = 'Electric'
        MOTORCYCLE = 'Motorcycle'
        TRUCK = 'Truck'
        VAN = 'Van'

    class FuelType(models.TextChoices):
        PETROL = 'Petrol'
        DIESEL = 'Diesel'
        ELECTRIC = 'Electric'
        HYBRID = 'Hybrid'
        CNG = 'CNG'

    class Transmission(models.TextChoices):
        AUTOMATIC = 'Automatic'
        MANUAL = 'Manual'

    # ── Relationships ──────────────────────────────────────────
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vehicles',
    )

    # ── Core fields ────────────────────────────────────────────
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    vehicle_type = models.CharField(max_length=20, choices=VehicleType.choices)
    registration_number = models.CharField(max_length=20, unique=True)
    fuel_type = models.CharField(max_length=10, choices=FuelType.choices)
    transmission = models.CharField(max_length=12, choices=Transmission.choices)
    seats = models.PositiveSmallIntegerField(default=5)
    description = models.TextField(blank=True, default='')
    location = models.CharField(max_length=255)

    # ── Pricing ────────────────────────────────────────────────
    price_per_day = models.DecimalField(max_digits=8, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    # ── Status ─────────────────────────────────────────────────
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )

    # ── Timestamps ─────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'vehicle_type'], name='idx_vehicle_status_type'),
            models.Index(fields=['location'], name='idx_vehicle_location'),
            models.Index(fields=['price_per_day'], name='idx_vehicle_price'),
            models.Index(fields=['fuel_type'], name='idx_vehicle_fuel'),
            models.Index(fields=['transmission'], name='idx_vehicle_transmission'),
            models.Index(fields=['owner', 'status'], name='idx_vehicle_owner_status'),
        ]

    def __str__(self):
        return f"{self.year} {self.make} {self.model}"

    @property
    def display_name(self):
        return f"{self.make} {self.model}"


class VehicleImage(models.Model):
    """
    Photos uploaded for a vehicle listing.
    """
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='vehicles/images/')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-uploaded_at']

    def __str__(self):
        return f"Image for {self.vehicle} (order={self.order})"


class VehicleDocument(models.Model):
    """
    Verification documents (registration certificate, insurance, etc.).
    """

    class DocumentType(models.TextChoices):
        REGISTRATION = 'REGISTRATION', 'Registration Certificate'
        INSURANCE = 'INSURANCE', 'Insurance'
        PUC = 'PUC', 'Pollution Under Control'
        OTHER = 'OTHER', 'Other'

    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DocumentType.choices)
    file = models.FileField(upload_to='vehicles/documents/')
    verification_status = models.CharField(
        max_length=10,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['vehicle', 'document_type']

    def __str__(self):
        return f"{self.get_document_type_display()} for {self.vehicle}"


class Availability(models.Model):
    """
    Tracks availability windows for a vehicle.
    Overlaps of BLOCKED or BOOKED statuses mean the vehicle is unavailable.
    """
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        BLOCKED = 'BLOCKED', 'Blocked'
        BOOKED = 'BOOKED', 'Booked'

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='availabilities')
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.BLOCKED)
    reason = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_datetime']
        indexes = [
            models.Index(fields=['vehicle', 'start_datetime', 'end_datetime'], name='idx_availability_dates'),
            models.Index(fields=['vehicle', 'status'], name='idx_availability_status'),
        ]

    def __str__(self):
        return f"{self.vehicle} {self.status} ({self.start_datetime} to {self.end_datetime})"
