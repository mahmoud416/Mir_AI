"""
MIR Backend — Ticket Repository
All MongoDB CRUD operations for support tickets.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from app.db.database import get_db
from app.models.documents import TicketDocument, TicketStatus
from pymongo import ReturnDocument

logger = logging.getLogger(__name__)


class TicketRepository:

    @property
    def _col(self):
        return get_db().tickets

    async def create_ticket(self, doc: TicketDocument) -> TicketDocument:
        await self._col.insert_one(doc.model_dump())
        return doc

    async def get_ticket(self, ticket_id: str) -> TicketDocument | None:
        raw = await self._col.find_one({"id": ticket_id})
        return TicketDocument(**raw) if raw else None

    async def list_tickets(
        self,
        *,
        user_id: str | None = None,
        status: str | None = None,
        category: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[TicketDocument], int]:
        query: dict[str, Any] = {}
        if user_id:
            query["user_id"] = user_id
        if status:
            query["status"] = status
        if category:
            query["category"] = category

        total = await self._col.count_documents(query)
        cursor = self._col.find(query).sort("created_at", -1).skip(skip).limit(limit)
        docs = [TicketDocument(**d) async for d in cursor]
        return docs, total

    async def update_ticket(
        self,
        ticket_id: str,
        updates: dict[str, Any],
    ) -> TicketDocument | None:
        updates["updated_at"] = datetime.now(UTC)
        result = await self._col.find_one_and_update(
            {"id": ticket_id},
            {"$set": updates},
            return_document=ReturnDocument.AFTER,
        )
        return TicketDocument(**result) if result else None

    async def add_note(self, ticket_id: str, note: str, author: str = "system") -> None:
        note_doc = {
            "content": note,
            "author": author,
            "created_at": datetime.now(UTC).isoformat(),
        }
        await self._col.update_one(
            {"id": ticket_id},
            {
                "$push": {"notes": note_doc},
                "$set": {"updated_at": datetime.now(UTC)},
            },
        )
