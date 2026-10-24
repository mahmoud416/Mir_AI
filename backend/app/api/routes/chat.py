"""
MIR Backend — Chat Routes
POST /api/v1/chat
GET  /api/v1/conversations/{conversation_id}
GET  /api/v1/conversations/{conversation_id}/messages
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.schemas.api import ChatResponse, ChatSendRequest, ConversationOut, MessageOut
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])
_service = ChatService()


@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Send a message",
    description=(
        "Send a user message to MIR. Creates a new conversation if `conversation_id` "
        "is omitted. The AI response is always generated server-side."
    ),
    responses={
        200: {
            "description": "Successful response",
            "content": {
                "application/json": {
                    "example": {
                        "conversation_id": "3f7a2c1d-...",
                        "message": {
                            "id": "9a1b2c3d-...",
                            "conversation_id": "3f7a2c1d-...",
                            "role": "assistant",
                            "content": "It looks like your password may have expired...",
                            "timestamp": "2025-01-01T10:00:00Z",
                        },
                        "suggested_actions": [],
                        "is_demo": True,
                    }
                }
            },
        }
    },
)
async def send_message(body: ChatSendRequest) -> ChatResponse:
    return await _service.send_message(body)


# Conversations sub-router (under /api/v1/conversations)
conv_router = APIRouter(prefix="/conversations", tags=["Conversations"])


@conv_router.get(
    "",
    response_model=list[ConversationOut],
    summary="List all conversations",
)
async def list_conversations() -> list[ConversationOut]:
    return await _service.list_conversations()


@conv_router.get(
    "/{conversation_id}",
    response_model=ConversationOut,
    summary="Get a conversation",
)
async def get_conversation(conversation_id: str) -> ConversationOut:
    conv = await _service.get_conversation(conversation_id)
    if conv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{conversation_id}' not found.",
        )
    return conv


@conv_router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageOut],
    summary="Get messages for a conversation",
)
async def get_messages(conversation_id: str) -> list[MessageOut]:
    conv = await _service.get_conversation(conversation_id)
    if conv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{conversation_id}' not found.",
        )
    return await _service.get_messages(conversation_id)


@conv_router.delete(
    "/{conversation_id}",
    summary="Delete a conversation and its messages",
)
async def delete_conversation(conversation_id: str) -> dict:
    deleted = await _service.delete_conversation(conversation_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{conversation_id}' not found.",
        )
    return {"status": "deleted", "id": conversation_id}
