"""
payments/providers/mock.py

Mock payment provider for development and testing.
Simulates realistic provider behavior including:
- Idempotent charge/refund/payout
- Configurable failure simulation
- Deterministic webhook signatures
"""
import hashlib
import hmac
import uuid
from decimal import Decimal
from typing import Optional

from . import BasePaymentProvider, ChargeResult, RefundResult, PayoutResult


class MockPaymentProvider(BasePaymentProvider):
    """
    In-memory mock provider. Tracks processed idempotency keys
    to enforce idempotent behavior.

    Configure failure simulation:
        provider = MockPaymentProvider(fail_next=True)
        provider.charge(...)  # → failure
        provider.charge(...)  # → success (fail_next resets)
    """

    def __init__(self, *, fail_next: bool = False):
        self._processed: dict[str, dict] = {}
        self.fail_next = fail_next

    @property
    def name(self) -> str:
        return 'mock'

    def charge(
        self,
        *,
        amount: Decimal,
        currency: str,
        idempotency_key: str,
        description: str = '',
        metadata: Optional[dict] = None,
    ) -> ChargeResult:
        # Idempotency: return cached result for duplicate key
        cache_key = f'charge:{idempotency_key}'
        if cache_key in self._processed:
            cached = self._processed[cache_key]
            return ChargeResult(**cached)

        # Simulate failure
        if self.fail_next:
            self.fail_next = False
            result = ChargeResult(
                success=False,
                error_code='CARD_DECLINED',
                error_message='Mock: Card was declined.',
                raw_response={'mock': True, 'simulated_failure': True},
            )
            self._processed[cache_key] = {
                'success': result.success,
                'error_code': result.error_code,
                'error_message': result.error_message,
                'raw_response': result.raw_response,
            }
            return result

        provider_id = f'mock_ch_{uuid.uuid4().hex[:16]}'
        result = ChargeResult(
            success=True,
            provider_payment_id=provider_id,
            raw_response={
                'mock': True,
                'id': provider_id,
                'amount': str(amount),
                'currency': currency,
                'status': 'captured',
            },
        )
        self._processed[cache_key] = {
            'success': result.success,
            'provider_payment_id': result.provider_payment_id,
            'raw_response': result.raw_response,
        }
        return result

    def refund(
        self,
        *,
        provider_payment_id: str,
        amount: Decimal,
        idempotency_key: str,
        reason: str = '',
    ) -> RefundResult:
        cache_key = f'refund:{idempotency_key}'
        if cache_key in self._processed:
            cached = self._processed[cache_key]
            return RefundResult(**cached)

        if self.fail_next:
            self.fail_next = False
            result = RefundResult(
                success=False,
                error_code='REFUND_FAILED',
                error_message='Mock: Refund processing failed.',
                raw_response={'mock': True, 'simulated_failure': True},
            )
            self._processed[cache_key] = {
                'success': result.success,
                'error_code': result.error_code,
                'error_message': result.error_message,
                'raw_response': result.raw_response,
            }
            return result

        refund_id = f'mock_re_{uuid.uuid4().hex[:16]}'
        result = RefundResult(
            success=True,
            provider_refund_id=refund_id,
            raw_response={
                'mock': True,
                'id': refund_id,
                'charge': provider_payment_id,
                'amount': str(amount),
                'status': 'completed',
            },
        )
        self._processed[cache_key] = {
            'success': result.success,
            'provider_refund_id': result.provider_refund_id,
            'raw_response': result.raw_response,
        }
        return result

    def payout(
        self,
        *,
        recipient_id: str,
        amount: Decimal,
        currency: str,
        idempotency_key: str,
        description: str = '',
    ) -> PayoutResult:
        cache_key = f'payout:{idempotency_key}'
        if cache_key in self._processed:
            cached = self._processed[cache_key]
            return PayoutResult(**cached)

        if self.fail_next:
            self.fail_next = False
            result = PayoutResult(
                success=False,
                error_code='PAYOUT_FAILED',
                error_message='Mock: Payout processing failed.',
                raw_response={'mock': True, 'simulated_failure': True},
            )
            self._processed[cache_key] = {
                'success': result.success,
                'error_code': result.error_code,
                'error_message': result.error_message,
                'raw_response': result.raw_response,
            }
            return result

        payout_id = f'mock_po_{uuid.uuid4().hex[:16]}'
        result = PayoutResult(
            success=True,
            provider_payout_id=payout_id,
            raw_response={
                'mock': True,
                'id': payout_id,
                'recipient': recipient_id,
                'amount': str(amount),
                'currency': currency,
                'status': 'completed',
            },
        )
        self._processed[cache_key] = {
            'success': result.success,
            'provider_payout_id': result.provider_payout_id,
            'raw_response': result.raw_response,
        }
        return result

    def verify_webhook_signature(
        self,
        *,
        payload: bytes,
        signature: str,
        secret: str,
    ) -> bool:
        expected = hmac.new(
            secret.encode(), payload, hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)
