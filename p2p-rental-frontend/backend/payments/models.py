import uuid
from django.db import models
from django.conf import settings


class Payment(models.Model):
    """
    Represents a payment intent for a booking.
    One booking has exactly one Payment. A Payment may have
    multiple PaymentAttempts (retries, provider failures, etc.).
    """

    class Type(models.TextChoices):
        RENTAL = 'RENTAL', 'Rental Payment'
        SECURITY_DEPOSIT = 'SECURITY_DEPOSIT', 'Security Deposit'
        PLATFORM_FEE = 'PLATFORM_FEE', 'Platform Fee'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        AUTHORIZED = 'AUTHORIZED', 'Authorized'
        CAPTURED = 'CAPTURED', 'Captured'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'
        CANCELLED = 'CANCELLED', 'Cancelled'

    # ── Idempotency key ────────────────────────────────────────
    idempotency_key = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False,
        help_text="Ensures payment operations are idempotent."
    )

    # ── Relationships ──────────────────────────────────────────
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.PROTECT,
        related_name='payments',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='payments',
    )

    # ── Payment details ────────────────────────────────────────
    payment_type = models.CharField(max_length=20, choices=Type.choices)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING,
    )

    # ── Server-calculated amounts (source of truth) ────────────
    rental_amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # ── Provider reference (never store raw card data) ─────────
    provider_name = models.CharField(max_length=50, blank=True, default='')
    provider_payment_id = models.CharField(
        max_length=255, blank=True, default='',
        help_text="External payment ID from the provider (Stripe charge ID, etc.)",
    )

    # ── Metadata ───────────────────────────────────────────────
    currency = models.CharField(max_length=3, default='USD')
    description = models.TextField(blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)

    # ── Timestamps ─────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking', 'status'], name='idx_payment_booking_status'),
            models.Index(fields=['user', 'status'], name='idx_payment_user_status'),
            models.Index(fields=['provider_payment_id'], name='idx_payment_provider_id'),
            models.Index(fields=['idempotency_key'], name='idx_payment_idempotency'),
        ]

    def __str__(self):
        return f"Payment {self.idempotency_key} [{self.status}] ${self.total_amount}"


class PaymentAttempt(models.Model):
    """
    Immutable log of every provider interaction.
    Useful for debugging, auditing, and retry logic.
    Never mutated after creation.
    """

    class Result(models.TextChoices):
        SUCCESS = 'SUCCESS', 'Success'
        FAILURE = 'FAILURE', 'Failure'
        PENDING = 'PENDING', 'Pending'

    payment = models.ForeignKey(
        Payment, on_delete=models.CASCADE, related_name='attempts',
    )
    attempt_number = models.PositiveSmallIntegerField()
    result = models.CharField(max_length=10, choices=Result.choices)
    provider_response = models.JSONField(
        default=dict,
        help_text="Raw (sanitized) response from the payment provider.",
    )
    error_code = models.CharField(max_length=50, blank=True, default='')
    error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['attempt_number']
        unique_together = ['payment', 'attempt_number']

    def __str__(self):
        return f"Attempt {self.attempt_number} for {self.payment} [{self.result}]"


class Refund(models.Model):
    """
    Tracks refunds against a Payment.
    Partial refunds are supported (amount <= payment.total_amount).
    """

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    class Reason(models.TextChoices):
        CANCELLATION = 'CANCELLATION', 'Booking Cancellation'
        DISPUTE = 'DISPUTE', 'Dispute'
        OVERCHARGE = 'OVERCHARGE', 'Overcharge'
        SECURITY_DEPOSIT_RETURN = 'SECURITY_DEPOSIT_RETURN', 'Security Deposit Return'
        OTHER = 'OTHER', 'Other'

    idempotency_key = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False,
    )
    payment = models.ForeignKey(
        Payment, on_delete=models.PROTECT, related_name='refunds',
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=30, choices=Reason.choices)
    status = models.CharField(
        max_length=15, choices=Status.choices, default=Status.PENDING,
    )
    provider_refund_id = models.CharField(max_length=255, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['payment', 'status'], name='idx_refund_payment_status'),
        ]

    def __str__(self):
        return f"Refund {self.idempotency_key} ${self.amount} [{self.status}]"


class Payout(models.Model):
    """
    Tracks payouts to vehicle owners after a completed booking.
    Payout amount = rental_amount - platform_fee.
    """

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    idempotency_key = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False,
    )
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.PROTECT,
        related_name='payouts',
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='payouts',
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee_deducted = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=15, choices=Status.choices, default=Status.PENDING,
    )
    provider_payout_id = models.CharField(max_length=255, blank=True, default='')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'status'], name='idx_payout_owner_status'),
            models.Index(fields=['booking'], name='idx_payout_booking'),
        ]

    def __str__(self):
        return f"Payout {self.idempotency_key} ${self.amount} to {self.owner} [{self.status}]"
