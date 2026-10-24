"""
MIR Backend — Chat Service
Core business logic for the IT support chatbot.
"""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

from app.core.config import get_settings
from app.integrations.ai_provider import MIR_SYSTEM_PROMPT, get_ai_provider
from app.models.documents import (
    ConversationDocument,
    ConversationStatus,
    MessageDocument,
    MessageRole,
)
from app.repositories.conversation_repo import ConversationRepository
from app.repositories.knowledge_repo import KnowledgeRepository
from app.schemas.api import (
    ChatResponse,
    ChatSendRequest,
    ConversationOut,
    MessageOut,
    SuggestedAction,
    TicketCreatedInfo,
)

logger = logging.getLogger(__name__)

# Actions suggested on the first message
_INITIAL_ACTIONS: list[SuggestedAction] = [
    SuggestedAction(
        id="acc_personal",
        label="Personal Microsoft account",
        label_ar="حساب Microsoft الشخصي",
        type="account_type",
        value="personal",
    ),
    SuggestedAction(
        id="acc_work",
        label="Work or school account",
        label_ar="حساب العمل أو المدرسة",
        type="account_type",
        value="work_school",
    ),
    SuggestedAction(
        id="acc_domain",
        label="Domain / Active Directory account",
        label_ar="حساب النطاق / Active Directory",
        type="account_type",
        value="domain",
    ),
]

_ESCALATE_ACTION = SuggestedAction(
    id="escalate",
    label="Create a support ticket",
    label_ar="إنشاء تذكرة دعم",
    type="escalate",
)

# Simple keyword sets for escalation detection
_ESCALATE_KEYWORDS_EN = {"escalate", "ticket", "human", "agent", "help", "stuck", "cannot"}
_ESCALATE_KEYWORDS_AR = {"تصعيد", "تذكرة", "وكيل", "مساعدة", "عالق"}


class ChatService:

    def __init__(self) -> None:
        self._conv_repo = ConversationRepository()
        self._kb_repo = KnowledgeRepository()
        from app.repositories.ticket_repo import TicketRepository
        self._ticket_repo = TicketRepository()
        self._settings = get_settings()

    async def send_message(self, request: ChatSendRequest) -> ChatResponse:
        """
        Process a user message, retrieve relevant knowledge & dataset context,
        call the AI provider (Gemini / server-side), handle ticket escalation, and persist everything.
        """
        # 1. Resolve or create conversation
        if request.conversation_id:
            conv = await self._conv_repo.get_conversation(request.conversation_id)
            if conv is None:
                conv = await self._create_conversation(request)
        else:
            conv = await self._create_conversation(request)

        # 2. Persist user message
        user_msg = MessageDocument(
            conversation_id=conv.id,
            role=MessageRole.user,
            content=request.message,
        )
        await self._conv_repo.add_message(user_msg)

        # 3. Retrieve relevant knowledge base & dataset context
        kb_matches = await self._kb_repo.search_kb_by_keywords(request.message, limit=3)
        dataset_matches = await self._kb_repo.search_dataset_by_keywords(request.message, limit=2)

        context_sections = []
        if kb_matches:
            kb_text = "### OFFICIAL KNOWLEDGE BASE & TRUSTED DOCUMENTATION:\n"
            for kb in kb_matches:
                source_tag = f" [Official Source: {kb.source_url}]" if kb.source_url else f" [{kb.source.value}]"
                kb_text += f"- **{kb.title}**{source_tag}:\n  {kb.content}\n"
            context_sections.append(kb_text)

        if dataset_matches:
            ds_text = "### HISTORICAL HELPDESK INCIDENTS (Past reported user symptoms — NOT official Microsoft policy):\n"
            for ds in dataset_matches:
                rec_id = ds.record_id or ds.id[:8]
                ds_text += f"- Incident Case [{rec_id}] ({ds.category}): {ds.question}\n  Reported Symptoms: {ds.answer}\n"
            context_sections.append(ds_text)

        # Build system prompt with retrieved context
        system_content = MIR_SYSTEM_PROMPT
        if context_sections:
            system_content += (
                "\n\n--- RETRIEVED CONTEXT FROM HELPDESK KNOWLEDGE BASE & DATASET ---\n"
                + "\n".join(context_sections)
                + "\n\nINSTRUCTION: Use the verified knowledge base and official Microsoft docs for accurate guidance. "
                "Reference past incident cases only as context for symptoms. Do NOT invent URLs or claim passwords were reset."
            )

        # 4. Check for ticket escalation request or confirmation
        ticket_created_info: TicketCreatedInfo | None = None
        lower_msg = request.message.lower()
        wants_ticket = any(k in lower_msg for k in (
            "create ticket", "open ticket", "submit ticket", "yes create", "yes open",
            "انشئ تذكرة", "إنشاء تذكرة", "افتح تذكرة", "سوي تذكرة", "نعم انشئ", "نعم افتح"
        ))

        if wants_ticket:
            from app.models.documents import TicketDocument, TicketPriority, TicketSource, TicketStatus
            ticket_doc = TicketDocument(
                title=f"Incident: {request.message[:80]}",
                description=f"User requested escalation from chat conversation {conv.id}.\nUser Message: {request.message}",
                category=conv.category or "general",
                priority=TicketPriority.medium,
                status=TicketStatus.open,
                conversation_id=conv.id,
                source=TicketSource.mongodb_demo,
            )
            saved_ticket = await self._ticket_repo.create_ticket(ticket_doc)
            await self._conv_repo.update_conversation(conv.id, {
                "ticket_id": saved_ticket.id,
                "status": ConversationStatus.escalated,
            })
            ticket_number = f"TCKT-{saved_ticket.id[:8].upper()}"
            ticket_created_info = TicketCreatedInfo(
                ticket_number=ticket_number,
                ticketNumber=ticket_number,
                status="open",
                created_at=saved_ticket.created_at,
                createdAt=saved_ticket.created_at,
                sap_confirmed=False,
                sapConfirmed=False,
            )

        # 5. Build message history for AI
        recent = await self._conv_repo.get_recent_messages(conv.id, limit=12)
        ai_messages = [{"role": "system", "content": system_content}]
        for m in recent:
            ai_messages.append({"role": m.role.value, "content": m.content})

        # 6. Call AI provider
        ai_provider = get_ai_provider()
        try:
            reply_text = await ai_provider.chat_completion(ai_messages)
            # If ticket was just created, append confirmation
            if ticket_created_info:
                ticket_num = ticket_created_info.ticket_number
                is_ar = any("\u0600" <= c <= "\u06ff" for c in request.message)
                if is_ar:
                    reply_text += f"\n\n🎫 **تم إنشاء تذكرة دعم برقم:** `{ticket_num}`\nيمكنك متابعة التذكرة وتفاصيلها عبر لوحة تحكم التذاكر."
                else:
                    reply_text += f"\n\n🎫 **Support Ticket Created:** `{ticket_num}`\nYou can track its status in the Tickets dashboard."
        except Exception as exc:
            logger.error("AI provider error: %s", exc, exc_info=True)
            reply_text = (
                "I'm experiencing a technical issue right now. "
                "Please try again in a moment, or contact your IT helpdesk directly."
                "\n\nأواجه مشكلة تقنية الآن. يرجى المحاولة مرة أخرى لاحقاً."
            )

        # 7. Persist assistant message
        asst_msg = MessageDocument(
            conversation_id=conv.id,
            role=MessageRole.assistant,
            content=reply_text,
        )
        await self._conv_repo.add_message(asst_msg)

        # 8. Update conversation title on first turn
        if conv.message_count <= 1:
            title = request.message[:60] + ("…" if len(request.message) > 60 else "")
            await self._conv_repo.update_conversation(conv.id, {"title": title})

        # 9. Build suggested actions
        suggested = self._build_suggested_actions(
            conv.message_count,
            reply_text,
            request.message,
        )

        return ChatResponse(
            conversation_id=conv.id,
            conversationId=conv.id,
            message=MessageOut(
                id=asst_msg.id,
                conversation_id=asst_msg.conversation_id,
                conversationId=asst_msg.conversation_id,
                role=asst_msg.role,
                content=asst_msg.content,
                timestamp=asst_msg.created_at,
            ),
            suggested_actions=suggested,
            suggestedActions=suggested,
            ticket_created=ticket_created_info,
            ticketCreated=ticket_created_info,
            is_demo=ai_provider.provider_name == "demo",
            isDemo=ai_provider.provider_name == "demo",
        )

    async def get_conversation(self, conversation_id: str) -> ConversationOut | None:
        conv = await self._conv_repo.get_conversation(conversation_id)
        if conv is None:
            return None
        return self._conv_to_out(conv)

    async def get_messages(self, conversation_id: str) -> list[MessageOut]:
        msgs = await self._conv_repo.get_messages(conversation_id)
        return [
            MessageOut(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                timestamp=m.created_at,
                metadata=m.metadata,
            )
            for m in msgs
        ]

    async def list_conversations(
        self, user_id: str | None = None, limit: int = 50
    ) -> list[ConversationOut]:
        docs, _ = await self._conv_repo.list_conversations(user_id=user_id, limit=limit)
        return [self._conv_to_out(d) for d in docs]

    async def delete_conversation(self, conversation_id: str) -> bool:
        return await self._conv_repo.delete_conversation(conversation_id)

    # ── Helpers ────────────────────────────────────────────────────────────────

    async def _create_conversation(
        self, request: ChatSendRequest
    ) -> ConversationDocument:
        conv = ConversationDocument(
            id=str(uuid.uuid4()),
            title=request.message[:60],
            status=ConversationStatus.active,
        )
        return await self._conv_repo.create_conversation(conv)

    def _build_suggested_actions(
        self,
        message_count: int,
        reply: str,
        user_msg: str,
    ) -> list[SuggestedAction]:
        actions: list[SuggestedAction] = []

        # Check for locked account or password reset intent
        lower_reply = reply.lower()
        lower_user = user_msg.lower()
        is_locked_or_pwd = any(k in lower_user or k in lower_reply for k in (
            "قفل", "مغلق", "مقفل", "locked", "lockout", "password", "مرور", "باسورد", "reset", "فك القفل"
        ))
        if is_locked_or_pwd:
            actions.append(
                SuggestedAction(
                    id="action-reset-pwd",
                    label="Official Microsoft Password Reset & Unlock",
                    label_ar="إعادة تعيين كلمة المرور وفك القفل الرسمي (مايكروسوفت)",
                    labelAr="إعادة تعيين كلمة المرور وفك القفل الرسمي (مايكروسوفت)",
                    type="link",
                    url="https://account.live.com/password/reset",
                )
            )

        # On first turn, also offer account type selection
        if message_count <= 2:
            actions.extend(_INITIAL_ACTIONS)
            return actions

        # Detect escalation intent
        wants_escalation = (
            any(k in lower_reply for k in ("ticket", "escalate", "human agent"))
            or any(k in lower_user for k in _ESCALATE_KEYWORDS_EN)
            or any(k in lower_user for k in _ESCALATE_KEYWORDS_AR)
        )
        if wants_escalation:
            actions.append(_ESCALATE_ACTION)

        return actions

    @staticmethod
    def _conv_to_out(conv: ConversationDocument) -> ConversationOut:
        return ConversationOut(
            id=conv.id,
            title=conv.title,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            message_count=conv.message_count,
            status=conv.status,
            category=conv.category,
            ticket_id=conv.ticket_id,
        )
