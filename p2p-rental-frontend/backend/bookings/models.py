from django.db import models
from django.conf import settings


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        ACTIVE = 'ACTIVE', 'Active'
        COMPLETED = 'COMPLETED', 'Completed'
        REJECTED = 'REJECTED', 'Rejected'

    # ── Relationships ──────────────────────────────────────────
    vehicle = models.ForeignKey(
        'vehicles.Vehicle', 
        on_delete=models.PROTECT, 
        related_name='bookings'
    )
    renter = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name='bookings'
    )

    # ── Timeline ───────────────────────────────────────────────
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()

    # ── Pricing ────────────────────────────────────────────────
    rental_amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # ── Status ─────────────────────────────────────────────────
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING,
        db_index=True
    )

    # ── Timestamps ─────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['renter', 'status'], name='idx_booking_renter_status'),
            models.Index(fields=['vehicle', 'status'], name='idx_booking_vehicle_status'),
            models.Index(fields=['start_datetime', 'end_datetime'], name='idx_booking_dates'),
        ]

    def __str__(self):
        return f"Booking {self.id} for {self.vehicle} by {self.renter}"
