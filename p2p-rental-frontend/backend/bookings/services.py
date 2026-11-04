"""
bookings/services.py

All booking mutations and business logic.

CONCURRENCY DESIGN
──────────────────
create_booking() is the critical section for double-booking prevention.

The race condition without locking:

    T1: is_available? → YES           T2: is_available? → YES
    T1: INSERT Booking                 T2: INSERT Booking   ← DOUBLE BOOKING!
    T1: INSERT Availability            T2: INSERT Availability
    T1: COMMIT                         T2: COMMIT

Both transactions see "available" because neither has written yet.

Our solution uses a two-layer lock:

    1. Vehicle row lock (select_for_update on Vehicle)
       - Serializes ALL booking attempts for the same vehicle.
       - Acts as a coarse-grained mutex: T2 blocks at this SELECT
         until T1 commits.

    2. Availability + Booking row locks (is_available_locked)
       - Fine-grained defense: locks the specific overlapping rows.
       - Catches edge cases where a vehicle row lock isn't sufficient
         (e.g., if the vehicle row wasn't touched by a prior BLOCKED insert).

The resulting flow:

    T1: BEGIN
    T1: SELECT vehicle FOR UPDATE        ← acquires exclusive lock
    T1: is_available_locked? → YES       ← locks overlapping rows (none exist)
    T1: INSERT Booking
    T1: INSERT Availability (BOOKED)
    T1: COMMIT                           ← releases all locks

    T2: BEGIN
    T2: SELECT vehicle FOR UPDATE        ← BLOCKS HERE until T1 commits
    T2: is_available_locked? → NO        ← sees T1's Availability row
    T2: raise ValidationError            ← controlled rejection
    T2: ROLLBACK
"""
import datetime
import math
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError, PermissionDenied

from vehicles.models import Vehicle, Availability
from vehicles.availability_service import AvailabilityService
from .models import Booking


class BookingService:
    PLATFORM_FEE_RATE = Decimal('0.10')
    TAX_RATE = Decimal('0.05')

    @classmethod
    def calculate_price(
        cls,
        vehicle: Vehicle,
        start_datetime: datetime.datetime,
        end_datetime: datetime.datetime,
    ):
        """
        Server-authoritative price calculation.
        Frontend calculations are for display only — this is the source of truth.
        Uses ceil for days so partial days bill as full days.
        """
        duration = end_datetime - start_datetime
        days = Decimal(math.ceil(duration.total_seconds() / 86400))
        if days < 1:
            days = Decimal('1')

        rental_amount = vehicle.price_per_day * days
        platform_fee = rental_amount * cls.PLATFORM_FEE_RATE
        tax = (rental_amount + platform_fee) * cls.TAX_RATE
        security_deposit = vehicle.security_deposit
        total_amount = rental_amount + platform_fee + tax + security_deposit

        return {
            'rental_amount': round(rental_amount, 2),
            'platform_fee': round(platform_fee, 2),
            'tax': round(tax, 2),
            'security_deposit': security_deposit,
            'total_amount': round(total_amount, 2),
        }

    @classmethod
    @transaction.atomic
    def create_booking(
        cls,
        *,
        renter,
        vehicle: Vehicle,
        start_datetime: datetime.datetime,
        end_datetime: datetime.datetime,
    ) -> Booking:
        """
        Creates a PENDING booking with full concurrency protection.

        Transaction flow:
        1. Validate business rules (stateless checks, no DB needed).
        2. Acquire exclusive lock on the vehicle row.
        3. Re-check availability under lock (serializable read).
        4. Calculate authoritative price.
        5. Create booking.
        6. Create BOOKED availability block.
        7. Return (transaction commits on exit, releasing all locks).
        """

        # ── Step 1: Stateless business rule validation ─────────
        # These checks don't touch the DB so they're safe outside the lock.

        # Rule 1: Renter must have approved KYC
        if getattr(renter, 'kyc_status', None) != 'APPROVED':
            raise PermissionDenied(
                "You must have an approved KYC status to book a vehicle."
            )

        # Rule 2 & 3: Vehicle must be approved (not suspended/draft/etc.)
        if vehicle.status != Vehicle.Status.APPROVED:
            raise ValidationError("This vehicle is not available for booking.")

        # Rule 4: Owner cannot book own vehicle
        if vehicle.owner_id == renter.id:
            raise ValidationError("You cannot book your own vehicle.")

        # Rule 5: Start must be before end
        if start_datetime >= end_datetime:
            raise ValidationError("Booking start date must be before end date.")

        # Rule 6: Start cannot be in the past
        if start_datetime < timezone.now():
            raise ValidationError("Booking cannot start in the past.")

        # ── Step 2: Acquire exclusive lock on vehicle row ──────
        # This is the coarse-grained mutex. Any concurrent booking
        # attempt for the SAME vehicle will block here until we commit.
        locked_vehicle = Vehicle.objects.select_for_update().get(id=vehicle.id)

        # Re-validate vehicle status after lock (it could have been
        # suspended between our initial check and acquiring the lock)
        if locked_vehicle.status != Vehicle.Status.APPROVED:
            raise ValidationError("This vehicle is no longer available for booking.")

        # ── Step 3: Re-check availability under lock ───────────
        # Uses select_for_update on Availability + Booking rows
        # to provide fine-grained overlap detection.
        if not AvailabilityService.is_available_locked(
            vehicle, start_datetime, end_datetime
        ):
            raise ValidationError(
                "The vehicle is not available for the selected dates. "
                "Another booking may have just been placed."
            )

        # ── Step 4: Calculate authoritative price ──────────────
        pricing = cls.calculate_price(locked_vehicle, start_datetime, end_datetime)

        # ── Step 5: Create booking ─────────────────────────────
        booking = Booking(
            vehicle=locked_vehicle,
            renter=renter,
            start_datetime=start_datetime,
            end_datetime=end_datetime,
            status=Booking.Status.PENDING,
            **pricing,
        )
        booking.full_clean()
        booking.save()

        # ── Step 6: Reserve dates in availability engine ───────
        # This INSERT is protected by the vehicle lock, so no other
        # transaction can create a conflicting BOOKED row.
        AvailabilityService.block_dates(
            vehicle=locked_vehicle,
            start_datetime=start_datetime,
            end_datetime=end_datetime,
            reason=f'Booking {booking.id}',
            status=Availability.Status.BOOKED,
            skip_availability_check=True,
        )

        # ── Step 7: Return (commit on scope exit) ─────────────
        return booking

    @classmethod
    @transaction.atomic
    def cancel_booking(cls, *, booking: Booking, user) -> Booking:
        """
        Cancels a booking and frees the availability slot.
        Uses select_for_update to prevent concurrent cancel + confirm races.
        """
        # Lock the booking row to prevent concurrent modifications
        locked_booking = Booking.objects.select_for_update().get(id=booking.id)

        if (
            locked_booking.renter_id != user.id
            and locked_booking.vehicle.owner_id != user.id
            and 'ADMIN' not in getattr(user, 'roles', [])
        ):
            raise PermissionDenied(
                "You do not have permission to cancel this booking."
            )

        terminal_states = (
            Booking.Status.CANCELLED,
            Booking.Status.REJECTED,
            Booking.Status.COMPLETED,
        )
        if locked_booking.status in terminal_states:
            raise ValidationError(
                f"Booking is already in {locked_booking.status} state."
            )

        if locked_booking.status == Booking.Status.ACTIVE:
            raise ValidationError("Cannot cancel an active booking.")

        locked_booking.status = Booking.Status.CANCELLED
        locked_booking.save(update_fields=['status', 'updated_at'])

        # Free up the dates
        Availability.objects.filter(
            vehicle=locked_booking.vehicle,
            start_datetime=locked_booking.start_datetime,
            end_datetime=locked_booking.end_datetime,
            status=Availability.Status.BOOKED,
            reason=f'Booking {locked_booking.id}',
        ).delete()

        return locked_booking
