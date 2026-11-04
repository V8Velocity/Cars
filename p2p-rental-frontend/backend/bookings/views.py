from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError, PermissionDenied
from django.http import Http404

from vehicles.models import Vehicle
from .serializers import BookingSerializer, BookingCreateSerializer
from .selectors import get_user_bookings, get_booking_detail
from .services import BookingService

class BookingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = get_user_bookings(user=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            vehicle = Vehicle.objects.get(id=serializer.validated_data['vehicle_id'])
            booking = BookingService.create_booking(
                renter=request.user,
                vehicle=vehicle,
                start_datetime=serializer.validated_data['start_datetime'],
                end_datetime=serializer.validated_data['end_datetime']
            )
        except Vehicle.DoesNotExist:
            return Response({'error': True, 'message': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)
        except (ValidationError, PermissionDenied) as e:
            return Response({'error': True, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            booking = get_booking_detail(booking_id=pk, user=request.user)
        except Exception:
            raise Http404("Booking not found.")

        # Ensure authorization
        if booking.renter != request.user and booking.vehicle.owner != request.user and 'ADMIN' not in getattr(request.user, 'roles', []):
            raise Http404("Booking not found.")

        serializer = BookingSerializer(booking)
        return Response(serializer.data)

class BookingCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = get_booking_detail(booking_id=pk, user=request.user)
        except Exception:
            raise Http404("Booking not found.")

        try:
            cancelled_booking = BookingService.cancel_booking(booking=booking, user=request.user)
        except (ValidationError, PermissionDenied) as e:
            return Response({'error': True, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(BookingSerializer(cancelled_booking).data)
