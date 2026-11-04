"""
payments/tests.py

Tests for the PaymentService, MockPaymentProvider,
and the full payment lifecycle.
"""
import datetime
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from vehicles.models import Vehicle
from bookings.models import Booking
from payments.models import Payment, PaymentAttempt, Refund, Payout
from payments.services import PaymentService
from payments.providers.mock import MockPaymentProvider

User = get_user_model()


class PaymentTestBase(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email='owner@test.com', username='owner',
            password='password', roles=['OWNER'], kyc_status='APPROVED',
        )
        self.renter = User.objects.create_user(
            email='renter@test.com', username='renter',
            password='password', roles=['RENTER'], kyc_status='APPROVED',
        )
        self.vehicle = Vehicle.objects.create(
            owner=self.owner, make='Tesla', model='Model 3',
            year=2025, vehicle_type='Sedan',
            registration_number='PAY-001',
            fuel_type='Electric', transmission='Automatic',
            seats=5, location='San Francisco',
            price_per_day=Decimal('100.00'),
            security_deposit=Decimal('500.00'),
            status=Vehicle.Status.APPROVED,
        )
        start = timezone.now() + datetime.timedelta(days=10)
        self.booking = Booking.objects.create(
            vehicle=self.vehicle, renter=self.renter,
            start_datetime=start,
            end_datetime=start + datetime.timedelta(days=2),
            status=Booking.Status.PENDING,
            rental_amount=Decimal('200.00'),
            platform_fee=Decimal('20.00'),
            tax=Decimal('11.00'),
            security_deposit=Decimal('500.00'),
            total_amount=Decimal('731.00'),
        )
        self.provider = MockPaymentProvider()


class TestPaymentCreation(PaymentTestBase):
    def test_create_payment_calculates_price_server_side(self):
        payment = PaymentService.create_payment(booking=self.booking)
        self.assertEqual(payment.rental_amount, Decimal('200.00'))
        self.assertEqual(payment.platform_fee, Decimal('20.00'))
        self.assertEqual(payment.tax, Decimal('11.00'))
        self.assertEqual(payment.security_deposit, Decimal('500.00'))
        self.assertEqual(payment.total_amount, Decimal('731.00'))
        self.assertEqual(payment.status, Payment.Status.PENDING)

    def test_create_payment_idempotent(self):
        p1 = PaymentService.create_payment(booking=self.booking)
        p2 = PaymentService.create_payment(booking=self.booking)
        self.assertEqual(p1.id, p2.id)
        self.assertEqual(Payment.objects.filter(booking=self.booking).count(), 1)


class TestPaymentProcessing(PaymentTestBase):
    def test_process_payment_success(self):
        payment = PaymentService.create_payment(booking=self.booking)
        payment = PaymentService.process_payment(
            payment=payment, provider=self.provider,
        )
        self.assertEqual(payment.status, Payment.Status.CAPTURED)
        self.assertTrue(payment.provider_payment_id.startswith('mock_ch_'))
        self.assertEqual(payment.provider_name, 'mock')

    def test_process_creates_attempt_record(self):
        payment = PaymentService.create_payment(booking=self.booking)
        PaymentService.process_payment(payment=payment, provider=self.provider)
        attempts = PaymentAttempt.objects.filter(payment=payment)
        self.assertEqual(attempts.count(), 1)
        self.assertEqual(attempts.first().result, PaymentAttempt.Result.SUCCESS)
        self.assertEqual(attempts.first().attempt_number, 1)

    def test_process_payment_failure_then_retry(self):
        payment = PaymentService.create_payment(booking=self.booking)
        fail_provider = MockPaymentProvider(fail_next=True)

        # First attempt fails
        payment = PaymentService.process_payment(
            payment=payment, provider=fail_provider,
        )
        self.assertEqual(payment.status, Payment.Status.FAILED)

        # Retry succeeds
        payment = PaymentService.process_payment(
            payment=payment, provider=fail_provider,
        )
        self.assertEqual(payment.status, Payment.Status.CAPTURED)
        self.assertEqual(PaymentAttempt.objects.filter(payment=payment).count(), 2)

    def test_process_captured_is_idempotent(self):
        payment = PaymentService.create_payment(booking=self.booking)
        PaymentService.process_payment(payment=payment, provider=self.provider)

        # Second call returns same result without creating new attempt
        payment.refresh_from_db()
        result = PaymentService.process_payment(
            payment=payment, provider=self.provider,
        )
        self.assertEqual(result.status, Payment.Status.CAPTURED)
        self.assertEqual(PaymentAttempt.objects.filter(payment=payment).count(), 1)


class TestRefunds(PaymentTestBase):
    def test_full_refund(self):
        payment = PaymentService.create_payment(booking=self.booking)
        PaymentService.process_payment(payment=payment, provider=self.provider)

        refund = PaymentService.create_refund(
            payment=payment,
            amount=payment.total_amount,
            reason='CANCELLATION',
            provider=self.provider,
        )
        self.assertEqual(refund.status, Refund.Status.COMPLETED)
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.REFUNDED)

    def test_partial_refund(self):
        payment = PaymentService.create_payment(booking=self.booking)
        PaymentService.process_payment(payment=payment, provider=self.provider)

        refund = PaymentService.create_refund(
            payment=payment,
            amount=Decimal('100.00'),
            reason='OVERCHARGE',
            provider=self.provider,
        )
        self.assertEqual(refund.status, Refund.Status.COMPLETED)
        payment.refresh_from_db()
        # Still CAPTURED because only partially refunded
        self.assertEqual(payment.status, Payment.Status.CAPTURED)

    def test_refund_exceeding_remaining_fails(self):
        payment = PaymentService.create_payment(booking=self.booking)
        PaymentService.process_payment(payment=payment, provider=self.provider)

        # Partial refund first
        PaymentService.create_refund(
            payment=payment, amount=Decimal('700.00'),
            reason='CANCELLATION', provider=self.provider,
        )
        # Remaining is $31 — try to refund $100
        with self.assertRaises(ValidationError):
            PaymentService.create_refund(
                payment=payment, amount=Decimal('100.00'),
                reason='OVERCHARGE', provider=self.provider,
            )

    def test_refund_uncaptured_fails(self):
        payment = PaymentService.create_payment(booking=self.booking)
        with self.assertRaises(ValidationError):
            PaymentService.create_refund(
                payment=payment, amount=Decimal('50.00'),
                reason='CANCELLATION', provider=self.provider,
            )


class TestPayouts(PaymentTestBase):
    def test_payout_after_completion(self):
        payment = PaymentService.create_payment(booking=self.booking)
        PaymentService.process_payment(payment=payment, provider=self.provider)

        self.booking.status = Booking.Status.COMPLETED
        self.booking.save()

        payout = PaymentService.create_payout(
            booking=self.booking, provider=self.provider,
        )
        self.assertEqual(payout.status, Payout.Status.COMPLETED)
        # Payout = rental(200) - platform_fee(20) = 180
        self.assertEqual(payout.amount, Decimal('180.00'))
        self.assertEqual(payout.platform_fee_deducted, Decimal('20.00'))
        self.assertEqual(payout.owner, self.owner)

    def test_payout_idempotent(self):
        payment = PaymentService.create_payment(booking=self.booking)
        PaymentService.process_payment(payment=payment, provider=self.provider)
        self.booking.status = Booking.Status.COMPLETED
        self.booking.save()

        p1 = PaymentService.create_payout(booking=self.booking, provider=self.provider)
        p2 = PaymentService.create_payout(booking=self.booking, provider=self.provider)
        self.assertEqual(p1.id, p2.id)

    def test_payout_non_completed_booking_fails(self):
        with self.assertRaises(ValidationError):
            PaymentService.create_payout(
                booking=self.booking, provider=self.provider,
            )


class TestMockProviderIdempotency(TestCase):
    def test_duplicate_charge_returns_same_result(self):
        provider = MockPaymentProvider()
        r1 = provider.charge(
            amount=Decimal('100'), currency='USD',
            idempotency_key='test-key-1',
        )
        r2 = provider.charge(
            amount=Decimal('100'), currency='USD',
            idempotency_key='test-key-1',
        )
        self.assertEqual(r1.provider_payment_id, r2.provider_payment_id)

    def test_different_keys_create_different_charges(self):
        provider = MockPaymentProvider()
        r1 = provider.charge(
            amount=Decimal('100'), currency='USD',
            idempotency_key='key-a',
        )
        r2 = provider.charge(
            amount=Decimal('100'), currency='USD',
            idempotency_key='key-b',
        )
        self.assertNotEqual(r1.provider_payment_id, r2.provider_payment_id)

    def test_failure_simulation(self):
        provider = MockPaymentProvider(fail_next=True)
        r = provider.charge(
            amount=Decimal('100'), currency='USD',
            idempotency_key='fail-test',
        )
        self.assertFalse(r.success)
        self.assertEqual(r.error_code, 'CARD_DECLINED')


class TestWebhookHandling(PaymentTestBase):
    def test_payment_captured_webhook(self):
        payment = PaymentService.create_payment(booking=self.booking)
        PaymentService.process_payment(payment=payment, provider=self.provider)
        payment.refresh_from_db()

        # Simulate webhook confirming the charge
        PaymentService.handle_webhook(
            event_type='payment.captured',
            payload={'provider_payment_id': payment.provider_payment_id},
        )
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.CAPTURED)

    def test_unknown_webhook_type_ignored(self):
        # Should not raise
        PaymentService.handle_webhook(
            event_type='unknown.event',
            payload={'foo': 'bar'},
        )
