from decimal import Decimal
from rest_framework import serializers
from .models import Payment, PaymentAttempt, Refund, Payout


class PaymentAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentAttempt
        fields = ['id', 'attempt_number', 'result', 'error_code', 'error_message', 'created_at']


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = [
            'id', 'idempotency_key', 'amount', 'reason', 'status',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['idempotency_key', 'status', 'created_at', 'updated_at']


class PayoutSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)

    class Meta:
        model = Payout
        fields = [
            'id', 'idempotency_key', 'booking', 'owner', 'owner_name',
            'amount', 'platform_fee_deducted', 'status',
            'scheduled_at', 'completed_at', 'created_at',
        ]
        read_only_fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    attempts = PaymentAttemptSerializer(many=True, read_only=True)
    refunds = RefundSerializer(many=True, read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'idempotency_key', 'booking', 'user',
            'payment_type', 'status',
            'rental_amount', 'platform_fee', 'tax',
            'security_deposit', 'discount', 'total_amount',
            'provider_name', 'currency', 'description',
            'created_at', 'updated_at',
            'attempts', 'refunds',
        ]
        read_only_fields = [
            'idempotency_key', 'user', 'status',
            'rental_amount', 'platform_fee', 'tax',
            'security_deposit', 'discount', 'total_amount',
            'provider_name', 'currency',
            'created_at', 'updated_at',
        ]


class CreatePaymentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()


class ProcessPaymentSerializer(serializers.Serializer):
    """No payment method details stored — provider handles tokenization."""
    pass


class CreateRefundSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    reason = serializers.ChoiceField(choices=Refund.Reason.choices)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
