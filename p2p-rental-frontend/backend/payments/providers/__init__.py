"""
payments/providers/base.py

Abstract base class for payment providers.
All provider implementations must implement this interface.

This abstraction allows swapping between MockPaymentProvider,
Stripe, Razorpay, etc. without changing any business logic.
"""
import abc
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional


@dataclass
class ChargeResult:
    """Standardized result from a charge attempt."""
    success: bool
    provider_payment_id: str = ''
    error_code: str = ''
    error_message: str = ''
    raw_response: dict = None

    def __post_init__(self):
        if self.raw_response is None:
            self.raw_response = {}


@dataclass
class RefundResult:
    """Standardized result from a refund attempt."""
    success: bool
    provider_refund_id: str = ''
    error_code: str = ''
    error_message: str = ''
    raw_response: dict = None

    def __post_init__(self):
        if self.raw_response is None:
            self.raw_response = {}


@dataclass
class PayoutResult:
    """Standardized result from a payout attempt."""
    success: bool
    provider_payout_id: str = ''
    error_code: str = ''
    error_message: str = ''
    raw_response: dict = None

    def __post_init__(self):
        if self.raw_response is None:
            self.raw_response = {}


class BasePaymentProvider(abc.ABC):
    """
    All payment providers must implement these methods.
    The PaymentService calls these methods — it never talks
    to Stripe/Razorpay directly.
    """

    @property
    @abc.abstractmethod
    def name(self) -> str:
        """Human-readable provider name (e.g. 'stripe', 'razorpay')."""
        ...

    @abc.abstractmethod
    def charge(
        self,
        *,
        amount: Decimal,
        currency: str,
        idempotency_key: str,
        description: str = '',
        metadata: Optional[dict] = None,
    ) -> ChargeResult:
        """
        Initiate a charge / payment capture.
        Must be idempotent: calling with the same idempotency_key
        must return the same result without creating a duplicate charge.
        """
        ...

    @abc.abstractmethod
    def refund(
        self,
        *,
        provider_payment_id: str,
        amount: Decimal,
        idempotency_key: str,
        reason: str = '',
    ) -> RefundResult:
        """
        Refund a previously captured payment (full or partial).
        Must be idempotent.
        """
        ...

    @abc.abstractmethod
    def payout(
        self,
        *,
        recipient_id: str,
        amount: Decimal,
        currency: str,
        idempotency_key: str,
        description: str = '',
    ) -> PayoutResult:
        """
        Disburse funds to a vehicle owner.
        Must be idempotent.
        """
        ...

    @abc.abstractmethod
    def verify_webhook_signature(
        self,
        *,
        payload: bytes,
        signature: str,
        secret: str,
    ) -> bool:
        """
        Verify that a webhook payload was sent by the provider.
        Returns True if the signature is valid.
        """
        ...
