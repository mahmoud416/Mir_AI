"""
MIR Backend — Pydantic Models (MongoDB document shapes)
These define the canonical shape of documents stored in MongoDB.
"""

from __future__ import annotations

from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


def _now() -> datetime:
    return datetime.now(UTC)


# ── Shared ────────────────────────────────────────────────────────────────────

class PyObjectId(str):
    """String wrapper that carries MongoDB ObjectId semantics."""

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v: Any) -> str:
        return str(v)


# ── Conversations & Messages ───────────────────────────────────────────────────

class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class ConversationStatus(str, Enum):
    active = "active"
    resolved = "resolved"
    escalated = "escalated"


class MessageDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    conversation_id: str
    role: MessageRole
    content: str
    created_at: datetime = Field(default_factory=_now)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ConversationDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    user_id: str | None = None
    title: str = "New Conversation"
    status: ConversationStatus = ConversationStatus.active
    category: str | None = None
    ticket_id: str | None = None
    message_count: int = 0
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


# ── Tickets ────────────────────────────────────────────────────────────────────

class TicketStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class TicketPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class TicketSource(str, Enum):
    mongodb_demo = "mongodb_demo"
    sap = "sap"


class TicketDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    user_id: str | None = None
    title: str
    description: str
    category: str = "general"
    priority: TicketPriority = TicketPriority.medium
    status: TicketStatus = TicketStatus.open
    conversation_id: str | None = None
    source: TicketSource = TicketSource.mongodb_demo
    external_ticket_id: str | None = None
    notes: list[dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


# ── Knowledge Base ─────────────────────────────────────────────────────────────

class KBSource(str, Enum):
    microsoft_docs = "microsoft_docs"
    internal = "internal"
    dataset = "dataset"
    manual = "manual"


class KBDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    title: str
    content: str
    category: str
    language: str = "en"
    tags: list[str] = Field(default_factory=list)
    source: KBSource = KBSource.internal
    source_url: str | None = None
    is_active: bool = True
    is_verified: bool = False  # True only for official Microsoft doc sourced entries
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


# ── Dataset Records ────────────────────────────────────────────────────────────

class DatasetRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    import_job_id: str
    content_hash: str  # SHA-256 of normalized content for dedup
    record_id: str | None = None
    record_type: str = "ticket"  # "qa" or "ticket"
    question: str
    answer: str
    category: str = "general"
    language: str = "en"
    tags: list[str] = Field(default_factory=list)
    source: str = "dataset"
    raw: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=_now)


# ── Import Jobs ────────────────────────────────────────────────────────────────

class ImportJobStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class ImportJobDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    filename: str
    file_type: str  # jsonl | json | csv
    status: ImportJobStatus = ImportJobStatus.pending
    total: int = 0
    imported: int = 0
    skipped: int = 0
    failed: int = 0
    errors: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)
    completed_at: datetime | None = None
