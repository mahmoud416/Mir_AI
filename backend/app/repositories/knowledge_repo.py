"""
MIR Backend — Knowledge Base Repository
CRUD for knowledge_base and dataset_records collections.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from app.db.database import get_db
from app.models.documents import DatasetRecord, ImportJobDocument, KBDocument

logger = logging.getLogger(__name__)


class KnowledgeRepository:

    @property
    def _kb(self):
        return get_db().knowledge_base

    @property
    def _ds(self):
        return get_db().dataset_records

    @property
    def _jobs(self):
        return get_db().import_jobs

    # ── Knowledge Base ─────────────────────────────────────────────────────────

    async def upsert_kb_record(self, doc: KBDocument) -> KBDocument:
        await self._kb.update_one(
            {"id": doc.id},
            {"$set": doc.model_dump()},
            upsert=True,
        )
        return doc

    async def get_kb_record(self, record_id: str) -> KBDocument | None:
        raw = await self._kb.find_one({"id": record_id})
        return KBDocument(**raw) if raw else None

    async def list_kb_records(
        self,
        *,
        category: str | None = None,
        language: str | None = None,
        is_verified: bool | None = None,
        search: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[KBDocument], int]:
        query: dict[str, Any] = {"is_active": True}
        if category:
            query["category"] = category
        if language:
            query["language"] = language
        if is_verified is not None:
            query["is_verified"] = is_verified
        if search:
            query["$text"] = {"$search": search}

        total = await self._kb.count_documents(query)
        cursor = self._kb.find(query).sort("created_at", -1).skip(skip).limit(limit)
        docs = [KBDocument(**d) async for d in cursor]
        return docs, total

    async def search_kb_by_keywords(self, keywords: str, limit: int = 5) -> list[KBDocument]:
        """Keyword-based retrieval from knowledge_base collection."""
        if not keywords or not keywords.strip():
            return []
        tokens = [t.strip() for t in keywords.split() if len(t.strip()) > 2]
        if not tokens:
            return []
        import re
        pattern = "|".join(re.escape(t) for t in tokens[:6])
        query: dict[str, Any] = {
            "is_active": True,
            "$or": [
                {"title": {"$regex": pattern, "$options": "i"}},
                {"content": {"$regex": pattern, "$options": "i"}},
                {"category": {"$regex": pattern, "$options": "i"}},
                {"tags": {"$in": tokens[:6]}},
            ],
        }
        try:
            cursor = (
                self._kb
                .find(query)
                .sort([("is_verified", -1), ("created_at", -1)])
                .limit(limit)
            )
            return [KBDocument(**d) async for d in cursor]
        except Exception as exc:
            logger.warning("KB keyword search failed: %s", exc)
            return []

    # ── Dataset Records ────────────────────────────────────────────────────────

    async def search_dataset_by_keywords(self, keywords: str, limit: int = 3) -> list[DatasetRecord]:
        """Keyword-based retrieval from dataset_records collection."""
        if not keywords or not keywords.strip():
            return []
        tokens = [t.strip() for t in keywords.split() if len(t.strip()) > 2]
        if not tokens:
            return []
        import re
        pattern = "|".join(re.escape(t) for t in tokens[:6])
        query: dict[str, Any] = {
            "$or": [
                {"question": {"$regex": pattern, "$options": "i"}},
                {"answer": {"$regex": pattern, "$options": "i"}},
                {"category": {"$regex": pattern, "$options": "i"}},
                {"tags": {"$in": tokens[:6]}},
            ],
        }
        try:
            cursor = self._ds.find(query).sort("created_at", -1).limit(limit)
            return [DatasetRecord(**d) async for d in cursor]
        except Exception as exc:
            logger.warning("Dataset keyword search failed: %s", exc)
            return []

    async def record_exists(self, content_hash: str) -> bool:
        return bool(await self._ds.find_one({"content_hash": content_hash}, {"_id": 1}))

    async def get_existing_hashes(self, hashes: list[str]) -> set[str]:
        if not hashes:
            return set()
        cursor = self._ds.find({"content_hash": {"$in": hashes}}, {"content_hash": 1})
        return {d["content_hash"] async for d in cursor}

    async def insert_dataset_record(self, doc: DatasetRecord) -> DatasetRecord:
        await self._ds.insert_one(doc.model_dump())
        return doc

    async def insert_dataset_records_batch(self, docs: list[DatasetRecord]) -> int:
        if not docs:
            return 0
        await self._ds.insert_many([d.model_dump() for d in docs], ordered=False)
        return len(docs)

    async def list_dataset_records(
        self,
        import_job_id: str | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[DatasetRecord], int]:
        query: dict[str, Any] = {}
        if import_job_id:
            query["import_job_id"] = import_job_id
        total = await self._ds.count_documents(query)
        cursor = self._ds.find(query).sort("created_at", -1).skip(skip).limit(limit)
        docs = [DatasetRecord(**d) async for d in cursor]
        return docs, total

    # ── Import Jobs ────────────────────────────────────────────────────────────

    async def create_import_job(self, job: ImportJobDocument) -> ImportJobDocument:
        await self._jobs.insert_one(job.model_dump())
        return job

    async def update_import_job(self, job_id: str, updates: dict[str, Any]) -> None:
        updates["updated_at"] = datetime.now(UTC)
        await self._jobs.update_one({"id": job_id}, {"$set": updates})

    async def get_import_job(self, job_id: str) -> ImportJobDocument | None:
        raw = await self._jobs.find_one({"id": job_id})
        return ImportJobDocument(**raw) if raw else None

    async def list_import_jobs(self, skip: int = 0, limit: int = 20) -> list[ImportJobDocument]:
        cursor = self._jobs.find({}).sort("created_at", -1).skip(skip).limit(limit)
        return [ImportJobDocument(**d) async for d in cursor]
