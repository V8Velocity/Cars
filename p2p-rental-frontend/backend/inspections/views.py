from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError, PermissionDenied
from django.http import Http404

from bookings.models import Booking
from .models import Inspection
from .serializers import (
    InspectionSerializer,
    CreateInspectionSerializer,
    InspectionSummarySerializer,
)
from .services import InspectionService


class InspectionCreateView(APIView):
    """POST /api/inspections/ — Create a handover or return inspection."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateInspectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            booking = Booking.objects.select_related(
                'vehicle', 'vehicle__owner', 'renter',
            ).get(id=data['booking_id'])
        except Booking.DoesNotExist:
            return Response(
                {'error': True, 'message': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            if data['inspection_type'] == Inspection.Type.HANDOVER:
                inspection = InspectionService.create_handover_inspection(
                    booking=booking,
                    user=request.user,
                    odometer=data['odometer'],
                    fuel_level=data['fuel_level'],
                    exterior_condition=data.get('exterior_condition', 'GOOD'),
                    interior_condition=data.get('interior_condition', 'GOOD'),
                    notes=data.get('notes', ''),
                    damage_notes=data.get('damage_notes', ''),
                    has_damage=data.get('has_damage', False),
                )
            elif data['inspection_type'] == Inspection.Type.RETURN:
                inspection = InspectionService.create_return_inspection(
                    booking=booking,
                    user=request.user,
                    odometer=data['odometer'],
                    fuel_level=data['fuel_level'],
                    exterior_condition=data.get('exterior_condition', 'GOOD'),
                    interior_condition=data.get('interior_condition', 'GOOD'),
                    notes=data.get('notes', ''),
                    damage_notes=data.get('damage_notes', ''),
                    has_damage=data.get('has_damage', False),
                )
            else:
                return Response(
                    {'error': True, 'message': 'Invalid inspection type.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except (ValidationError, PermissionDenied) as e:
            return Response(
                {'error': True, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            InspectionSerializer(inspection).data,
            status=status.HTTP_201_CREATED,
        )


class InspectionDetailView(APIView):
    """GET /api/inspections/:id/ — Retrieve an inspection."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            inspection = Inspection.objects.select_related(
                'booking', 'booking__vehicle', 'booking__renter', 'created_by',
            ).prefetch_related('photos').get(id=pk)
        except Inspection.DoesNotExist:
            raise Http404("Inspection not found.")

        # Authorization check
        booking = inspection.booking
        user = request.user
        if (
            user != booking.renter
            and user != booking.vehicle.owner
            and 'ADMIN' not in getattr(user, 'roles', [])
        ):
            raise Http404("Inspection not found.")

        return Response(InspectionSerializer(inspection).data)


class BookingInspectionSummaryView(APIView):
    """GET /api/inspections/booking/:booking_id/summary/ — Get inspection summary."""
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.select_related(
                'vehicle', 'vehicle__owner', 'renter',
            ).get(id=booking_id)
        except Booking.DoesNotExist:
            raise Http404("Booking not found.")

        user = request.user
        if (
            user != booking.renter
            and user != booking.vehicle.owner
            and 'ADMIN' not in getattr(user, 'roles', [])
        ):
            raise Http404("Booking not found.")

        summary = InspectionService.get_inspection_summary(booking)
        return Response(InspectionSummarySerializer(summary).data)
