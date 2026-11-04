from rest_framework import serializers
from .models import Booking
from vehicles.models import Vehicle

class BookingVehicleSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'year', 'vehicle_type', 'owner_name']

class BookingSerializer(serializers.ModelSerializer):
    vehicle_details = BookingVehicleSerializer(source='vehicle', read_only=True)
    renter_name = serializers.CharField(source='renter.get_full_name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'vehicle', 'vehicle_details', 'renter', 'renter_name',
            'start_datetime', 'end_datetime', 'status',
            'rental_amount', 'platform_fee', 'tax', 'security_deposit', 'total_amount',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'renter', 'status', 'rental_amount', 'platform_fee', 'tax', 
            'security_deposit', 'total_amount', 'created_at', 'updated_at'
        ]

class BookingCreateSerializer(serializers.Serializer):
    vehicle_id = serializers.IntegerField()
    start_datetime = serializers.DateTimeField()
    end_datetime = serializers.DateTimeField()

class BookingCancelSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
