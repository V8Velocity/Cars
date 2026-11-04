from django.contrib import admin
from .models import Vehicle, VehicleImage, VehicleDocument, Availability


class VehicleImageInline(admin.TabularInline):
    model = VehicleImage
    extra = 0


class VehicleDocumentInline(admin.TabularInline):
    model = VehicleDocument
    extra = 0


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['id', 'make', 'model', 'year', 'owner', 'status', 'price_per_day', 'created_at']
    list_filter = ['status', 'vehicle_type', 'fuel_type', 'transmission']
    search_fields = ['make', 'model', 'registration_number', 'location']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [VehicleImageInline, VehicleDocumentInline]


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ['vehicle', 'start_datetime', 'end_datetime', 'status', 'reason']
    list_filter = ['status', 'reason']
