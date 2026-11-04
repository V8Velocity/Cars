import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.exceptions import ValidationError
from django.http import Http404

from bookings.models import Booking
from .models import Payment
from .serializers import (
    PaymentSerializer,
    CreatePaymentSerializer,
    CreateRefundSerializer,
)
from .services import PaymentService
from .providers.mock import MockPaymentProvider


class PaymentCreateView(APIView):
    """POST /api/payments/ — Create a payment intent for a booking."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            booking = Booking.objects.select_related('vehicle').get(
                id=serializer.validated_data['booking_id'],
                renter=request.user,
            )
        except Booking.DoesNotExist:
            return Response(
                {'error': True, 'message': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            payment = PaymentService.create_payment(booking=booking)
        except ValidationError as e:
            return Response(
                {'error': True, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED,
        )


class PaymentProcessView(APIView):
    """POST /api/payments/:id/process/ — Charge the payment."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(id=pk, user=request.user)
        except Payment.DoesNotExist:
            raise Http404("Payment not found.")

        try:
            payment = PaymentService.process_payment(payment=payment)
        except ValidationError as e:
            return Response(
                {'error': True, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(PaymentSerializer(payment).data)


class PaymentDetailView(APIView):
    """GET /api/payments/:id/ — Retrieve payment details."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            payment = Payment.objects.prefetch_related(
                'attempts', 'refunds',
            ).get(id=pk, user=request.user)
        except Payment.DoesNotExist:
            raise Http404("Payment not found.")

        return Response(PaymentSerializer(payment).data)


class RefundCreateView(APIView):
    """POST /api/payments/:id/refund/ — Issue a refund."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(id=pk)
        except Payment.DoesNotExist:
            raise Http404("Payment not found.")

        # Only the renter, vehicle owner, or admin can initiate refunds
        booking = payment.booking
        user = request.user
        if (
            user != booking.renter
            and user != booking.vehicle.owner
            and 'ADMIN' not in getattr(user, 'roles', [])
        ):
            raise Http404("Payment not found.")

        serializer = CreateRefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            refund = PaymentService.create_refund(
                payment=payment,
                amount=serializer.validated_data['amount'],
                reason=serializer.validated_data['reason'],
            )
        except ValidationError as e:
            return Response(
                {'error': True, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(PaymentSerializer(payment).data)


class WebhookView(APIView):
    """
    POST /api/payments/webhook/
    Receives webhook events from payment providers.
    No authentication — uses signature verification instead.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        provider = MockPaymentProvider()
        signature = request.headers.get('X-Webhook-Signature', '')
        secret = 'mock_webhook_secret'  # TODO: Move to settings

        # Verify signature
        raw_body = request.body
        if not provider.verify_webhook_signature(
            payload=raw_body, signature=signature, secret=secret,
        ):
            return Response(
                {'error': 'Invalid signature'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            payload = json.loads(raw_body)
        except json.JSONDecodeError:
            return Response(
                {'error': 'Invalid JSON'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event_type = payload.get('type', '')
        PaymentService.handle_webhook(event_type=event_type, payload=payload)

        return Response({'received': True})
