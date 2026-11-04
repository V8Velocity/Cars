"""
vehicles/availability_service.py

All availability logic for vehicles.
This module is the authoritative gate for booking overlap detection.

CONCURRENCY MODEL
─────────────────
The `is_available_locked()` method uses `select_for_update()` on the
Availability rows that overlap the requested range. This acquires
row-level exclusive locks in the database, meaning a second concurrent
transaction that attempts to check the same vehicle+date range will
BLOCK at the SELECT until the first transaction commits or rolls back.

Combined with `transaction.atomic()` in BookingService, this creates
a serializable critical section:

    T1: BEGIN → SELECT ... FOR UPDATE → (no rows) → INSERT → COMMIT
    T2: BEGIN → SELECT ... FOR UPDATE → **BLOCKS** → (sees T1's INSERT) → REJECT

This eliminates the TOCTOU (time-of-check-time-of-use) race condition
where two transactions both read "available" before either writes.
"""
import datetime
from typing import List, Tuple
from django.db.models import Q
from django.utils import timezone
from .models import Vehicle, Availability


class AvailabilityService:

    # ── Read-only check (NO lock, suitable for browsing/search) ────

    @staticmethod
    def is_available(
        vehicle: Vehicle,
        start_datetime: datetime.datetime,
        end_datetime: datetime.datetime
    ) -> bool:
        """
        NON-LOCKING availability check.
        Use this for display purposes (search results, calendar UI).
        Do NOT use this inside a booking creation path — use is_available_locked() instead.
        """
        if start_datetime >= end_datetime:
            raise ValueError("end_datetime must be after start_datetime")

        return not Availability.objects.filter(
            vehicle=vehicle,
            status__in=[Availability.Status.BLOCKED, Availability.Status.BOOKED],
            start_datetime__lt=end_datetime,
            end_datetime__gt=start_datetime,
        ).exists()

    # ── Locking check (FOR UPDATE, used inside booking transactions) ──

    @staticmethod
    def is_available_locked(
        vehicle: Vehicle,
        start_datetime: datetime.datetime,
        end_datetime: datetime.datetime,
    ) -> bool:
        """
        LOCKING availability check.
        Must be called inside a transaction.atomic() block.

        Acquires row-level exclusive locks on all Availability rows
        that overlap the requested range for this vehicle.
        A concurrent transaction attempting the same check will BLOCK
        until this transaction commits or rolls back.

        Additionally locks any overlapping Booking rows (PENDING/CONFIRMED/ACTIVE)
        to catch races even before Availability rows are written.
        """
        if start_datetime >= end_datetime:
            raise ValueError("end_datetime must be after start_datetime")

        # 1. Lock all overlapping availability rows
        overlapping = list(
            Availability.objects.select_for_update().filter(
                vehicle=vehicle,
                status__in=[Availability.Status.BLOCKED, Availability.Status.BOOKED],
                start_datetime__lt=end_datetime,
                end_datetime__gt=start_datetime,
            )
        )

        if overlapping:
            return False

        # 2. Also lock overlapping bookings directly as a second fence
        #    This catches the window between Booking INSERT and Availability INSERT
        from bookings.models import Booking
        overlapping_bookings = list(
            Booking.objects.select_for_update().filter(
                vehicle=vehicle,
                status__in=[
                    Booking.Status.PENDING,
                    Booking.Status.CONFIRMED,
                    Booking.Status.ACTIVE,
                ],
                start_datetime__lt=end_datetime,
                end_datetime__gt=start_datetime,
            )
        )

        return len(overlapping_bookings) == 0

    # ── Available ranges (read-only) ──────────────────────────────

    @staticmethod
    def get_available_ranges(
        vehicle: Vehicle,
        start_bound: datetime.datetime,
        end_bound: datetime.datetime,
    ) -> List[Tuple[datetime.datetime, datetime.datetime]]:
        """
        Returns a list of available datetime tuples (start, end) within the given bounds.
        """
        if start_bound >= end_bound:
            return []

        unavailabilities = (
            Availability.objects.filter(
                vehicle=vehicle,
                status__in=[Availability.Status.BLOCKED, Availability.Status.BOOKED],
                start_datetime__lt=end_bound,
                end_datetime__gt=start_bound,
            )
            .order_by('start_datetime')
        )

        available_ranges = []
        current_start = start_bound

        for unavail in unavailabilities:
            unavail_start = max(start_bound, unavail.start_datetime)
            unavail_end = min(end_bound, unavail.end_datetime)

            if current_start < unavail_start:
                available_ranges.append((current_start, unavail_start))

            current_start = max(current_start, unavail_end)

        if current_start < end_bound:
            available_ranges.append((current_start, end_bound))

        return available_ranges

    # ── Block / Book dates ────────────────────────────────────────

    @staticmethod
    def block_dates(
        vehicle: Vehicle,
        start_datetime: datetime.datetime,
        end_datetime: datetime.datetime,
        reason: str = '',
        status: str = Availability.Status.BLOCKED,
        skip_availability_check: bool = False,
    ) -> Availability:
        """
        Creates an availability block. Used by:
        - Owners blocking their calendar (BLOCKED)
        - BookingService creating a reservation (BOOKED)

        When called from BookingService.create_booking(), pass
        skip_availability_check=True because the caller has already
        acquired locks via is_available_locked().
        """
        if start_datetime >= end_datetime:
            raise ValueError("end_datetime must be after start_datetime")

        # If blocking as owner, protect existing bookings
        if status == Availability.Status.BLOCKED:
            booking_overlap = Availability.objects.filter(
                vehicle=vehicle,
                status=Availability.Status.BOOKED,
                start_datetime__lt=end_datetime,
                end_datetime__gt=start_datetime,
            ).exists()
            if booking_overlap:
                raise ValueError(
                    "Cannot block dates that overlap with a confirmed booking."
                )

        # If booking via direct call (not from BookingService),
        # ensure no overlap with existing BLOCKED or BOOKED rows.
        if status == Availability.Status.BOOKED and not skip_availability_check:
            if not AvailabilityService.is_available(vehicle, start_datetime, end_datetime):
                raise ValueError("Dates are already blocked or booked.")

        return Availability.objects.create(
            vehicle=vehicle,
            start_datetime=start_datetime,
            end_datetime=end_datetime,
            status=status,
            reason=reason,
        )

    # ── Release dates ─────────────────────────────────────────────

    @staticmethod
    def release_dates(
        vehicle: Vehicle,
        start_datetime: datetime.datetime,
        end_datetime: datetime.datetime,
    ):
        """
        Removes any BLOCKED statuses that fall exactly or partially in this range.
        If a block overlaps partially, it splits or truncates the block.
        Only affects BLOCKED status, not BOOKED.
        """
        if start_datetime >= end_datetime:
            return

        blocks = Availability.objects.filter(
            vehicle=vehicle,
            status=Availability.Status.BLOCKED,
            start_datetime__lt=end_datetime,
            end_datetime__gt=start_datetime,
        )

        for block in blocks:
            # 1. Block is completely contained inside the release range
            if block.start_datetime >= start_datetime and block.end_datetime <= end_datetime:
                block.delete()
            # 2. Block encapsulates the release range → split into two
            elif block.start_datetime < start_datetime and block.end_datetime > end_datetime:
                Availability.objects.create(
                    vehicle=vehicle,
                    start_datetime=end_datetime,
                    end_datetime=block.end_datetime,
                    status=Availability.Status.BLOCKED,
                    reason=block.reason,
                )
                block.end_datetime = start_datetime
                block.save()
            # 3. Block overlaps on the left → truncate
            elif block.start_datetime < start_datetime and block.end_datetime <= end_datetime:
                block.end_datetime = start_datetime
                block.save()
            # 4. Block overlaps on the right → truncate
            elif block.start_datetime >= start_datetime and block.end_datetime > end_datetime:
                block.start_datetime = end_datetime
                block.save()
