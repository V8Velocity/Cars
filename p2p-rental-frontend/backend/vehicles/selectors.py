"""
vehicles/selectors.py

All database READ operations for the vehicles app.
Views must use these functions — never query Vehicle.objects directly.
"""
from datetime import date
from decimal import Decimal

from django.db.models import QuerySet, Q, Prefetch
from .models import Vehicle, VehicleImage, Availability


def get_public_vehicles(
    *,
    location: str | None = None,
    vehicle_type: str | None = None,
    fuel_type: str | None = None,
    transmission: str | None = None,
    min_seats: int | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    available_from: date | None = None,
    available_to: date | None = None,
    ordering: str = '-created_at',
) -> QuerySet[Vehicle]:
    """
    Public vehicle search — only returns APPROVED vehicles.
    Applies optional filters. Prefetches images to avoid N+1.
    """
    qs = (
        Vehicle.objects
        .filter(status=Vehicle.Status.APPROVED)
        .select_related('owner')
        .prefetch_related(
            Prefetch('images', queryset=VehicleImage.objects.order_by('order'))
        )
    )

    if location:
        qs = qs.filter(location__icontains=location)
    if vehicle_type:
        qs = qs.filter(vehicle_type=vehicle_type)
    if fuel_type:
        qs = qs.filter(fuel_type=fuel_type)
    if transmission:
        qs = qs.filter(transmission=transmission)
    if min_seats is not None:
        qs = qs.filter(seats__gte=min_seats)
    if min_price is not None:
        qs = qs.filter(price_per_day__gte=min_price)
    if max_price is not None:
        qs = qs.filter(price_per_day__lte=max_price)

    # Availability filter: exclude vehicles that have ANY blocked/booked date within the range
    if available_from and available_to:
        blocked_vehicle_ids = (
            Availability.objects
            .filter(
                status__in=[Availability.Status.BLOCKED, Availability.Status.BOOKED],
                start_datetime__lt=available_to,
                end_datetime__gt=available_from
            )
            .values_list('vehicle_id', flat=True)
            .distinct()
        )
        qs = qs.exclude(id__in=blocked_vehicle_ids)

    # Validate ordering against allowed fields
    allowed_orderings = {
        'price_asc': 'price_per_day',
        'price_desc': '-price_per_day',
        'newest': '-created_at',
        'oldest': 'created_at',
        'year_desc': '-year',
    }
    order_field = allowed_orderings.get(ordering, '-created_at')
    qs = qs.order_by(order_field)

    return qs


def get_vehicle_detail(*, vehicle_id: int) -> Vehicle:
    """
    Fetches a single vehicle with all related data for the detail page.
    Uses select_related + prefetch_related to minimize queries.
    """
    return (
        Vehicle.objects
        .select_related('owner')
        .prefetch_related(
            Prefetch('images', queryset=VehicleImage.objects.order_by('order')),
            'documents',
            Prefetch('availabilities', queryset=Availability.objects.order_by('start_datetime')),
        )
        .get(id=vehicle_id)
    )


def get_owner_vehicles(*, owner) -> QuerySet[Vehicle]:
    """
    All vehicles belonging to a specific owner, regardless of status.
    """
    return (
        Vehicle.objects
        .filter(owner=owner)
        .prefetch_related(
            Prefetch('images', queryset=VehicleImage.objects.order_by('order'))
        )
        .order_by('-created_at')
    )
