"""
MIR Backend — Knowledge Base Service
Business logic for managing the knowledge base (KB) collection.
"""

from __future__ import annotations

import logging
import uuid

from fastapi import HTTPException, status

from app.models.documents import KBDocument, KBSource
from app.repositories.knowledge_repo import KnowledgeRepository
from app.schemas.api import KBListResponse, KBRecordOut

logger = logging.getLogger(__name__)


class KnowledgeService:

    def __init__(self) -> None:
        self._repo = KnowledgeRepository()

    async def list_records(
        self,
        *,
        category: str | None = None,
        language: str | None = None,
        is_verified: bool | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> KBListResponse:
        skip = (page - 1) * page_size
        docs, total = await self._repo.list_kb_records(
            category=category,
            language=language,
            is_verified=is_verified,
            search=search,
            skip=skip,
            limit=page_size,
        )
        return KBListResponse(
            items=[self._to_out(d) for d in docs],
            total=total,
        )

    async def get_record(self, record_id: str) -> KBRecordOut:
        doc = await self._repo.get_kb_record(record_id)
        if doc is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Knowledge base record '{record_id}' not found.",
            )
        return self._to_out(doc)

    async def create_record(self, payload: dict) -> KBRecordOut:
        doc = KBDocument(
            id=str(uuid.uuid4()),
            title=payload.get("title", ""),
            content=payload.get("content", ""),
            category=payload.get("category", "general"),
            language=payload.get("language", "en"),
            tags=payload.get("tags", []),
            source=KBSource(payload.get("source", "internal")),
            source_url=payload.get("source_url"),
            is_verified=payload.get("is_verified", False),
        )
        saved = await self._repo.upsert_kb_record(doc)
        return self._to_out(saved)

    @staticmethod
    def _to_out(doc: KBDocument) -> KBRecordOut:
        return KBRecordOut(
            id=doc.id,
            title=doc.title,
            content=doc.content,
            category=doc.category,
            language=doc.language,
            tags=doc.tags,
            source=doc.source.value,
            source_url=doc.source_url,
            is_verified=doc.is_verified,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
        )
