"""
vehicles/services.py

All database WRITE operations and business logic for vehicles.
Views must call these functions — never mutate Vehicle directly in views.
"""
from decimal import Decimal
from django.core.exceptions import ValidationError, PermissionDenied
from django.db import transaction

from .models import Vehicle, VehicleDocument


# ── Constants ──────────────────────────────────────────────────

REQUIRED_DOCUMENT_TYPES = {
    VehicleDocument.DocumentType.REGISTRATION,
    VehicleDocument.DocumentType.INSURANCE,
}


# ── Create ─────────────────────────────────────────────────────

def create_vehicle(
    *,
    owner,
    make: str,
    model: str,
    year: int,
    vehicle_type: str,
    registration_number: str,
    fuel_type: str,
    transmission: str,
    seats: int,
    description: str = '',
    location: str,
    price_per_day: Decimal,
    security_deposit: Decimal = Decimal('0'),
) -> Vehicle:
    """
    Creates a new vehicle in DRAFT status.
    Business rules:
    - Owner must have the OWNER role.
    - Year must be 2000 or newer.
    - Registration number uniqueness is enforced at DB level.
    """
    if 'OWNER' not in getattr(owner, 'roles', []):
        raise PermissionDenied("User does not have the OWNER role.")

    if year < 2000:
        raise ValidationError("Vehicle must be year 2000 or newer.")

    vehicle = Vehicle(
        owner=owner,
        make=make,
        model=model,
        year=year,
        vehicle_type=vehicle_type,
        registration_number=registration_number,
        fuel_type=fuel_type,
        transmission=transmission,
        seats=seats,
        description=description,
        location=location,
        price_per_day=price_per_day,
        security_deposit=security_deposit,
        status=Vehicle.Status.DRAFT,
    )
    vehicle.full_clean()
    vehicle.save()
    return vehicle


# ── Update ─────────────────────────────────────────────────────

def update_vehicle(*, vehicle: Vehicle, data: dict) -> Vehicle:
    """
    Partial update of a vehicle.
    Only DRAFT or REJECTED vehicles can be edited.
    Approved vehicles must be returned to DRAFT first.
    """
    if vehicle.status not in (Vehicle.Status.DRAFT, Vehicle.Status.REJECTED):
        raise ValidationError(
            "Only vehicles in DRAFT or REJECTED status can be edited. "
            "Please unpublish the vehicle first."
        )

    allowed_fields = {
        'make', 'model', 'year', 'vehicle_type', 'registration_number',
        'fuel_type', 'transmission', 'seats', 'description', 'location',
        'price_per_day', 'security_deposit',
    }

    updated_fields = []
    for field, value in data.items():
        if field in allowed_fields:
            setattr(vehicle, field, value)
            updated_fields.append(field)

    if updated_fields:
        vehicle.full_clean()
        vehicle.save(update_fields=updated_fields + ['updated_at'])

    return vehicle


# ── Delete ─────────────────────────────────────────────────────

def delete_vehicle(*, vehicle: Vehicle) -> None:
    """
    Soft business rule: only DRAFT vehicles can be fully deleted.
    Non-draft vehicles should be SUSPENDED instead.
    """
    if vehicle.status == Vehicle.Status.DRAFT:
        vehicle.delete()
    else:
        raise ValidationError(
            "Only DRAFT vehicles can be deleted. "
            "Active listings should be suspended instead."
        )


# ── Status Transitions ────────────────────────────────────────

@transaction.atomic
def submit_for_verification(*, vehicle: Vehicle) -> Vehicle:
    """
    Transitions a DRAFT vehicle to PENDING_VERIFICATION.
    Validates that all required documents are present.
    """
    if vehicle.status != Vehicle.Status.DRAFT:
        raise ValidationError("Only DRAFT vehicles can be submitted for verification.")

    # Check required documents
    existing_doc_types = set(
        vehicle.documents.values_list('document_type', flat=True)
    )
    missing = REQUIRED_DOCUMENT_TYPES - existing_doc_types
    if missing:
        labels = [VehicleDocument.DocumentType(t).label for t in missing]
        raise ValidationError(
            f"Missing required documents: {', '.join(labels)}. "
            "Please upload all required documents before submitting."
        )

    # Check owner KYC
    if getattr(vehicle.owner, 'kyc_status', None) != 'APPROVED':
        raise ValidationError(
            "Your identity verification (KYC) must be approved before "
            "you can submit a vehicle for verification."
        )

    vehicle.status = Vehicle.Status.PENDING_VERIFICATION
    vehicle.save(update_fields=['status', 'updated_at'])
    return vehicle


def approve_vehicle(*, vehicle: Vehicle) -> Vehicle:
    """Admin action: approves a pending vehicle."""
    if vehicle.status != Vehicle.Status.PENDING_VERIFICATION:
        raise ValidationError("Only PENDING vehicles can be approved.")
    vehicle.status = Vehicle.Status.APPROVED
    vehicle.save(update_fields=['status', 'updated_at'])
    return vehicle


def reject_vehicle(*, vehicle: Vehicle) -> Vehicle:
    """Admin action: rejects a pending vehicle."""
    if vehicle.status != Vehicle.Status.PENDING_VERIFICATION:
        raise ValidationError("Only PENDING vehicles can be rejected.")
    vehicle.status = Vehicle.Status.REJECTED
    vehicle.save(update_fields=['status', 'updated_at'])
    return vehicle


def suspend_vehicle(*, vehicle: Vehicle) -> Vehicle:
    """Admin action or owner action: suspends an approved vehicle."""
    if vehicle.status != Vehicle.Status.APPROVED:
        raise ValidationError("Only APPROVED vehicles can be suspended.")
    vehicle.status = Vehicle.Status.SUSPENDED
    vehicle.save(update_fields=['status', 'updated_at'])
    return vehicle


def unpublish_vehicle(*, vehicle: Vehicle) -> Vehicle:
    """Returns an approved/suspended vehicle back to DRAFT for editing."""
    if vehicle.status not in (Vehicle.Status.APPROVED, Vehicle.Status.SUSPENDED):
        raise ValidationError("Only APPROVED or SUSPENDED vehicles can be unpublished.")
    vehicle.status = Vehicle.Status.DRAFT
    vehicle.save(update_fields=['status', 'updated_at'])
    return vehicle
