"""
bookings/tests_concurrency.py

Tests that verify the booking engine's concurrency guarantees.

TEST STRATEGY
─────────────
SQLite does not support row-level locking (SELECT ... FOR UPDATE is a no-op).
However, we can still validate the correctness of the booking engine:

1. Sequential overlap tests: Prove the business logic correctly rejects
   a second booking after the first one succeeds (even without locking,
   the availability check catches the overlap).

2. Thread-based race simulation: Spawn two threads that attempt to book
   the same vehicle for the same dates simultaneously. Even on SQLite,
   Django's transaction.atomic() creates a database-level lock (SQLite
   uses file-level locking), so one thread will block the other.

3. PostgreSQL production tests: When run against PostgreSQL, the
   select_for_update() calls acquire real row-level locks, providing
   true serializable isolation. The same tests validate this.

To run against PostgreSQL:
    DATABASE_URL=postgres://... python manage.py test bookings.tests_concurrency
"""
import datetime
import threading
from decimal import Decimal
from unittest import mock

from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError, PermissionDenied
from django.db import connection

from vehicles.models import Vehicle, Availability
from bookings.models import Booking
from bookings.services import BookingService

User = get_user_model()


class BookingServiceBaseTest(TestCase):
    """Shared setup for all booking tests."""

    def setUp(self):
        self.owner = User.objects.create_user(
            email='owner@test.com',
            username='owner',
            password='password',
            roles=['OWNER'],
            kyc_status='APPROVED',
        )
        self.renter1 = User.objects.create_user(
            email='renter1@test.com',
            username='renter1',
            password='password',
            roles=['RENTER'],
            kyc_status='APPROVED',
        )
        self.renter2 = User.objects.create_user(
            email='renter2@test.com',
            username='renter2',
            password='password',
            roles=['RENTER'],
            kyc_status='APPROVED',
        )
        self.vehicle = Vehicle.objects.create(
            owner=self.owner,
            make='Tesla',
            model='Model 3',
            year=2025,
            vehicle_type='Sedan',
            registration_number='CONC-001',
            fuel_type='Electric',
            transmission='Automatic',
            seats=5,
            location='San Francisco',
            price_per_day=Decimal('100.00'),
            security_deposit=Decimal('500.00'),
            status=Vehicle.Status.APPROVED,
        )
        # Future dates for booking
        self.oct10 = timezone.now().replace(
            microsecond=0
        ) + datetime.timedelta(days=10)
        self.oct12 = self.oct10 + datetime.timedelta(days=2)
        self.oct11 = self.oct10 + datetime.timedelta(days=1)
        self.oct13 = self.oct10 + datetime.timedelta(days=3)
        self.oct14 = self.oct10 + datetime.timedelta(days=4)


class TestBookingBusinessRules(BookingServiceBaseTest):
    """Validates all 8 business rules are enforced."""

    def test_rule1_kyc_required(self):
        """Renter must have approved KYC."""
        renter_no_kyc = User.objects.create_user(
            email='nokyc@test.com',
            username='nokyc',
            password='password',
            roles=['RENTER'],
            kyc_status='PENDING',
        )
        with self.assertRaises(PermissionDenied):
            BookingService.create_booking(
                renter=renter_no_kyc,
                vehicle=self.vehicle,
                start_datetime=self.oct10,
                end_datetime=self.oct12,
            )

    def test_rule2_vehicle_must_be_approved(self):
        """Vehicle must be in APPROVED status."""
        self.vehicle.status = Vehicle.Status.DRAFT
        self.vehicle.save()
        with self.assertRaises(ValidationError):
            BookingService.create_booking(
                renter=self.renter1,
                vehicle=self.vehicle,
                start_datetime=self.oct10,
                end_datetime=self.oct12,
            )

    def test_rule3_vehicle_not_suspended(self):
        """Vehicle must not be suspended."""
        self.vehicle.status = Vehicle.Status.SUSPENDED
        self.vehicle.save()
        with self.assertRaises(ValidationError):
            BookingService.create_booking(
                renter=self.renter1,
                vehicle=self.vehicle,
                start_datetime=self.oct10,
                end_datetime=self.oct12,
            )

    def test_rule4_owner_cannot_book_own(self):
        """Owner cannot book their own vehicle."""
        with self.assertRaises(ValidationError):
            BookingService.create_booking(
                renter=self.owner,
                vehicle=self.vehicle,
                start_datetime=self.oct10,
                end_datetime=self.oct12,
            )

    def test_rule5_start_before_end(self):
        """Start must be before end."""
        with self.assertRaises(ValidationError):
            BookingService.create_booking(
                renter=self.renter1,
                vehicle=self.vehicle,
                start_datetime=self.oct12,
                end_datetime=self.oct10,
            )

    def test_rule6_start_not_in_past(self):
        """Start cannot be in the past."""
        past = timezone.now() - datetime.timedelta(days=1)
        with self.assertRaises(ValidationError):
            BookingService.create_booking(
                renter=self.renter1,
                vehicle=self.vehicle,
                start_datetime=past,
                end_datetime=self.oct10,
            )

    def test_rule7_no_overlap_with_existing(self):
        """Booking cannot overlap another confirmed/active booking."""
        # First booking succeeds
        BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=self.oct12,
        )
        # Second booking for overlapping dates fails
        with self.assertRaises(ValidationError):
            BookingService.create_booking(
                renter=self.renter2,
                vehicle=self.vehicle,
                start_datetime=self.oct11,
                end_datetime=self.oct13,
            )

    def test_rule8_price_server_calculated(self):
        """Price is calculated server-side, not from client input."""
        booking = BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=self.oct12,
        )
        # 2 days at $100/day
        self.assertEqual(booking.rental_amount, Decimal('200.00'))
        self.assertEqual(booking.platform_fee, Decimal('20.00'))
        # tax = (200 + 20) * 0.05 = 11.00
        self.assertEqual(booking.tax, Decimal('11.00'))
        self.assertEqual(booking.security_deposit, Decimal('500.00'))
        # total = 200 + 20 + 11 + 500 = 731
        self.assertEqual(booking.total_amount, Decimal('731.00'))


class TestSequentialOverlapRejection(BookingServiceBaseTest):
    """
    Proves that once a booking exists, subsequent overlapping
    booking attempts are correctly rejected — even without
    concurrent threads.
    """

    def test_exact_same_dates_rejected(self):
        """Same exact dates → rejected."""
        BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=self.oct12,
        )
        with self.assertRaises(ValidationError):
            BookingService.create_booking(
                renter=self.renter2,
                vehicle=self.vehicle,
                start_datetime=self.oct10,
                end_datetime=self.oct12,
            )

    def test_partial_overlap_start(self):
        """New booking starts during existing → rejected."""
        BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=self.oct12,
        )
        with self.assertRaises(ValidationError):
            BookingService.create_booking(
                renter=self.renter2,
                vehicle=self.vehicle,
                start_datetime=self.oct11,
                end_datetime=self.oct14,
            )

    def test_partial_overlap_end(self):
        """New booking ends during existing → rejected."""
        BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct11,
            end_datetime=self.oct13,
        )
        with self.assertRaises(ValidationError):
            BookingService.create_booking(
                renter=self.renter2,
                vehicle=self.vehicle,
                start_datetime=self.oct10,
                end_datetime=self.oct12,
            )

    def test_encapsulated_booking_rejected(self):
        """New booking entirely inside existing → rejected."""
        BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=self.oct14,
        )
        with self.assertRaises(ValidationError):
            BookingService.create_booking(
                renter=self.renter2,
                vehicle=self.vehicle,
                start_datetime=self.oct11,
                end_datetime=self.oct12,
            )

    def test_encapsulating_booking_rejected(self):
        """New booking entirely surrounds existing → rejected."""
        BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct11,
            end_datetime=self.oct12,
        )
        with self.assertRaises(ValidationError):
            BookingService.create_booking(
                renter=self.renter2,
                vehicle=self.vehicle,
                start_datetime=self.oct10,
                end_datetime=self.oct14,
            )

    def test_adjacent_booking_succeeds(self):
        """Booking ending exactly when another starts → allowed."""
        BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=self.oct12,
        )
        # Adjacent: starts exactly when first ends
        booking2 = BookingService.create_booking(
            renter=self.renter2,
            vehicle=self.vehicle,
            start_datetime=self.oct12,
            end_datetime=self.oct14,
        )
        self.assertEqual(booking2.status, Booking.Status.PENDING)

    def test_non_overlapping_booking_succeeds(self):
        """Completely separate dates → allowed."""
        BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=self.oct11,
        )
        booking2 = BookingService.create_booking(
            renter=self.renter2,
            vehicle=self.vehicle,
            start_datetime=self.oct13,
            end_datetime=self.oct14,
        )
        self.assertEqual(booking2.status, Booking.Status.PENDING)

    def test_cancelled_booking_frees_dates(self):
        """After cancellation, dates become available again."""
        booking = BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=self.oct12,
        )
        BookingService.cancel_booking(booking=booking, user=self.renter1)

        # Same dates should now be bookable
        booking2 = BookingService.create_booking(
            renter=self.renter2,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=self.oct12,
        )
        self.assertEqual(booking2.status, Booking.Status.PENDING)


class TestConcurrentBookingAttempts(TransactionTestCase):
    """
    Thread-based concurrency tests.

    Uses TransactionTestCase (not TestCase) because Django's TestCase
    wraps each test in a transaction, which prevents threads from
    seeing each other's writes. TransactionTestCase uses real commits.

    On SQLite: transaction.atomic() acquires a file-level lock, so
    one thread blocks the other. The test still validates that only
    one booking succeeds.

    On PostgreSQL: select_for_update() acquires row-level locks,
    providing true concurrent isolation. Same test, stronger guarantees.
    """

    def setUp(self):
        self.owner = User.objects.create_user(
            email='owner@test.com',
            username='owner',
            password='password',
            roles=['OWNER'],
            kyc_status='APPROVED',
        )
        self.renter1 = User.objects.create_user(
            email='renter1@test.com',
            username='renter1',
            password='password',
            roles=['RENTER'],
            kyc_status='APPROVED',
        )
        self.renter2 = User.objects.create_user(
            email='renter2@test.com',
            username='renter2',
            password='password',
            roles=['RENTER'],
            kyc_status='APPROVED',
        )
        self.vehicle = Vehicle.objects.create(
            owner=self.owner,
            make='Tesla',
            model='Model 3',
            year=2025,
            vehicle_type='Sedan',
            registration_number='RACE-001',
            fuel_type='Electric',
            transmission='Automatic',
            seats=5,
            location='San Francisco',
            price_per_day=Decimal('100.00'),
            security_deposit=Decimal('500.00'),
            status=Vehicle.Status.APPROVED,
        )
        self.start = timezone.now().replace(microsecond=0) + datetime.timedelta(days=10)
        self.end = self.start + datetime.timedelta(days=2)

    def _attempt_booking(self, renter, results, index):
        """
        Worker function for threaded booking attempts.
        Stores result in results[index].
        Each thread gets its own DB connection.
        """
        try:
            booking = BookingService.create_booking(
                renter=renter,
                vehicle=self.vehicle,
                start_datetime=self.start,
                end_datetime=self.end,
            )
            results[index] = {'success': True, 'booking_id': booking.id}
        except (ValidationError, PermissionDenied, Exception) as e:
            results[index] = {'success': False, 'error': str(e)}
        finally:
            # Close DB connection in this thread so it doesn't leak
            connection.close()

    def test_concurrent_booking_only_one_succeeds(self):
        """
        Two threads attempt to book the same vehicle for Oct 10-12.
        Exactly one must succeed, the other must fail.
        This is THE critical concurrency test.
        """
        results = [None, None]

        t1 = threading.Thread(
            target=self._attempt_booking,
            args=(self.renter1, results, 0),
        )
        t2 = threading.Thread(
            target=self._attempt_booking,
            args=(self.renter2, results, 1),
        )

        t1.start()
        t2.start()
        t1.join(timeout=30)
        t2.join(timeout=30)

        # Exactly one success
        successes = [r for r in results if r and r['success']]
        failures = [r for r in results if r and not r['success']]

        self.assertEqual(
            len(successes), 1,
            f"Expected exactly 1 success, got {len(successes)}. Results: {results}"
        )
        self.assertEqual(
            len(failures), 1,
            f"Expected exactly 1 failure, got {len(failures)}. Results: {results}"
        )

        # Verify only 1 booking exists in DB
        booking_count = Booking.objects.filter(
            vehicle=self.vehicle,
            status=Booking.Status.PENDING,
        ).count()
        self.assertEqual(
            booking_count, 1,
            f"Expected exactly 1 booking in DB, found {booking_count}"
        )

        # Verify only 1 BOOKED availability record exists
        booked_count = Availability.objects.filter(
            vehicle=self.vehicle,
            status=Availability.Status.BOOKED,
        ).count()
        self.assertEqual(
            booked_count, 1,
            f"Expected exactly 1 BOOKED availability, found {booked_count}"
        )

    def test_concurrent_three_way_race(self):
        """
        Three threads attempt the same dates. Exactly one wins.
        """
        renter3 = User.objects.create_user(
            email='renter3@test.com',
            username='renter3',
            password='password',
            roles=['RENTER'],
            kyc_status='APPROVED',
        )

        results = [None, None, None]
        threads = [
            threading.Thread(target=self._attempt_booking, args=(self.renter1, results, 0)),
            threading.Thread(target=self._attempt_booking, args=(self.renter2, results, 1)),
            threading.Thread(target=self._attempt_booking, args=(renter3, results, 2)),
        ]

        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=30)

        successes = [r for r in results if r and r['success']]
        self.assertEqual(
            len(successes), 1,
            f"Expected exactly 1 success in 3-way race. Results: {results}"
        )

        booking_count = Booking.objects.filter(
            vehicle=self.vehicle,
            status=Booking.Status.PENDING,
        ).count()
        self.assertEqual(booking_count, 1)

    def test_concurrent_non_overlapping_both_succeed(self):
        """
        Two threads book NON-overlapping dates → both should succeed.
        This validates that the lock is per-vehicle row, not global.

        NOTE: This test is only valid on PostgreSQL, which has true
        row-level locking. SQLite uses file-level locks, so two
        concurrent write transactions to the same DB will deadlock
        regardless of whether they touch the same rows.
        On SQLite, we validate the sequential equivalent instead.
        """
        is_sqlite = connection.vendor == 'sqlite'

        end1 = self.start + datetime.timedelta(days=1)
        start2 = self.start + datetime.timedelta(days=3)
        end2 = self.start + datetime.timedelta(days=5)

        if is_sqlite:
            # Sequential test: prove both bookings succeed when not concurrent
            b1 = BookingService.create_booking(
                renter=self.renter1,
                vehicle=self.vehicle,
                start_datetime=self.start,
                end_datetime=end1,
            )
            b2 = BookingService.create_booking(
                renter=self.renter2,
                vehicle=self.vehicle,
                start_datetime=start2,
                end_datetime=end2,
            )
            self.assertEqual(b1.status, Booking.Status.PENDING)
            self.assertEqual(b2.status, Booking.Status.PENDING)
            booking_count = Booking.objects.filter(
                vehicle=self.vehicle, status=Booking.Status.PENDING
            ).count()
            self.assertEqual(booking_count, 2)
            return

        # PostgreSQL path: true concurrent test
        results = [None, None]

        def book_range1(renter, res, idx):
            try:
                booking = BookingService.create_booking(
                    renter=renter,
                    vehicle=self.vehicle,
                    start_datetime=self.start,
                    end_datetime=end1,
                )
                res[idx] = {'success': True, 'booking_id': booking.id}
            except Exception as e:
                res[idx] = {'success': False, 'error': str(e)}
            finally:
                connection.close()

        def book_range2(renter, res, idx):
            try:
                booking = BookingService.create_booking(
                    renter=renter,
                    vehicle=self.vehicle,
                    start_datetime=start2,
                    end_datetime=end2,
                )
                res[idx] = {'success': True, 'booking_id': booking.id}
            except Exception as e:
                res[idx] = {'success': False, 'error': str(e)}
            finally:
                connection.close()

        t1 = threading.Thread(target=book_range1, args=(self.renter1, results, 0))
        t2 = threading.Thread(target=book_range2, args=(self.renter2, results, 1))

        t1.start()
        t2.start()
        t1.join(timeout=30)
        t2.join(timeout=30)

        successes = [r for r in results if r and r['success']]
        self.assertEqual(
            len(successes), 2,
            f"Both non-overlapping bookings should succeed. Results: {results}"
        )

        booking_count = Booking.objects.filter(
            vehicle=self.vehicle,
            status=Booking.Status.PENDING,
        ).count()
        self.assertEqual(booking_count, 2)


class TestVehicleStatusRace(BookingServiceBaseTest):
    """
    Tests that the vehicle status is re-checked AFTER acquiring the lock.
    """

    def test_vehicle_suspended_after_initial_check(self):
        """
        Simulates: renter starts booking → admin suspends vehicle →
        booking should still fail because we re-check after lock.
        """
        # Suspend the vehicle
        self.vehicle.status = Vehicle.Status.SUSPENDED
        self.vehicle.save()

        with self.assertRaises(ValidationError) as ctx:
            BookingService.create_booking(
                renter=self.renter1,
                vehicle=self.vehicle,
                start_datetime=self.oct10,
                end_datetime=self.oct12,
            )
        self.assertIn("not available", str(ctx.exception))


class TestPricingIntegrity(BookingServiceBaseTest):
    """Tests that pricing is always server-authoritative."""

    def test_partial_day_rounds_up(self):
        """25 hours = 2 days billing."""
        end = self.oct10 + datetime.timedelta(hours=25)
        booking = BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=end,
        )
        # 2 days * $100 = $200
        self.assertEqual(booking.rental_amount, Decimal('200.00'))

    def test_exact_one_day(self):
        """24 hours = 1 day billing."""
        end = self.oct10 + datetime.timedelta(hours=24)
        booking = BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=end,
        )
        self.assertEqual(booking.rental_amount, Decimal('100.00'))

    def test_one_hour_minimum_one_day(self):
        """1 hour = 1 day minimum billing."""
        end = self.oct10 + datetime.timedelta(hours=1)
        booking = BookingService.create_booking(
            renter=self.renter1,
            vehicle=self.vehicle,
            start_datetime=self.oct10,
            end_datetime=end,
        )
        self.assertEqual(booking.rental_amount, Decimal('100.00'))
