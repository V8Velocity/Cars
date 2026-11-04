from django.contrib import admin
from .models import Inspection, InspectionPhoto


class InspectionPhotoInline(admin.TabularInline):
    model = InspectionPhoto
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Inspection)
class InspectionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'booking', 'inspection_type', 'odometer', 'fuel_level',
        'has_damage', 'is_late_return', 'created_by', 'created_at',
    ]
    list_filter = ['inspection_type', 'has_damage', 'is_late_return']
    search_fields = ['booking__id']
    readonly_fields = [
        'odometer_difference', 'fuel_difference', 'is_late_return', 'created_at',
    ]
    inlines = [InspectionPhotoInline]
