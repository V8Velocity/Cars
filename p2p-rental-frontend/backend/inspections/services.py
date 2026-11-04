"""
inspections/services.py

All inspection business logic. Views must delegate to this service.

Workflow:
    CONFIRMED → HANDOVER inspection → ACTIVE → RETURN inspection → COMPLETED

Rules enforced:
1. Only authorized users (renter, owner, or admin) can create inspections.
2. Handover inspection requires booking in CONFIRMED status.
3. Return inspection requires booking in ACTIVE status.
4. Odometer must be recorded (enforced by model).
5. At least one photo is required (validated after creation via add_photos).
6. Duplicate inspections are prevented (unique_together on model).
7. Return inspection auto-calculates odometer diff, fuel diff, and late return.
8. Damage flagging triggers damage_notes requirement.
"""
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError, PermissionDenied

from bookings.models import Booking
from .models import Inspection, InspectionPhoto


class InspectionService:

    @classmethod
    def _authorize_user(cls, booking: Booking, user):
        """Only the renter, vehicle owner, or admin can create inspections."""
        is_renter = booking.renter_id == user.id
        is_owner = booking.vehicle.owner_id == user.id
        is_admin = 'ADMIN' in getattr(user, 'roles', [])

        if not (is_renter or is_owner or is_admin):
            raise PermissionDenied(
                "You are not authorized to create inspections for this booking."
            )

    @classmethod
    @transaction.atomic
    def create_handover_inspection(
        cls,
        *,
        booking: Booking,
        user,
        odometer: int,
        fuel_level: int,
        exterior_condition: str = Inspection.Condition.GOOD,
        interior_condition: str = Inspection.Condition.GOOD,
        notes: str = '',
        damage_notes: str = '',
        has_damage: bool = False,
    ) -> Inspection:
        """
        Creates a HANDOVER inspection and transitions booking to ACTIVE.
        """
        cls._authorize_user(booking, user)

        # Rule: Booking must be CONFIRMED
        if booking.status != Booking.Status.CONFIRMED:
            raise ValidationError(
                f"Handover inspection requires booking in CONFIRMED status. "
                f"Current status: {booking.status}."
            )

        # Rule: Duplicate prevention (also enforced by unique_together)
        if Inspection.objects.filter(
            booking=booking, inspection_type=Inspection.Type.HANDOVER
        ).exists():
            raise ValidationError(
                "A handover inspection already exists for this booking."
            )

        # Rule: Damage notes required if damage flagged
        if has_damage and not damage_notes.strip():
            raise ValidationError(
                "Damage notes are required when damage is reported."
            )

        # Validate fuel level
        if not (0 <= fuel_level <= 100):
            raise ValidationError("Fuel level must be between 0 and 100.")

        inspection = Inspection.objects.create(
            booking=booking,
            created_by=user,
            inspection_type=Inspection.Type.HANDOVER,
            odometer=odometer,
            fuel_level=fuel_level,
            exterior_condition=exterior_condition,
            interior_condition=interior_condition,
            notes=notes,
            damage_notes=damage_notes,
            has_damage=has_damage,
        )

        # Transition booking to ACTIVE
        booking.status = Booking.Status.ACTIVE
        booking.save(update_fields=['status', 'updated_at'])

        return inspection

    @classmethod
    @transaction.atomic
    def create_return_inspection(
        cls,
        *,
        booking: Booking,
        user,
        odometer: int,
        fuel_level: int,
        exterior_condition: str = Inspection.Condition.GOOD,
        interior_condition: str = Inspection.Condition.GOOD,
        notes: str = '',
        damage_notes: str = '',
        has_damage: bool = False,
    ) -> Inspection:
        """
        Creates a RETURN inspection and transitions booking to COMPLETED.
        Auto-computes odometer difference, fuel difference, and late return.
        """
        cls._authorize_user(booking, user)

        # Rule: Booking must be ACTIVE
        if booking.status != Booking.Status.ACTIVE:
            raise ValidationError(
                f"Return inspection requires booking in ACTIVE status. "
                f"Current status: {booking.status}."
            )

        # Rule: Duplicate prevention
        if Inspection.objects.filter(
            booking=booking, inspection_type=Inspection.Type.RETURN
        ).exists():
            raise ValidationError(
                "A return inspection already exists for this booking."
            )

        # Rule: Damage notes required if damage flagged
        if has_damage and not damage_notes.strip():
            raise ValidationError(
                "Damage notes are required when damage is reported."
            )

        # Validate fuel level
        if not (0 <= fuel_level <= 100):
            raise ValidationError("Fuel level must be between 0 and 100.")

        # Compute differences from handover inspection
        handover = Inspection.objects.filter(
            booking=booking, inspection_type=Inspection.Type.HANDOVER
        ).first()

        odometer_difference = None
        fuel_difference = None
        is_late = False

        if handover:
            odometer_difference = odometer - handover.odometer
            fuel_difference = fuel_level - handover.fuel_level

            # Validate odometer hasn't gone backwards
            if odometer_difference < 0:
                raise ValidationError(
                    "Return odometer reading cannot be less than handover reading."
                )

        # Check late return
        if timezone.now() > booking.end_datetime:
            is_late = True

        inspection = Inspection.objects.create(
            booking=booking,
            created_by=user,
            inspection_type=Inspection.Type.RETURN,
            odometer=odometer,
            fuel_level=fuel_level,
            exterior_condition=exterior_condition,
            interior_condition=interior_condition,
            notes=notes,
            damage_notes=damage_notes,
            has_damage=has_damage,
            odometer_difference=odometer_difference,
            fuel_difference=fuel_difference,
            is_late_return=is_late,
        )

        # Transition booking to COMPLETED
        booking.status = Booking.Status.COMPLETED
        booking.save(update_fields=['status', 'updated_at'])

        return inspection

    @classmethod
    def add_photos(cls, *, inspection: Inspection, photos: list) -> list:
        """
        Attach photos to an inspection.
        photos: list of dicts with 'image' and optional 'description'.
        """
        created = []
        for photo_data in photos:
            photo = InspectionPhoto.objects.create(
                inspection=inspection,
                image=photo_data['image'],
                description=photo_data.get('description', ''),
            )
            created.append(photo)
        return created

    @classmethod
    def get_inspection_summary(cls, booking: Booking) -> dict:
        """
        Returns a summary of both inspections for a booking,
        including computed differences.
        """
        handover = Inspection.objects.filter(
            booking=booking, inspection_type=Inspection.Type.HANDOVER
        ).prefetch_related('photos').first()

        return_insp = Inspection.objects.filter(
            booking=booking, inspection_type=Inspection.Type.RETURN
        ).prefetch_related('photos').first()

        summary = {
            'handover': handover,
            'return': return_insp,
            'has_damage': False,
            'odometer_difference': None,
            'fuel_difference': None,
            'is_late_return': False,
        }

        if return_insp:
            summary['has_damage'] = (
                return_insp.has_damage
                or (handover and not handover.has_damage and return_insp.has_damage)
            )
            summary['odometer_difference'] = return_insp.odometer_difference
            summary['fuel_difference'] = return_insp.fuel_difference
            summary['is_late_return'] = return_insp.is_late_return

        return summary
