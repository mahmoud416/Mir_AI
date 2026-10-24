"""
MIR Backend — SAP Integration Adapter (Stub / Future)
─────────────────────────────────────────────────────
This module defines the SAP adapter interface but does NOT make any real SAP
API calls. Live calls require confirmation of:

  1. SAP product and version (e.g., SAP S/4HANA, SAP BTP, SAP Service Cloud)
  2. Available API (OData v2/v4, REST, SOAP, RFC)
  3. Authentication method (OAuth2, Basic, X-CSRF token, mTLS)
  4. Required permissions / service accounts
  5. Sandbox/test environment URL and credentials

Until the above is confirmed, all methods raise SAPNotConfiguredError.
"""

from __future__ import annotations

import logging
from typing import Any

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class SAPNotConfiguredError(Exception):
    """Raised when SAP integration is attempted without confirmed configuration."""


class SAPUnavailableError(Exception):
    """Raised when SAP is configured but the call fails."""


class SAPAdapter:
    """
    Future SAP integration adapter.
    Provides the interface contract so it can be wired into services
    once the SAP environment details are confirmed.
    """

    def __init__(self) -> None:
        self._settings = get_settings()

    def _assert_configured(self) -> None:
        if not self._settings.sap_configured:
            raise SAPNotConfiguredError(
                "SAP integration is not yet configured. "
                "Please provide SAP_BASE_URL, SAP_CLIENT_ID, and SAP_CLIENT_SECRET "
                "after confirming the SAP product, API type, and sandbox environment."
            )

    async def get_order_info(self, order_id: str, requester_id: str) -> dict[str, Any]:
        """
        Retrieve order information — requester authorization MUST be verified
        before returning any order data.

        ⚠️  NOT IMPLEMENTED — requires confirmed SAP API details.
        """
        self._assert_configured()
        # TODO: implement after SAP environment is confirmed
        raise NotImplementedError(
            "SAP order lookup is not yet implemented. "
            "Authorization check and SAP endpoint details are required first."
        )

    async def create_service_ticket(
        self,
        *,
        title: str,
        description: str,
        category: str,
        priority: str,
        requester_id: str,
        idempotency_key: str,
    ) -> dict[str, Any]:
        """
        Create a service ticket in SAP.

        ⚠️  NOT IMPLEMENTED — requires confirmed SAP API details.
        The idempotency_key must be stored before the call and checked on retry
        to prevent duplicate ticket creation.
        """
        self._assert_configured()
        # TODO: implement with idempotency check, timeout handling, and safe error messages
        raise NotImplementedError(
            "SAP ticket creation is not yet implemented. "
            "Requires confirmed SAP API endpoint, auth method, and sandbox access."
        )

    async def get_ticket_status(self, external_ticket_id: str) -> dict[str, Any]:
        """
        Retrieve the status of an existing SAP service ticket.

        ⚠️  NOT IMPLEMENTED — requires confirmed SAP API details.
        """
        self._assert_configured()
        raise NotImplementedError(
            "SAP ticket status lookup is not yet implemented."
        )


_sap_adapter: SAPAdapter | None = None


def get_sap_adapter() -> SAPAdapter:
    global _sap_adapter  # noqa: PLW0603
    if _sap_adapter is None:
        _sap_adapter = SAPAdapter()
    return _sap_adapter
