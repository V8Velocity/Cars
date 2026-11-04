"""
payments/services.py

PaymentService — orchestrates all payment operations.

Design principles:
1. Backend calculates ALL prices (never trust frontend amounts).
2. All operations are idempotent via UUID idempotency keys.
3. Provider interactions are abstracted behind BasePaymentProvider.
4. Every provider call is logged as a PaymentAttempt (immutable audit trail).
5. Raw card data is never stored — only provider tokens/IDs.
"""
import math
from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError

from bookings.models import Booking
from .models import Payment, PaymentAttempt, Refund, Payout
from .providers import BasePaymentProvider
from .providers.mock import MockPaymentProvider


def _get_provider() -> BasePaymentProvider:
    """
    Factory function for payment provider.
    Switch this when integrating a real provider.
    """
    # TODO: Read from settings.PAYMENT_PROVIDER
    return MockPaymentProvider()


class PaymentService:
    """
    Orchestrates payment lifecycle:
    create_payment → process_payment → (refund | payout)
    """

    PLATFORM_FEE_RATE = Decimal('0.10')
    TAX_RATE = Decimal('0.05')

    # ── Server-Side Price Calculation ──────────────────────────

    @classmethod
    def calculate_price(cls, booking: Booking) -> dict:
        """
        Authoritative price calculation from booking data.
        Frontend calculations are for display only.
        """
        vehicle = booking.vehicle
        duration = booking.end_datetime - booking.start_datetime
        days = Decimal(math.ceil(duration.total_seconds() / 86400))
        if days < 1:
            days = Decimal('1')

        rental_amount = vehicle.price_per_day * days
        platform_fee = rental_amount * cls.PLATFORM_FEE_RATE
        tax = (rental_amount + platform_fee) * cls.TAX_RATE
        security_deposit = vehicle.security_deposit
        discount = Decimal('0')  # Future: coupon/promo logic
        total_amount = rental_amount + platform_fee + tax + security_deposit - discount

        return {
            'rental_amount': round(rental_amount, 2),
            'platform_fee': round(platform_fee, 2),
            'tax': round(tax, 2),
            'security_deposit': security_deposit,
            'discount': discount,
            'total_amount': round(total_amount, 2),
        }

    # ── Create Payment Intent ─────────────────────────────────

    @classmethod
    @transaction.atomic
    def create_payment(cls, *, booking: Booking) -> Payment:
        """
        Creates a Payment record with server-calculated pricing.
        Idempotent: if a PENDING payment already exists for this booking,
        returns the existing one.
        """
        # Idempotency: check for existing pending payment
        existing = Payment.objects.filter(
            booking=booking,
            status__in=[Payment.Status.PENDING, Payment.Status.AUTHORIZED],
        ).first()
        if existing:
            return existing

        pricing = cls.calculate_price(booking)

        payment = Payment.objects.create(
            booking=booking,
            user=booking.renter,
            payment_type=Payment.Type.RENTAL,
            status=Payment.Status.PENDING,
            currency='USD',
            description=f'Booking {booking.id}: {booking.vehicle}',
            **pricing,
        )
        return payment

    # ── Process Payment (Charge) ──────────────────────────────

    @classmethod
    @transaction.atomic
    def process_payment(
        cls,
        *,
        payment: Payment,
        provider: BasePaymentProvider = None,
    ) -> Payment:
        """
        Attempts to charge the payment through the provider.
        Creates an immutable PaymentAttempt record regardless of outcome.
        Idempotent: if already captured, returns immediately.
        """
        if provider is None:
            provider = _get_provider()

        # Idempotency: already captured
        if payment.status == Payment.Status.CAPTURED:
            return payment

        if payment.status not in (Payment.Status.PENDING, Payment.Status.FAILED):
            raise ValidationError(
                f"Cannot process payment in {payment.status} status."
            )

        # Determine attempt number
        attempt_number = payment.attempts.count() + 1

        # Use per-attempt idempotency key. Real providers (Stripe) cache
        # results by idempotency key — a failed charge returns the same
        # failure on retry with the same key. So retries need a new key.
        attempt_idempotency_key = f'{payment.idempotency_key}__attempt_{attempt_number}'

        # Call provider
        result = provider.charge(
            amount=payment.total_amount,
            currency=payment.currency,
            idempotency_key=attempt_idempotency_key,
            description=payment.description,
            metadata={
                'booking_id': payment.booking_id,
                'payment_id': payment.id,
            },
        )

        # Log the attempt (immutable audit trail)
        PaymentAttempt.objects.create(
            payment=payment,
            attempt_number=attempt_number,
            result=(
                PaymentAttempt.Result.SUCCESS if result.success
                else PaymentAttempt.Result.FAILURE
            ),
            provider_response=result.raw_response,
            error_code=result.error_code,
            error_message=result.error_message,
        )

        # Update payment status
        if result.success:
            payment.status = Payment.Status.CAPTURED
            payment.provider_name = provider.name
            payment.provider_payment_id = result.provider_payment_id
            payment.save(update_fields=[
                'status', 'provider_name', 'provider_payment_id', 'updated_at',
            ])
        else:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=['status', 'updated_at'])

        return payment

    # ── Refund ────────────────────────────────────────────────

    @classmethod
    @transaction.atomic
    def create_refund(
        cls,
        *,
        payment: Payment,
        amount: Decimal,
        reason: str,
        provider: BasePaymentProvider = None,
    ) -> Refund:
        """
        Issues a refund against a captured payment.
        Supports partial refunds (amount <= remaining refundable).
        Idempotent via Refund.idempotency_key.
        """
        if provider is None:
            provider = _get_provider()

        if payment.status != Payment.Status.CAPTURED:
            raise ValidationError("Can only refund a CAPTURED payment.")

        # Calculate already-refunded amount
        refunded_total = sum(
            r.amount for r in payment.refunds.filter(
                status__in=[Refund.Status.COMPLETED, Refund.Status.PROCESSING]
            )
        )
        remaining = payment.total_amount - refunded_total

        if amount > remaining:
            raise ValidationError(
                f"Refund amount ${amount} exceeds remaining refundable ${remaining}."
            )

        # Create refund record
        refund = Refund.objects.create(
            payment=payment,
            amount=amount,
            reason=reason,
            status=Refund.Status.PROCESSING,
        )

        # Call provider
        result = provider.refund(
            provider_payment_id=payment.provider_payment_id,
            amount=amount,
            idempotency_key=str(refund.idempotency_key),
            reason=reason,
        )

        if result.success:
            refund.status = Refund.Status.COMPLETED
            refund.provider_refund_id = result.provider_refund_id
            refund.save(update_fields=[
                'status', 'provider_refund_id', 'updated_at',
            ])

            # If fully refunded, update payment status
            new_refunded_total = refunded_total + amount
            if new_refunded_total >= payment.total_amount:
                payment.status = Payment.Status.REFUNDED
                payment.save(update_fields=['status', 'updated_at'])
        else:
            refund.status = Refund.Status.FAILED
            refund.save(update_fields=['status', 'updated_at'])

        return refund

    # ── Payout ────────────────────────────────────────────────

    @classmethod
    @transaction.atomic
    def create_payout(
        cls,
        *,
        booking: Booking,
        provider: BasePaymentProvider = None,
    ) -> Payout:
        """
        Disburses earnings to the vehicle owner after booking completion.
        Payout amount = rental_amount - platform_fee.
        Idempotent: if a payout already exists for this booking, returns it.
        """
        if provider is None:
            provider = _get_provider()

        if booking.status != 'COMPLETED':
            raise ValidationError("Can only create payouts for COMPLETED bookings.")

        # Idempotency: check for existing payout
        existing = Payout.objects.filter(
            booking=booking,
            status__in=[
                Payout.Status.PENDING,
                Payout.Status.PROCESSING,
                Payout.Status.COMPLETED,
            ],
        ).first()
        if existing:
            return existing

        # Get the captured payment
        payment = Payment.objects.filter(
            booking=booking, status=Payment.Status.CAPTURED,
        ).first()
        if not payment:
            raise ValidationError("No captured payment found for this booking.")

        payout_amount = payment.rental_amount - payment.platform_fee
        owner = booking.vehicle.owner

        payout = Payout.objects.create(
            booking=booking,
            owner=owner,
            amount=payout_amount,
            platform_fee_deducted=payment.platform_fee,
            status=Payout.Status.PROCESSING,
        )

        # Call provider
        result = provider.payout(
            recipient_id=str(owner.id),
            amount=payout_amount,
            currency=payment.currency,
            idempotency_key=str(payout.idempotency_key),
            description=f'Payout for booking {booking.id}',
        )

        if result.success:
            payout.status = Payout.Status.COMPLETED
            payout.provider_payout_id = result.provider_payout_id
            payout.save(update_fields=[
                'status', 'provider_payout_id', 'completed_at', 'updated_at',
            ])
        else:
            payout.status = Payout.Status.FAILED
            payout.save(update_fields=['status', 'updated_at'])

        return payout

    # ── Webhook Handler ───────────────────────────────────────

    @classmethod
    def handle_webhook(cls, *, event_type: str, payload: dict) -> None:
        """
        Webhook-ready architecture. Route provider events to handlers.
        Add real event types when integrating a provider.

        Example event types:
        - payment.captured
        - payment.failed
        - refund.completed
        - payout.completed
        """
        handlers = {
            'payment.captured': cls._handle_payment_captured,
            'payment.failed': cls._handle_payment_failed,
            'refund.completed': cls._handle_refund_completed,
            'payout.completed': cls._handle_payout_completed,
        }
        handler = handlers.get(event_type)
        if handler:
            handler(payload)

    @classmethod
    def _handle_payment_captured(cls, payload: dict):
        provider_id = payload.get('provider_payment_id', '')
        if not provider_id:
            return
        try:
            payment = Payment.objects.get(provider_payment_id=provider_id)
            if payment.status != Payment.Status.CAPTURED:
                payment.status = Payment.Status.CAPTURED
                payment.save(update_fields=['status', 'updated_at'])
        except Payment.DoesNotExist:
            pass

    @classmethod
    def _handle_payment_failed(cls, payload: dict):
        provider_id = payload.get('provider_payment_id', '')
        if not provider_id:
            return
        try:
            payment = Payment.objects.get(provider_payment_id=provider_id)
            if payment.status not in (Payment.Status.CAPTURED, Payment.Status.REFUNDED):
                payment.status = Payment.Status.FAILED
                payment.save(update_fields=['status', 'updated_at'])
        except Payment.DoesNotExist:
            pass

    @classmethod
    def _handle_refund_completed(cls, payload: dict):
        provider_refund_id = payload.get('provider_refund_id', '')
        if not provider_refund_id:
            return
        try:
            refund = Refund.objects.get(provider_refund_id=provider_refund_id)
            if refund.status != Refund.Status.COMPLETED:
                refund.status = Refund.Status.COMPLETED
                refund.save(update_fields=['status', 'updated_at'])
        except Refund.DoesNotExist:
            pass

    @classmethod
    def _handle_payout_completed(cls, payload: dict):
        provider_payout_id = payload.get('provider_payout_id', '')
        if not provider_payout_id:
            return
        try:
            payout = Payout.objects.get(provider_payout_id=provider_payout_id)
            if payout.status != Payout.Status.COMPLETED:
                payout.status = Payout.Status.COMPLETED
                payout.save(update_fields=['status', 'updated_at'])
        except Payout.DoesNotExist:
            pass
