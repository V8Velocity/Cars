"""
vehicles/views.py

Thin HTTP controllers. All logic lives in services.py and selectors.py.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.exceptions import ValidationError, PermissionDenied
from django.http import Http404

from .serializers import (
    VehicleListSerializer,
    VehicleDetailSerializer,
    VehicleCreateSerializer,
    VehicleUpdateSerializer,
)
from .selectors import get_public_vehicles, get_vehicle_detail, get_owner_vehicles
from .services import create_vehicle, update_vehicle, delete_vehicle, submit_for_verification
from .permissions import IsVehicleOwner, IsOwnerRole


# ── Public endpoints ───────────────────────────────────────────

class VehicleListView(APIView):
    """
    GET /api/vehicles/
    Public listing of approved vehicles with filtering.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        params = request.query_params
        vehicles = get_public_vehicles(
            location=params.get('location'),
            vehicle_type=params.get('type'),
            fuel_type=params.get('fuel'),
            transmission=params.get('transmission'),
            min_seats=int(params['seats']) if params.get('seats') else None,
            min_price=params.get('min_price'),
            max_price=params.get('max_price'),
            available_from=params.get('available_from'),
            available_to=params.get('available_to'),
            ordering=params.get('ordering', 'newest'),
        )
        serializer = VehicleListSerializer(vehicles, many=True)
        return Response(serializer.data)


class VehicleDetailView(APIView):
    """
    GET /api/vehicles/:id/
    Public detail view of a single vehicle.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            vehicle = get_vehicle_detail(vehicle_id=pk)
        except Exception:
            raise Http404("Vehicle not found.")

        # Non-owners can only see approved vehicles
        if vehicle.status != 'APPROVED' and vehicle.owner != request.user:
            raise Http404("Vehicle not found.")

        serializer = VehicleDetailSerializer(vehicle)
        return Response(serializer.data)


# ── Owner endpoints ────────────────────────────────────────────

class OwnerVehicleListCreateView(APIView):
    """
    GET  /api/vehicles/mine/        → List owner's vehicles
    POST /api/vehicles/mine/        → Create a new vehicle
    """
    permission_classes = [IsAuthenticated, IsOwnerRole]

    def get(self, request):
        vehicles = get_owner_vehicles(owner=request.user)
        serializer = VehicleListSerializer(vehicles, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = VehicleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            vehicle = create_vehicle(
                owner=request.user,
                **serializer.validated_data,
            )
        except (ValidationError, PermissionDenied) as e:
            return Response(
                {'error': True, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            VehicleDetailSerializer(vehicle).data,
            status=status.HTTP_201_CREATED,
        )


class OwnerVehicleDetailView(APIView):
    """
    PATCH  /api/vehicles/:id/       → Update vehicle
    DELETE /api/vehicles/:id/       → Delete vehicle (DRAFT only)
    """
    permission_classes = [IsAuthenticated, IsVehicleOwner]

    def _get_vehicle(self, pk, user):
        try:
            vehicle = get_vehicle_detail(vehicle_id=pk)
        except Exception:
            raise Http404("Vehicle not found.")

        # Check object-level permission
        if vehicle.owner != user:
            raise Http404("Vehicle not found.")

        return vehicle

    def patch(self, request, pk):
        vehicle = self._get_vehicle(pk, request.user)

        serializer = VehicleUpdateSerializer(
            data=request.data,
            context={'vehicle': vehicle},
        )
        serializer.is_valid(raise_exception=True)

        try:
            vehicle = update_vehicle(
                vehicle=vehicle,
                data=serializer.validated_data,
            )
        except ValidationError as e:
            return Response(
                {'error': True, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(VehicleDetailSerializer(vehicle).data)

    def delete(self, request, pk):
        vehicle = self._get_vehicle(pk, request.user)

        try:
            delete_vehicle(vehicle=vehicle)
        except ValidationError as e:
            return Response(
                {'error': True, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class VehicleSubmitView(APIView):
    """
    POST /api/vehicles/:id/submit/  → Submit vehicle for verification
    """
    permission_classes = [IsAuthenticated, IsVehicleOwner]

    def post(self, request, pk):
        try:
            vehicle = get_vehicle_detail(vehicle_id=pk)
        except Exception:
            raise Http404("Vehicle not found.")

        if vehicle.owner != request.user:
            raise Http404("Vehicle not found.")

        try:
            vehicle = submit_for_verification(vehicle=vehicle)
        except ValidationError as e:
            return Response(
                {'error': True, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(VehicleDetailSerializer(vehicle).data)
