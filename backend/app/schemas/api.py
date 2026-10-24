"""
MIR Backend — API Schemas (request / response bodies)
Separate from MongoDB document models.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

from app.models.documents import (
    ConversationStatus,
    MessageRole,
    TicketPriority,
    TicketSource,
    TicketStatus,
)


# ── Generic API wrappers ───────────────────────────────────────────────────────

class APIError(BaseModel):
    code: str
    message: str
    detail: Any | None = None


class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int
    page: int
    page_size: int


# ── Chat ──────────────────────────────────────────────────────────────────────

class SuggestedAction(BaseModel):
    id: str
    label: str
    label_ar: str
    labelAr: str | None = None
    type: Literal["account_type", "issue_type", "escalate", "link"]
    value: str | None = None
    url: str | None = None

    def model_post_init(self, __context: Any) -> None:
        if self.labelAr is None:
            self.labelAr = self.label_ar


class TicketCreatedInfo(BaseModel):
    ticket_number: str
    ticketNumber: str | None = None
    status: str
    created_at: datetime
    createdAt: datetime | None = None
    sap_confirmed: bool = False
    sapConfirmed: bool = False

    def model_post_init(self, __context: Any) -> None:
        if self.ticketNumber is None:
            self.ticketNumber = self.ticket_number
        if self.createdAt is None:
            self.createdAt = self.created_at
        self.sapConfirmed = self.sap_confirmed


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    conversationId: str | None = None
    role: MessageRole
    content: str
    timestamp: datetime
    status: str = "sent"
    metadata: dict[str, Any] = Field(default_factory=dict)

    def model_post_init(self, __context: Any) -> None:
        if self.conversationId is None:
            self.conversationId = self.conversation_id


class ConversationOut(BaseModel):
    id: str
    title: str
    created_at: datetime
    createdAt: datetime | None = None
    updated_at: datetime
    updatedAt: datetime | None = None
    message_count: int
    messageCount: int | None = None
    status: ConversationStatus
    category: str | None = None
    ticket_id: str | None = None
    ticketId: str | None = None

    def model_post_init(self, __context: Any) -> None:
        if self.createdAt is None:
            self.createdAt = self.created_at
        if self.updatedAt is None:
            self.updatedAt = self.updated_at
        if self.messageCount is None:
            self.messageCount = self.message_count
        if self.ticketId is None:
            self.ticketId = self.ticket_id


class ChatSendRequest(BaseModel):
    conversation_id: str | None = None
    conversationId: str | None = None
    message: str = Field(..., min_length=1, max_length=4000)
    account_type: Literal["personal", "work_school", "domain"] | None = None
    accountType: Literal["personal", "work_school", "domain"] | None = None

    def model_post_init(self, __context: Any) -> None:
        if not self.conversation_id and self.conversationId:
            self.conversation_id = self.conversationId
        if not self.account_type and self.accountType:
            self.account_type = self.accountType

    @field_validator("message")
    @classmethod
    def _strip_message(cls, v: str) -> str:
        return v.strip()


class ChatResponse(BaseModel):
    conversation_id: str
    conversationId: str | None = None
    message: MessageOut
    suggested_actions: list[SuggestedAction] = Field(default_factory=list)
    suggestedActions: list[SuggestedAction] = Field(default_factory=list)
    ticket_created: TicketCreatedInfo | None = None
    ticketCreated: TicketCreatedInfo | None = None
    is_demo: bool = False
    isDemo: bool = False

    def model_post_init(self, __context: Any) -> None:
        if self.conversationId is None:
            self.conversationId = self.conversation_id
        if not self.suggestedActions and self.suggested_actions:
            self.suggestedActions = self.suggested_actions
        if self.ticketCreated is None:
            self.ticketCreated = self.ticket_created
        self.isDemo = self.is_demo


# ── Tickets ────────────────────────────────────────────────────────────────────

class TicketCreateRequest(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    subject: str | None = Field(default=None, max_length=200)
    description: str = Field(..., min_length=10, max_length=5000)
    category: str = "general"
    priority: TicketPriority = TicketPriority.medium
    conversation_id: str | None = None
    conversationId: str | None = None
    user_id: str | None = None
    userId: str | None = None

    def model_post_init(self, __context: Any) -> None:
        t = self.title or self.subject
        if not t or len(t.strip()) < 3:
            raise ValueError("title or subject must be at least 3 characters.")
        self.title = t.strip()
        self.subject = t.strip()
        if not self.conversation_id and self.conversationId:
            self.conversation_id = self.conversationId
        if not self.user_id and self.userId:
            self.user_id = self.userId


class TicketUpdateRequest(BaseModel):
    status: TicketStatus | None = None
    priority: TicketPriority | None = None
    note: str | None = None


class TicketOut(BaseModel):
    id: str
    user_id: str | None = None
    title: str
    description: str
    category: str
    priority: TicketPriority
    status: TicketStatus
    conversation_id: str | None = None
    source: TicketSource
    external_ticket_id: str | None = None
    created_at: datetime
    updated_at: datetime

    # Frontend compatibility fields
    ticket_number: str | None = None
    ticketNumber: str | None = None
    subject: str | None = None
    subjectAr: str | None = None
    createdAt: datetime | None = None
    updatedAt: datetime | None = None
    sapConfirmed: bool = False
    customerReference: str | None = None
    assignedAgent: str | None = None

    def model_post_init(self, __context: Any) -> None:
        num = self.ticket_number or f"TCKT-{self.id[:8].upper()}"
        self.ticket_number = num
        self.ticketNumber = num
        self.subject = self.title
        self.createdAt = self.created_at
        self.updatedAt = self.updated_at
        self.sapConfirmed = (self.source == TicketSource.sap)


class TicketListResponse(BaseModel):
    items: list[TicketOut]
    tickets: list[TicketOut] = Field(default_factory=list)
    total: int
    page: int
    page_size: int
    limit: int = 20

    def model_post_init(self, __context: Any) -> None:
        if not self.tickets and self.items:
            self.tickets = self.items
        self.limit = self.page_size


# ── Knowledge Base ─────────────────────────────────────────────────────────────

class KBRecordOut(BaseModel):
    id: str
    title: str
    content: str
    category: str
    language: str
    tags: list[str] = Field(default_factory=list)
    source: str
    source_url: str | None = None
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime

    # Frontend compatibility fields
    titleAr: str | None = None
    summary: str | None = None
    summaryAr: str | None = None
    contentAr: str | None = None
    accountTypes: list[str] = Field(default_factory=lambda: ["personal", "work_school", "domain"])
    sourceUrl: str | None = None
    isOfficial: bool = False
    createdAt: datetime | None = None
    updatedAt: datetime | None = None
    views: int = 0

    def model_post_init(self, __context: Any) -> None:
        if not self.titleAr:
            self.titleAr = self.title
        if not self.summary:
            self.summary = self.content[:140] + ("…" if len(self.content) > 140 else "")
        if not self.summaryAr:
            self.summaryAr = self.summary
        if not self.sourceUrl:
            self.sourceUrl = self.source_url
        self.isOfficial = self.is_verified
        self.createdAt = self.created_at
        self.updatedAt = self.updated_at


class KBListResponse(BaseModel):
    items: list[KBRecordOut]
    articles: list[KBRecordOut] = Field(default_factory=list)
    total: int

    def model_post_init(self, __context: Any) -> None:
        if not self.articles and self.items:
            self.articles = self.items


# ── Dashboard Stats ───────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    totalConversations: int = 0
    openTickets: int = 0
    unresolvedConversations: int = 0
    escalatedCases: int = 0
    resolutionRate: int = 0
    escalationRate: int = 0
    avgResponseTime: int = 2


class RecentConversation(BaseModel):
    id: str
    title: str
    status: str
    createdAt: datetime
    category: str | None = None


class RecentTicket(BaseModel):
    id: str
    ticketNumber: str
    subject: str
    subjectAr: str | None = None
    status: str
    priority: str
    createdAt: datetime
    assignedAgent: str | None = None


class DashboardData(BaseModel):
    stats: DashboardStats
    recentConversations: list[RecentConversation] = Field(default_factory=list)
    recentTickets: list[RecentTicket] = Field(default_factory=list)


# ── Dataset Import ─────────────────────────────────────────────────────────────

class ImportJobOut(BaseModel):
    id: str
    filename: str
    file_type: str
    status: str
    total: int
    imported: int
    skipped: int
    failed: int
    errors: list[str]
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None


# ── Health ─────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: Literal["ok", "degraded", "error"]
    version: str
    app_env: str
    database: Literal["connected", "disconnected"]
    ai_provider: str
    is_demo_mode: bool
    sap_configured: bool
