from rest_framework import serializers
from .models import Vehicle, VehicleImage, VehicleDocument, Availability


# ── Nested serializers ─────────────────────────────────────────

class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ['id', 'image', 'is_primary', 'order', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class VehicleDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleDocument
        fields = ['id', 'document_type', 'file', 'verification_status', 'uploaded_at']
        read_only_fields = ['verification_status', 'uploaded_at']


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['id', 'start_datetime', 'end_datetime', 'status', 'reason']


# ── List / Card serializer (lightweight) ──────────────────────

class VehicleListSerializer(serializers.ModelSerializer):
    """
    Used for search results / vehicle cards.
    Intentionally lightweight — no nested images or documents.
    """
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            'id', 'make', 'model', 'year', 'vehicle_type',
            'fuel_type', 'transmission', 'seats', 'location',
            'price_per_day', 'security_deposit', 'status',
            'owner_name', 'primary_image', 'created_at',
        ]

    def get_primary_image(self, obj):
        # Uses prefetched images to avoid N+1
        images = getattr(obj, '_prefetched_objects_cache', {}).get('images')
        if images is not None:
            primary = next((img for img in images if img.is_primary), None)
            if primary:
                return VehicleImageSerializer(primary).data
            if images:
                return VehicleImageSerializer(images[0]).data
        return None


# ── Detail serializer (full payload) ──────────────────────────

class VehicleDetailSerializer(serializers.ModelSerializer):
    """
    Full vehicle detail — includes images, documents, blocked dates.
    """
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    images = VehicleImageSerializer(many=True, read_only=True)
    documents = VehicleDocumentSerializer(many=True, read_only=True)
    availabilities = AvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'owner_id', 'owner_name',
            'make', 'model', 'year', 'vehicle_type',
            'registration_number', 'fuel_type', 'transmission',
            'seats', 'description', 'location',
            'price_per_day', 'security_deposit',
            'status', 'created_at', 'updated_at',
            'images', 'documents', 'availabilities',
        ]
        read_only_fields = ['owner_id', 'owner_name', 'status', 'created_at', 'updated_at']


# ── Create / Update serializer (write operations) ─────────────

class VehicleCreateSerializer(serializers.Serializer):
    """
    Explicit input serializer for vehicle creation.
    Decoupled from the model to prevent mass-assignment.
    """
    make = serializers.CharField(max_length=50)
    model = serializers.CharField(max_length=50)
    year = serializers.IntegerField(min_value=2000)
    vehicle_type = serializers.ChoiceField(choices=Vehicle.VehicleType.choices)
    registration_number = serializers.CharField(max_length=20)
    fuel_type = serializers.ChoiceField(choices=Vehicle.FuelType.choices)
    transmission = serializers.ChoiceField(choices=Vehicle.Transmission.choices)
    seats = serializers.IntegerField(min_value=1, max_value=50)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    location = serializers.CharField(max_length=255)
    price_per_day = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=1)
    security_deposit = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0, default=0)

    def validate_registration_number(self, value):
        if Vehicle.objects.filter(registration_number=value).exists():
            raise serializers.ValidationError("A vehicle with this registration number already exists.")
        return value


class VehicleUpdateSerializer(serializers.Serializer):
    """
    Explicit input serializer for vehicle updates.
    All fields optional — only supplied fields get updated.
    """
    make = serializers.CharField(max_length=50, required=False)
    model = serializers.CharField(max_length=50, required=False)
    year = serializers.IntegerField(min_value=2000, required=False)
    vehicle_type = serializers.ChoiceField(choices=Vehicle.VehicleType.choices, required=False)
    registration_number = serializers.CharField(max_length=20, required=False)
    fuel_type = serializers.ChoiceField(choices=Vehicle.FuelType.choices, required=False)
    transmission = serializers.ChoiceField(choices=Vehicle.Transmission.choices, required=False)
    seats = serializers.IntegerField(min_value=1, max_value=50, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(max_length=255, required=False)
    price_per_day = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=1, required=False)
    security_deposit = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0, required=False)

    def validate_registration_number(self, value):
        vehicle = self.context.get('vehicle')
        qs = Vehicle.objects.filter(registration_number=value)
        if vehicle:
            qs = qs.exclude(id=vehicle.id)
        if qs.exists():
            raise serializers.ValidationError("A vehicle with this registration number already exists.")
        return value
