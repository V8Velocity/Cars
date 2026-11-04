from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'vehicle', 'renter', 'start_datetime', 'end_datetime', 'status', 'total_amount']
    list_filter = ['status']
    search_fields = ['vehicle__registration_number', 'renter__email']
    readonly_fields = ['rental_amount', 'platform_fee', 'tax', 'security_deposit', 'total_amount', 'created_at', 'updated_at']
