"""
MIR Backend — Conversation Repository
All MongoDB CRUD operations for conversations and messages.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from app.db.database import get_db
from app.models.documents import ConversationDocument, ConversationStatus, MessageDocument

logger = logging.getLogger(__name__)


class ConversationRepository:

    @property
    def _convs(self):
        return get_db().conversations

    @property
    def _msgs(self):
        return get_db().messages

    # ── Conversations ──────────────────────────────────────────────────────────

    async def create_conversation(self, doc: ConversationDocument) -> ConversationDocument:
        await self._convs.insert_one(doc.model_dump())
        return doc

    async def get_conversation(self, conversation_id: str) -> ConversationDocument | None:
        raw = await self._convs.find_one({"id": conversation_id})
        return ConversationDocument(**raw) if raw else None

    async def update_conversation(
        self,
        conversation_id: str,
        updates: dict[str, Any],
    ) -> None:
        updates["updated_at"] = datetime.now(UTC)
        await self._convs.update_one({"id": conversation_id}, {"$set": updates})

    async def increment_message_count(self, conversation_id: str) -> None:
        await self._convs.update_one(
            {"id": conversation_id},
            {"$inc": {"message_count": 1}, "$set": {"updated_at": datetime.now(UTC)}},
        )

    async def list_conversations(
        self,
        user_id: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[ConversationDocument], int]:
        query: dict[str, Any] = {}
        if user_id:
            query["user_id"] = user_id

        total = await self._convs.count_documents(query)
        cursor = self._convs.find(query).sort("updated_at", -1).skip(skip).limit(limit)
        docs = [ConversationDocument(**d) async for d in cursor]
        return docs, total

    async def delete_conversation(self, conversation_id: str) -> bool:
        res = await self._convs.delete_one({"id": conversation_id})
        await self._msgs.delete_many({"conversation_id": conversation_id})
        return res.deleted_count > 0

    # ── Messages ───────────────────────────────────────────────────────────────

    async def add_message(self, msg: MessageDocument) -> MessageDocument:
        await self._msgs.insert_one(msg.model_dump())
        await self.increment_message_count(msg.conversation_id)
        return msg

    async def get_messages(
        self,
        conversation_id: str,
        limit: int = 50,
    ) -> list[MessageDocument]:
        cursor = (
            self._msgs
            .find({"conversation_id": conversation_id})
            .sort("created_at", 1)
            .limit(limit)
        )
        return [MessageDocument(**d) async for d in cursor]

    async def get_recent_messages(
        self,
        conversation_id: str,
        limit: int = 10,
    ) -> list[MessageDocument]:
        """Return the last N messages for AI context (most recent last)."""
        cursor = (
            self._msgs
            .find({"conversation_id": conversation_id})
            .sort("created_at", -1)
            .limit(limit)
        )
        msgs = [MessageDocument(**d) async for d in cursor]
        return list(reversed(msgs))
