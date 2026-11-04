from rest_framework import serializers
from .models import Inspection, InspectionPhoto


class InspectionPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionPhoto
        fields = ['id', 'image', 'description', 'created_at']
        read_only_fields = ['created_at']


class InspectionSerializer(serializers.ModelSerializer):
    photos = InspectionPhotoSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True,
    )

    class Meta:
        model = Inspection
        fields = [
            'id', 'booking', 'created_by', 'created_by_name',
            'inspection_type', 'odometer', 'fuel_level',
            'exterior_condition', 'interior_condition',
            'notes', 'damage_notes', 'has_damage',
            'odometer_difference', 'fuel_difference', 'is_late_return',
            'created_at', 'photos',
        ]
        read_only_fields = [
            'created_by', 'odometer_difference', 'fuel_difference',
            'is_late_return', 'created_at',
        ]


class CreateInspectionSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    inspection_type = serializers.ChoiceField(choices=Inspection.Type.choices)
    odometer = serializers.IntegerField(min_value=0)
    fuel_level = serializers.IntegerField(min_value=0, max_value=100)
    exterior_condition = serializers.ChoiceField(
        choices=Inspection.Condition.choices, default='GOOD',
    )
    interior_condition = serializers.ChoiceField(
        choices=Inspection.Condition.choices, default='GOOD',
    )
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    damage_notes = serializers.CharField(required=False, allow_blank=True, default='')
    has_damage = serializers.BooleanField(default=False)


class InspectionSummarySerializer(serializers.Serializer):
    handover = InspectionSerializer(allow_null=True)
    return_inspection = InspectionSerializer(source='return', allow_null=True)
    has_damage = serializers.BooleanField()
    odometer_difference = serializers.IntegerField(allow_null=True)
    fuel_difference = serializers.IntegerField(allow_null=True)
    is_late_return = serializers.BooleanField()
