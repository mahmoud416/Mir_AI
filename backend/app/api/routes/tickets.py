"""
MIR Backend — Ticket Routes
POST  /api/v1/tickets
GET   /api/v1/tickets
GET   /api/v1/tickets/{ticket_id}
PATCH /api/v1/tickets/{ticket_id}
"""

from __future__ import annotations

from fastapi import APIRouter, Query, status

from app.schemas.api import TicketCreateRequest, TicketListResponse, TicketOut, TicketUpdateRequest
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/tickets", tags=["Tickets"])
_service = TicketService()


@router.post(
    "",
    response_model=TicketOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a support ticket",
    description=(
        "Creates a ticket in MongoDB (source: mongodb_demo). "
        "SAP integration is not active in this prototype. "
        "Tickets created here are clearly marked as demo tickets."
    ),
    responses={
        201: {
            "description": "Ticket created",
            "content": {
                "application/json": {
                    "example": {
                        "id": "abc123",
                        "title": "Cannot sign in to Microsoft account",
                        "description": "My password is expired...",
                        "category": "account",
                        "priority": "medium",
                        "status": "open",
                        "source": "mongodb_demo",
                        "created_at": "2025-01-01T10:00:00Z",
                        "updated_at": "2025-01-01T10:00:00Z",
                    }
                }
            },
        }
    },
)
async def create_ticket(body: TicketCreateRequest) -> TicketOut:
    return await _service.create_ticket(body)


@router.get(
    "",
    response_model=TicketListResponse,
    summary="List tickets",
)
async def list_tickets(
    user_id: str | None = Query(default=None),
    ticket_status: str | None = Query(default=None, alias="status"),
    category: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> TicketListResponse:
    return await _service.list_tickets(
        user_id=user_id,
        status=ticket_status,
        category=category,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{ticket_id}",
    response_model=TicketOut,
    summary="Get a ticket by ID",
)
async def get_ticket(ticket_id: str) -> TicketOut:
    return await _service.get_ticket(ticket_id)


@router.patch(
    "/{ticket_id}",
    response_model=TicketOut,
    summary="Update a ticket",
)
async def update_ticket(ticket_id: str, body: TicketUpdateRequest) -> TicketOut:
    return await _service.update_ticket(ticket_id, body)
