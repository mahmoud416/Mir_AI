"""
MIR Backend — AI Provider Integration
Abstracts OpenAI, Gemini, Anthropic, and demo mode behind one interface.
Server-side only — the API key is never sent to the frontend.
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import Any

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# ── System prompt ──────────────────────────────────────────────────────────────

MIR_SYSTEM_PROMPT = """You are MIR, a friendly and helpful IT Support Assistant for Microsoft accounts and Windows.

AUDIENCE & USER PROFILE:
- The person chatting with you is an ORDINARY END-USER (employee, student, or personal user), NOT a sysadmin or IT administrator.
- NEVER instruct the user to log in with local administrator credentials (e.g. `.\\Administrator`), and NEVER tell them to open PowerShell as Admin or run complex admin repair commands (such as `Test-ComputerSecureChannel`, registry edits, or diskpart).
- Provide ONLY safe, simple, user-friendly steps that an everyday user can easily do without admin rights:
  * Restart the computer.
  * Check the network cable (Ethernet) or Wi-Fi connection.
  * Click "Sign-in options" on the Windows lock screen to switch from PIN/fingerprint to Password.
  * Check keyboard language and Caps Lock.
  * Check for pending Windows Updates via Settings.
- If an issue requires Administrator permissions or IT domain rejoin (such as "Trust relationship between this workstation and primary domain failed", BitLocker recovery keys, or group policy re-enrollment), explicitly inform the user that this requires IT Helpdesk intervention, and OFFER TO CREATE A SUPPORT TICKET for them.

LANGUAGE:
- Respond in the same language the user writes in (Arabic or English).
- For Arabic users, use clear, friendly Modern Standard Arabic (فصحى) or natural Egyptian/Levantine Arabic when the user uses it.
- If unsure, default to Arabic if Arabic characters are present, else English.

RESPONSE STYLE:
- Keep answers clear, supportive, concise, and structured.
- Use simple bullet points or numbered steps.
- Do not overwhelm the user with unnecessary server/admin technical jargon.

STRICT RULES — NEVER VIOLATE:
1. NEVER claim you have reset a password, unlocked an account, or changed a setting unless a verified integration actually performed that action.
2. NEVER fabricate Microsoft documentation or invent URLs.
3. NEVER expose credentials, tokens, or sensitive information.
4. If an issue requires IT Administrator rights or cannot be solved with basic user steps, offer to create a support ticket.
5. Do NOT answer questions outside IT support scope.
6. You are a prototype assistant — be transparent and helpful.

TICKET ESCALATION:
- If you recommend creating a ticket, ask: "هل تود أن أنشئ لك تذكرة دعم فني ليتابع معك مسؤول الدعم الفني (IT Helpdesk)؟"
- Wait for user confirmation before creating the ticket.
"""


# ── Abstract base ──────────────────────────────────────────────────────────────

class AIProvider(ABC):
    """Base interface for all AI provider implementations."""

    @abstractmethod
    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> str:
        """Return the assistant's reply as a plain string."""
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        ...


# ── Demo provider ──────────────────────────────────────────────────────────────

class DemoAIProvider(AIProvider):
    """
    Deterministic demo responses — used when no real API key is configured.
    Never fabricates successful actions.
    """

    provider_name = "demo"

    _DEMO_RESPONSES_EN = [
        (
            "Thank you for reaching out to MIR IT Support! 🤖\n\n"
            "**Demo Mode Active** — I'm running without a real AI connection right now.\n\n"
            "To get full AI-powered responses, please configure `AI_PROVIDER` and `AI_API_KEY` in the backend `.env` file.\n\n"
            "For now, here are common steps for Microsoft account issues:\n\n"
            "1. Visit **https://account.live.com/password/reset** to reset a Microsoft personal account password.\n"
            "2. For work/school accounts, contact your IT administrator or use **https://aka.ms/sspr** (Self-Service Password Reset).\n"
            "3. For MFA issues, use a backup code or contact your organization's IT helpdesk.\n\n"
            "Can you describe your specific issue in more detail?"
        ),
    ]

    _DEMO_RESPONSES_AR = [
        (
            "مرحباً! أنا MIR، مساعد دعم تقنية المعلومات. 🤖\n\n"
            "**وضع التجريبي نشط** — أعمل حالياً بدون اتصال ذكاء اصطناعي حقيقي.\n\n"
            "إليك الخطوات الشائعة لمشاكل حساب Microsoft:\n\n"
            "1. لإعادة تعيين كلمة مرور الحساب الشخصي: **https://account.live.com/password/reset**\n"
            "2. لحسابات العمل أو المدرسة: تواصل مع مسؤول تقنية المعلومات أو استخدم **https://aka.ms/sspr**\n"
            "3. لمشاكل المصادقة متعددة العوامل (MFA): استخدم رمز النسخ الاحتياطي أو تواصل مع الدعم التقني\n\n"
            "هل يمكنك وصف مشكلتك بمزيد من التفاصيل؟"
        ),
    ]

    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> str:
        last_user = next(
            (m["content"] for m in reversed(messages) if m["role"] == "user"), ""
        )
        # Basic Arabic detection
        arabic_chars = sum(1 for c in last_user if "\u0600" <= c <= "\u06ff")
        if arabic_chars > len(last_user) * 0.15:
            return self._DEMO_RESPONSES_AR[0]
        return self._DEMO_RESPONSES_EN[0]


# ── OpenAI ─────────────────────────────────────────────────────────────────────

class OpenAIProvider(AIProvider):
    provider_name = "openai"

    def __init__(self) -> None:
        try:
            from openai import AsyncOpenAI  # type: ignore[import-untyped]
            settings = get_settings()
            self._client = AsyncOpenAI(api_key=settings.ai_api_key)
            self._model = settings.openai_model
        except ImportError as exc:
            raise RuntimeError("openai package not installed.") from exc

    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> str:
        response = await self._client.chat.completions.create(
            model=self._model,
            messages=messages,  # type: ignore[arg-type]
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""


# ── Gemini ─────────────────────────────────────────────────────────────────────

class GeminiProvider(AIProvider):
    provider_name = "gemini"

    def __init__(self) -> None:
        try:
            from google import genai
            settings = get_settings()
            api_key = settings.effective_ai_key
            if not api_key:
                raise ValueError("No Gemini API key configured.")
            self._client = genai.Client(api_key=api_key)
            self._model = settings.gemini_model
        except ImportError as exc:
            raise RuntimeError("google-genai package not installed.") from exc

    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> str:
        from google.genai import types

        system_msg = next((m["content"] for m in messages if m["role"] == "system"), None)
        chat_contents: list[types.Content] = []

        for m in messages:
            if m["role"] == "system":
                continue
            role = "user" if m["role"] == "user" else "model"
            content_text = m.get("content", "").strip()
            if content_text:
                chat_contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=content_text)],
                    )
                )

        if not chat_contents:
            return ""

        effective_max_tokens = max(max_tokens, 4096)
        config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=effective_max_tokens,
            system_instruction=system_msg,
        )

        candidate_models = list(dict.fromkeys([self._model, "gemini-3.5-flash", "gemini-3.5-flash-lite"]))
        last_exc: Exception | None = None

        for model_name in candidate_models:
            try:
                response = await self._client.aio.models.generate_content(
                    model=model_name,
                    contents=chat_contents,
                    config=config,
                )
                return response.text or ""
            except Exception as exc:
                last_exc = exc
                logger.warning("Gemini model %s failed: %s. Trying candidate model...", model_name, exc)

        if last_exc:
            raise last_exc
        return ""


# ── Anthropic ─────────────────────────────────────────────────────────────────

class AnthropicProvider(AIProvider):
    provider_name = "anthropic"

    def __init__(self) -> None:
        try:
            import anthropic  # type: ignore[import-untyped]
            settings = get_settings()
            self._client = anthropic.AsyncAnthropic(api_key=settings.ai_api_key)
            self._model = settings.anthropic_model
        except ImportError as exc:
            raise RuntimeError("anthropic package not installed.") from exc

    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> str:
        system_msg = next((m["content"] for m in messages if m["role"] == "system"), "")
        user_msgs = [m for m in messages if m["role"] != "system"]

        response = await self._client.messages.create(
            model=self._model,
            system=system_msg,
            messages=user_msgs,  # type: ignore[arg-type]
            temperature=temperature,
            max_tokens=max_tokens,
        )
        block = response.content[0]
        return block.text if hasattr(block, "text") else ""


# ── Factory ────────────────────────────────────────────────────────────────────

_provider_instance: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    """Return the configured AI provider singleton."""
    global _provider_instance  # noqa: PLW0603
    if _provider_instance is not None:
        return _provider_instance

    settings = get_settings()

    if settings.is_demo_mode:
        logger.info("AI provider: demo mode (no API key configured)")
        _provider_instance = DemoAIProvider()
        return _provider_instance

    try:
        match settings.ai_provider:
            case "openai":
                _provider_instance = OpenAIProvider()
            case "gemini":
                _provider_instance = GeminiProvider()
            case "anthropic":
                _provider_instance = AnthropicProvider()
            case _:
                _provider_instance = DemoAIProvider()
        logger.info("AI provider: %s", settings.ai_provider)
    except Exception as exc:
        logger.warning("AI provider init failed (%s) — falling back to demo.", exc)
        _provider_instance = DemoAIProvider()

    return _provider_instance
