"""
MIR Backend — Ticket Endpoint Tests
"""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest

from app.models.documents import TicketPriority, TicketSource, TicketStatus
from app.schemas.api import TicketListResponse, TicketOut


def _make_ticket(**kwargs) -> TicketOut:
    defaults = dict(
        id="ticket-123",
        user_id=None,
        title="Cannot sign in",
        description="My account is locked after too many failed attempts.",
        category="account",
        priority=TicketPriority.medium,
        status=TicketStatus.open,
        conversation_id=None,
        source=TicketSource.mongodb_demo,
        external_ticket_id=None,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    defaults.update(kwargs)
    return TicketOut(**defaults)


@pytest.fixture(autouse=True)
def mock_ticket_service():
    ticket = _make_ticket()
    with patch(
        "app.api.routes.tickets._service.create_ticket",
        new=AsyncMock(return_value=ticket),
    ), patch(
        "app.api.routes.tickets._service.list_tickets",
        new=AsyncMock(
            return_value=TicketListResponse(items=[ticket], total=1, page=1, page_size=20)
        ),
    ), patch(
        "app.api.routes.tickets._service.get_ticket",
        new=AsyncMock(return_value=ticket),
    ), patch(
        "app.api.routes.tickets._service.update_ticket",
        new=AsyncMock(return_value=ticket),
    ):
        yield


def test_create_ticket_success(client):
    resp = client.post(
        "/api/v1/tickets",
        json={
            "title": "Cannot sign in",
            "description": "My account is locked after too many failed attempts.",
            "category": "account",
            "priority": "medium",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["source"] == "mongodb_demo"
    assert data["status"] == "open"


def test_create_ticket_missing_title(client):
    resp = client.post(
        "/api/v1/tickets",
        json={"description": "Missing title field."},
    )
    assert resp.status_code == 422


def test_create_ticket_short_description(client):
    resp = client.post(
        "/api/v1/tickets",
        json={"title": "Valid title", "description": "short"},
    )
    assert resp.status_code == 422


def test_list_tickets(client):
    resp = client.get("/api/v1/tickets")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data


def test_get_ticket(client):
    resp = client.get("/api/v1/tickets/ticket-123")
    assert resp.status_code == 200
    assert resp.json()["id"] == "ticket-123"


def test_update_ticket(client):
    resp = client.patch(
        "/api/v1/tickets/ticket-123",
        json={"status": "in_progress", "note": "Assigned to L2 support."},
    )
    assert resp.status_code == 200
