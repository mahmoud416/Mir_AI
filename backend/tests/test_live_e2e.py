"""
E2E integration test with real MongoDB Atlas and Gemini API.
"""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_live_chat_and_ticket_flow():
    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. Health check
            health_resp = await ac.get("/health")
            assert health_resp.status_code == 200
            health_data = health_resp.json()
            assert health_data["status"] == "ok"
            assert health_data["database"] == "connected"
            assert health_data["ai_provider"] == "gemini"

            # 2. Chat with Gemini
            chat_payload = {"message": "How do I reset my Microsoft personal account password?"}
            chat_resp = await ac.post("/api/v1/chat", json=chat_payload)
            assert chat_resp.status_code == 200
            chat_data = chat_resp.json()
            assert "conversation_id" in chat_data
            assert "message" in chat_data
            reply = chat_data["message"]["content"]
            assert len(reply) > 20
            # Gemini response should refer to official reset link or steps
            print("\nGemini Live Reply:\n", reply[:200])

            # 3. Create ticket
            ticket_payload = {
                "title": "Cannot sign in to Windows workstation",
                "description": "User gets trust relationship failed error upon domain login.",
                "category": "windows",
                "priority": "high",
            }
            ticket_resp = await ac.post("/api/v1/tickets", json=ticket_payload)
            assert ticket_resp.status_code == 201
            ticket_data = ticket_resp.json()
            assert ticket_data["source"] == "mongodb_demo"
            ticket_id = ticket_data["id"]

            # 4. Get ticket
            get_ticket_resp = await ac.get(f"/api/v1/tickets/{ticket_id}")
            assert get_ticket_resp.status_code == 200
            assert get_ticket_resp.json()["id"] == ticket_id

            # 5. Dashboard stats
            dash_resp = await ac.get("/api/v1/dashboard/stats")
            assert dash_resp.status_code == 200
            dash_data = dash_resp.json()
            assert dash_data["stats"]["totalConversations"] >= 1
            assert dash_data["stats"]["openTickets"] >= 1
