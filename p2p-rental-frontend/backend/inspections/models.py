from django.db import models
from django.conf import settings


class Inspection(models.Model):
    """
    Records the state of a vehicle at handover or return.
    Every booking requires two inspections:
    1. HANDOVER — before the trip starts (transitions booking to ACTIVE)
    2. RETURN   — after the trip ends (transitions booking to COMPLETED)
    """

    class Type(models.TextChoices):
        HANDOVER = 'HANDOVER', 'Handover Inspection'
        RETURN = 'RETURN', 'Return Inspection'

    class Condition(models.TextChoices):
        EXCELLENT = 'EXCELLENT', 'Excellent'
        GOOD = 'GOOD', 'Good'
        FAIR = 'FAIR', 'Fair'
        POOR = 'POOR', 'Poor'
        DAMAGED = 'DAMAGED', 'Damaged'

    # ── Relationships ──────────────────────────────────────────
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.PROTECT,
        related_name='inspections',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='inspections_created',
    )

    # ── Inspection details ─────────────────────────────────────
    inspection_type = models.CharField(max_length=10, choices=Type.choices)
    odometer = models.PositiveIntegerField(
        help_text="Odometer reading in miles/km at time of inspection."
    )
    fuel_level = models.PositiveSmallIntegerField(
        help_text="Fuel level as percentage (0-100).",
    )
    exterior_condition = models.CharField(
        max_length=10, choices=Condition.choices, default=Condition.GOOD,
    )
    interior_condition = models.CharField(
        max_length=10, choices=Condition.choices, default=Condition.GOOD,
    )
    notes = models.TextField(blank=True, default='')
    damage_notes = models.TextField(blank=True, default='')
    has_damage = models.BooleanField(default=False)

    # ── Computed differences (populated on RETURN inspections) ─
    odometer_difference = models.PositiveIntegerField(null=True, blank=True)
    fuel_difference = models.SmallIntegerField(null=True, blank=True)
    is_late_return = models.BooleanField(default=False)

    # ── Timestamps ─────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        # Prevent duplicate inspections per booking+type
        unique_together = ['booking', 'inspection_type']
        indexes = [
            models.Index(
                fields=['booking', 'inspection_type'],
                name='idx_inspection_booking_type',
            ),
        ]

    def __str__(self):
        return f"{self.get_inspection_type_display()} for Booking {self.booking_id}"


class InspectionPhoto(models.Model):
    """
    Photos attached to an inspection for evidence of vehicle condition.
    """
    inspection = models.ForeignKey(
        Inspection, on_delete=models.CASCADE, related_name='photos',
    )
    image = models.ImageField(upload_to='inspections/photos/')
    description = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Photo for {self.inspection}"
