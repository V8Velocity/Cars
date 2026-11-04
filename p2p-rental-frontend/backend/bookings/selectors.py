from django.db.models import QuerySet
from .models import Booking

def get_user_bookings(user) -> QuerySet[Booking]:
    """
    Returns all bookings where the user is either the renter or the vehicle owner.
    """
    return Booking.objects.filter(
        renter=user
    ) | Booking.objects.filter(
        vehicle__owner=user
    ).select_related('vehicle', 'vehicle__owner', 'renter').order_by('-created_at').distinct()

def get_booking_detail(*, booking_id: int, user) -> Booking:
    """
    Returns a booking if the user is authorized to see it (renter or owner).
    """
    return Booking.objects.select_related('vehicle', 'vehicle__owner', 'renter').get(
        id=booking_id
    )
