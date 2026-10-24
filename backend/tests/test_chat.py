"""
MIR Backend — Chat Endpoint Tests
"""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest


@pytest.fixture(autouse=True)
def mock_chat_service():
    """Patch ChatService to avoid real DB / AI calls."""
    from app.schemas.api import ChatResponse, MessageOut
    from app.models.documents import MessageRole
    from datetime import datetime, UTC

    fake_response = ChatResponse(
        conversation_id="test-conv-id",
        message=MessageOut(
            id="test-msg-id",
            conversation_id="test-conv-id",
            role=MessageRole.assistant,
            content="Demo response from MIR.",
            timestamp=datetime.now(UTC),
        ),
        suggested_actions=[],
        is_demo=True,
    )

    with patch(
        "app.api.routes.chat._service.send_message",
        new=AsyncMock(return_value=fake_response),
    ), patch(
        "app.api.routes.chat._service.get_conversation",
        new=AsyncMock(return_value=None),
    ), patch(
        "app.api.routes.chat._service.get_messages",
        new=AsyncMock(return_value=[]),
    ):
        yield


def test_send_message_success(client):
    resp = client.post(
        "/api/v1/chat",
        json={"message": "My password is expired, how do I reset it?"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "conversation_id" in data
    assert "message" in data
    assert data["message"]["role"] == "assistant"


def test_send_message_with_conversation_id(client):
    resp = client.post(
        "/api/v1/chat",
        json={
            "conversation_id": "existing-conv",
            "message": "Still having trouble.",
            "account_type": "work_school",
        },
    )
    assert resp.status_code == 200


def test_send_message_empty_body_rejected(client):
    resp = client.post("/api/v1/chat", json={})
    assert resp.status_code == 422


def test_send_message_too_long_rejected(client):
    resp = client.post("/api/v1/chat", json={"message": "x" * 4001})
    assert resp.status_code == 422


def test_get_conversation_not_found(client):
    resp = client.get("/api/v1/conversations/nonexistent-id")
    assert resp.status_code == 404


def test_get_messages_not_found(client):
    resp = client.get("/api/v1/conversations/nonexistent-id/messages")
    assert resp.status_code == 404
