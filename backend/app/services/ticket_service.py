"""
MIR Backend — Ticket Service
Business logic for support ticket lifecycle management.
"""

from __future__ import annotations

import logging

from fastapi import HTTPException, status

from app.models.documents import TicketDocument, TicketSource, TicketStatus
from app.repositories.ticket_repo import TicketRepository
from app.schemas.api import TicketCreateRequest, TicketListResponse, TicketOut, TicketUpdateRequest

logger = logging.getLogger(__name__)


class TicketService:

    def __init__(self) -> None:
        self._repo = TicketRepository()

    async def create_ticket(self, request: TicketCreateRequest) -> TicketOut:
        """
        Create a support ticket in MongoDB (demo source).
        Does NOT claim SAP integration unless the SAP adapter is wired and confirmed.
        """
        doc = TicketDocument(
            title=request.title or request.subject or "Support Request",
            description=request.description,
            category=request.category,
            priority=request.priority,
            conversation_id=request.conversation_id or request.conversationId,
            user_id=request.user_id or request.userId,
            source=TicketSource.mongodb_demo,
        )
        saved = await self._repo.create_ticket(doc)
        logger.info("Ticket created: id=%s source=mongodb_demo", saved.id)

        conv_id = request.conversation_id or request.conversationId
        if conv_id:
            try:
                from app.models.documents import ConversationStatus
                from app.repositories.conversation_repo import ConversationRepository
                conv_repo = ConversationRepository()
                await conv_repo.update_conversation(conv_id, {
                    "ticket_id": saved.id,
                    "status": ConversationStatus.escalated,
                })
            except Exception as exc:
                logger.warning("Could not link conversation %s to ticket %s: %s", conv_id, saved.id, exc)

        return self._to_out(saved)

    async def list_tickets(
        self,
        *,
        user_id: str | None = None,
        status: str | None = None,
        category: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> TicketListResponse:
        skip = (page - 1) * page_size
        docs, total = await self._repo.list_tickets(
            user_id=user_id,
            status=status,
            category=category,
            skip=skip,
            limit=page_size,
        )
        return TicketListResponse(
            items=[self._to_out(d) for d in docs],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_ticket(self, ticket_id: str) -> TicketOut:
        doc = await self._repo.get_ticket(ticket_id)
        if doc is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket '{ticket_id}' not found.",
            )
        return self._to_out(doc)

    async def update_ticket(self, ticket_id: str, request: TicketUpdateRequest) -> TicketOut:
        updates: dict = {}
        if request.status is not None:
            updates["status"] = request.status.value
        if request.priority is not None:
            updates["priority"] = request.priority.value

        if not updates and not request.note:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No updates provided.",
            )

        if updates:
            doc = await self._repo.update_ticket(ticket_id, updates)
            if doc is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ticket '{ticket_id}' not found.",
                )
        else:
            doc = await self._repo.get_ticket(ticket_id)
            if doc is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ticket '{ticket_id}' not found.",
                )

        if request.note:
            await self._repo.add_note(ticket_id, request.note)

        return self._to_out(doc)

    @staticmethod
    def _to_out(doc: TicketDocument) -> TicketOut:
        return TicketOut(
            id=doc.id,
            user_id=doc.user_id,
            title=doc.title,
            description=doc.description,
            category=doc.category,
            priority=doc.priority,
            status=doc.status,
            conversation_id=doc.conversation_id,
            source=doc.source,
            external_ticket_id=doc.external_ticket_id,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
        )
