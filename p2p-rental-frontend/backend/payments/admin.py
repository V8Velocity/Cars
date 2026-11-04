from django.contrib import admin
from .models import Payment, PaymentAttempt, Refund, Payout


class PaymentAttemptInline(admin.TabularInline):
    model = PaymentAttempt
    extra = 0
    readonly_fields = ['attempt_number', 'result', 'provider_response', 'error_code', 'error_message', 'created_at']


class RefundInline(admin.TabularInline):
    model = Refund
    extra = 0
    readonly_fields = ['idempotency_key', 'amount', 'reason', 'status', 'provider_refund_id', 'created_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'idempotency_key', 'booking', 'user', 'payment_type', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'payment_type', 'provider_name']
    search_fields = ['idempotency_key', 'provider_payment_id']
    readonly_fields = ['idempotency_key', 'created_at', 'updated_at']
    inlines = [PaymentAttemptInline, RefundInline]


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ['id', 'idempotency_key', 'booking', 'owner', 'amount', 'status', 'created_at']
    list_filter = ['status']
    readonly_fields = ['idempotency_key', 'created_at', 'updated_at']
