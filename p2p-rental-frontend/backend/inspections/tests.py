"""
inspections/tests.py

Tests for the Inspection workflow:
- Authorization
- Handover inspection → ACTIVE transition
- Return inspection → COMPLETED transition
- Duplicate prevention
- Damage handling
- Odometer/fuel difference computation
- Late return detection
"""
import datetime
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError, PermissionDenied

from vehicles.models import Vehicle
from bookings.models import Booking
from inspections.models import Inspection
from inspections.services import InspectionService

User = get_user_model()


class InspectionTestBase(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email='owner@test.com', username='owner',
            password='password', roles=['OWNER'], kyc_status='APPROVED',
        )
        self.renter = User.objects.create_user(
            email='renter@test.com', username='renter',
            password='password', roles=['RENTER'], kyc_status='APPROVED',
        )
        self.stranger = User.objects.create_user(
            email='stranger@test.com', username='stranger',
            password='password', roles=['RENTER'], kyc_status='APPROVED',
        )
        self.admin_user = User.objects.create_user(
            email='admin@test.com', username='admin_user',
            password='password', roles=['ADMIN'], kyc_status='APPROVED',
        )
        self.vehicle = Vehicle.objects.create(
            owner=self.owner, make='Tesla', model='Model 3',
            year=2025, vehicle_type='Sedan',
            registration_number='INSP-001',
            fuel_type='Electric', transmission='Automatic',
            seats=5, location='San Francisco',
            price_per_day=Decimal('100.00'),
            security_deposit=Decimal('500.00'),
            status=Vehicle.Status.APPROVED,
        )
        start = timezone.now() + datetime.timedelta(days=1)
        self.booking = Booking.objects.create(
            vehicle=self.vehicle, renter=self.renter,
            start_datetime=start,
            end_datetime=start + datetime.timedelta(days=3),
            status=Booking.Status.CONFIRMED,
            rental_amount=Decimal('300.00'),
            platform_fee=Decimal('30.00'),
            tax=Decimal('16.50'),
            security_deposit=Decimal('500.00'),
            total_amount=Decimal('846.50'),
        )


class TestHandoverInspection(InspectionTestBase):

    def test_handover_creates_inspection_and_activates_booking(self):
        """Handover inspection transitions booking from CONFIRMED → ACTIVE."""
        inspection = InspectionService.create_handover_inspection(
            booking=self.booking, user=self.renter,
            odometer=15000, fuel_level=80,
        )
        self.assertEqual(inspection.inspection_type, Inspection.Type.HANDOVER)
        self.assertEqual(inspection.odometer, 15000)
        self.assertEqual(inspection.fuel_level, 80)

        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.ACTIVE)

    def test_handover_requires_confirmed_status(self):
        """Cannot create handover for non-CONFIRMED booking."""
        self.booking.status = Booking.Status.PENDING
        self.booking.save()

        with self.assertRaises(ValidationError) as ctx:
            InspectionService.create_handover_inspection(
                booking=self.booking, user=self.renter,
                odometer=15000, fuel_level=80,
            )
        self.assertIn('CONFIRMED', str(ctx.exception))

    def test_handover_prevents_duplicate(self):
        """Cannot create two handover inspections for the same booking.
        After the first handover, booking transitions to ACTIVE, so the
        status guard rejects the second attempt before the duplicate check."""
        InspectionService.create_handover_inspection(
            booking=self.booking, user=self.renter,
            odometer=15000, fuel_level=80,
        )
        self.booking.refresh_from_db()
        with self.assertRaises(ValidationError) as ctx:
            InspectionService.create_handover_inspection(
                booking=self.booking, user=self.renter,
                odometer=15000, fuel_level=80,
            )
        # Rejected because booking is now ACTIVE, not CONFIRMED
        self.assertIn('CONFIRMED', str(ctx.exception))

    def test_handover_with_damage(self):
        """Handover with damage requires damage_notes."""
        inspection = InspectionService.create_handover_inspection(
            booking=self.booking, user=self.renter,
            odometer=15000, fuel_level=80,
            has_damage=True, damage_notes='Scratch on left door',
        )
        self.assertTrue(inspection.has_damage)
        self.assertEqual(inspection.damage_notes, 'Scratch on left door')

    def test_damage_without_notes_fails(self):
        """Cannot flag damage without providing notes."""
        with self.assertRaises(ValidationError) as ctx:
            InspectionService.create_handover_inspection(
                booking=self.booking, user=self.renter,
                odometer=15000, fuel_level=80,
                has_damage=True, damage_notes='',
            )
        self.assertIn('Damage notes', str(ctx.exception))

    def test_invalid_fuel_level_rejected(self):
        """Fuel level must be 0-100."""
        with self.assertRaises(ValidationError):
            InspectionService.create_handover_inspection(
                booking=self.booking, user=self.renter,
                odometer=15000, fuel_level=150,
            )


class TestReturnInspection(InspectionTestBase):

    def _do_handover(self):
        """Helper to create a handover and get booking to ACTIVE."""
        return InspectionService.create_handover_inspection(
            booking=self.booking, user=self.renter,
            odometer=15000, fuel_level=80,
        )

    def test_return_creates_inspection_and_completes_booking(self):
        """Return inspection transitions booking from ACTIVE → COMPLETED."""
        self._do_handover()
        self.booking.refresh_from_db()

        inspection = InspectionService.create_return_inspection(
            booking=self.booking, user=self.renter,
            odometer=15450, fuel_level=60,
        )
        self.assertEqual(inspection.inspection_type, Inspection.Type.RETURN)
        self.assertEqual(inspection.odometer, 15450)

        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.COMPLETED)

    def test_return_requires_active_status(self):
        """Cannot create return for non-ACTIVE booking."""
        with self.assertRaises(ValidationError) as ctx:
            InspectionService.create_return_inspection(
                booking=self.booking, user=self.renter,
                odometer=15450, fuel_level=60,
            )
        self.assertIn('ACTIVE', str(ctx.exception))

    def test_return_prevents_duplicate(self):
        """Cannot create two return inspections.
        After the first return, booking transitions to COMPLETED, so the
        status guard rejects the second attempt."""
        self._do_handover()
        self.booking.refresh_from_db()

        InspectionService.create_return_inspection(
            booking=self.booking, user=self.renter,
            odometer=15450, fuel_level=60,
        )
        self.booking.refresh_from_db()
        with self.assertRaises(ValidationError) as ctx:
            InspectionService.create_return_inspection(
                booking=self.booking, user=self.renter,
                odometer=15450, fuel_level=60,
            )
        # Rejected because booking is now COMPLETED, not ACTIVE
        self.assertIn('ACTIVE', str(ctx.exception))

    def test_return_computes_odometer_difference(self):
        """Return inspection calculates distance driven."""
        self._do_handover()
        self.booking.refresh_from_db()

        inspection = InspectionService.create_return_inspection(
            booking=self.booking, user=self.renter,
            odometer=15450, fuel_level=60,
        )
        self.assertEqual(inspection.odometer_difference, 450)

    def test_return_computes_fuel_difference(self):
        """Return inspection calculates fuel change (negative = less fuel)."""
        self._do_handover()
        self.booking.refresh_from_db()

        inspection = InspectionService.create_return_inspection(
            booking=self.booking, user=self.renter,
            odometer=15450, fuel_level=60,
        )
        # Started at 80%, returned at 60% → difference = -20
        self.assertEqual(inspection.fuel_difference, -20)

    def test_return_odometer_backwards_rejected(self):
        """Odometer cannot go backwards."""
        self._do_handover()
        self.booking.refresh_from_db()

        with self.assertRaises(ValidationError) as ctx:
            InspectionService.create_return_inspection(
                booking=self.booking, user=self.renter,
                odometer=14000, fuel_level=60,
            )
        self.assertIn('less than', str(ctx.exception))

    def test_late_return_detected(self):
        """Late return is flagged when return happens after booking end."""
        self._do_handover()
        # Set booking end to the past
        self.booking.end_datetime = timezone.now() - datetime.timedelta(hours=1)
        self.booking.save()

        inspection = InspectionService.create_return_inspection(
            booking=self.booking, user=self.renter,
            odometer=15450, fuel_level=60,
        )
        self.assertTrue(inspection.is_late_return)

    def test_on_time_return(self):
        """On-time return is not flagged."""
        self._do_handover()
        self.booking.refresh_from_db()

        inspection = InspectionService.create_return_inspection(
            booking=self.booking, user=self.renter,
            odometer=15450, fuel_level=60,
        )
        self.assertFalse(inspection.is_late_return)

    def test_return_with_new_damage(self):
        """Damage detected at return."""
        self._do_handover()
        self.booking.refresh_from_db()

        inspection = InspectionService.create_return_inspection(
            booking=self.booking, user=self.renter,
            odometer=15450, fuel_level=60,
            has_damage=True, damage_notes='Cracked taillight',
        )
        self.assertTrue(inspection.has_damage)
        self.assertEqual(inspection.damage_notes, 'Cracked taillight')


class TestAuthorization(InspectionTestBase):

    def test_renter_can_create_inspection(self):
        """Renter is authorized."""
        inspection = InspectionService.create_handover_inspection(
            booking=self.booking, user=self.renter,
            odometer=15000, fuel_level=80,
        )
        self.assertIsNotNone(inspection.id)

    def test_owner_can_create_inspection(self):
        """Vehicle owner is authorized."""
        inspection = InspectionService.create_handover_inspection(
            booking=self.booking, user=self.owner,
            odometer=15000, fuel_level=80,
        )
        self.assertIsNotNone(inspection.id)

    def test_admin_can_create_inspection(self):
        """Admin is authorized."""
        inspection = InspectionService.create_handover_inspection(
            booking=self.booking, user=self.admin_user,
            odometer=15000, fuel_level=80,
        )
        self.assertIsNotNone(inspection.id)

    def test_stranger_cannot_create_inspection(self):
        """Unauthorized user is rejected."""
        with self.assertRaises(PermissionDenied):
            InspectionService.create_handover_inspection(
                booking=self.booking, user=self.stranger,
                odometer=15000, fuel_level=80,
            )


class TestInspectionSummary(InspectionTestBase):

    def test_summary_with_both_inspections(self):
        """Summary returns both handover and return data with diffs."""
        InspectionService.create_handover_inspection(
            booking=self.booking, user=self.renter,
            odometer=15000, fuel_level=80,
        )
        self.booking.refresh_from_db()

        InspectionService.create_return_inspection(
            booking=self.booking, user=self.renter,
            odometer=15450, fuel_level=60,
        )
        self.booking.refresh_from_db()

        summary = InspectionService.get_inspection_summary(self.booking)
        self.assertIsNotNone(summary['handover'])
        self.assertIsNotNone(summary['return'])
        self.assertEqual(summary['odometer_difference'], 450)
        self.assertEqual(summary['fuel_difference'], -20)

    def test_summary_handover_only(self):
        """Summary works with only handover completed."""
        InspectionService.create_handover_inspection(
            booking=self.booking, user=self.renter,
            odometer=15000, fuel_level=80,
        )
        summary = InspectionService.get_inspection_summary(self.booking)
        self.assertIsNotNone(summary['handover'])
        self.assertIsNone(summary['return'])
        self.assertIsNone(summary['odometer_difference'])


class TestFullWorkflow(InspectionTestBase):

    def test_complete_booking_lifecycle(self):
        """
        Full workflow:
        CONFIRMED → handover → ACTIVE → return → COMPLETED
        """
        # Step 1: Booking starts as CONFIRMED
        self.assertEqual(self.booking.status, Booking.Status.CONFIRMED)

        # Step 2: Handover inspection → ACTIVE
        handover = InspectionService.create_handover_inspection(
            booking=self.booking, user=self.owner,
            odometer=15000, fuel_level=90,
            exterior_condition='EXCELLENT',
            interior_condition='GOOD',
            notes='Vehicle in great condition at handover.',
        )
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.ACTIVE)
        self.assertEqual(handover.created_by, self.owner)

        # Step 3: Return inspection → COMPLETED
        return_insp = InspectionService.create_return_inspection(
            booking=self.booking, user=self.renter,
            odometer=15320, fuel_level=45,
            exterior_condition='GOOD',
            interior_condition='FAIR',
            notes='Minor wear from trip.',
        )
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.COMPLETED)

        # Step 4: Verify computed differences
        self.assertEqual(return_insp.odometer_difference, 320)
        self.assertEqual(return_insp.fuel_difference, -45)  # 45 - 90 = -45
        self.assertFalse(return_insp.is_late_return)

        # Step 5: Summary reflects everything
        summary = InspectionService.get_inspection_summary(self.booking)
        self.assertEqual(summary['odometer_difference'], 320)
        self.assertEqual(summary['fuel_difference'], -45)
