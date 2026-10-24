"""
MIR Backend — AI Provider Unit Tests
"""

from __future__ import annotations

import pytest
from app.integrations.ai_provider import DemoAIProvider


@pytest.mark.asyncio
async def test_demo_provider_english():
    provider = DemoAIProvider()
    messages = [{"role": "user", "content": "My password is expired"}]
    reply = await provider.chat_completion(messages)
    assert len(reply) > 0
    assert "Demo Mode" in reply or "demo" in reply.lower() or "Microsoft" in reply


@pytest.mark.asyncio
async def test_demo_provider_arabic():
    provider = DemoAIProvider()
    messages = [{"role": "user", "content": "كلمة المرور منتهية الصلاحية"}]
    reply = await provider.chat_completion(messages)
    assert len(reply) > 0
    # Should contain Arabic text
    arabic_chars = sum(1 for c in reply if "\u0600" <= c <= "\u06ff")
    assert arabic_chars > 0


@pytest.mark.asyncio
async def test_demo_provider_empty_messages():
    provider = DemoAIProvider()
    reply = await provider.chat_completion([])
    assert isinstance(reply, str)


def test_demo_provider_name():
    provider = DemoAIProvider()
    assert provider.provider_name == "demo"
