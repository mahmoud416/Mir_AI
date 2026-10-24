"""
MIR Backend — Application Configuration
Loads and validates all settings from environment variables / .env file.
"""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    app_env: Literal["development", "production", "test"] = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"

    # ── CORS ─────────────────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # ── MongoDB ───────────────────────────────────────────────────────────────
    mongodb_uri: str = ""
    mongodb_database: str = "mir_db"

    # ── AI Provider ───────────────────────────────────────────────────────────
    ai_provider: Literal["openai", "gemini", "anthropic", "demo"] = "gemini"
    ai_api_key: str = ""
    gemini_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    gemini_model: str = "gemini-2.5-flash"
    anthropic_model: str = "claude-3-5-haiku-20241022"

    # ── Admin ─────────────────────────────────────────────────────────────────
    admin_token: str = "mir-admin-dev-token"

    # ── SAP (future) ──────────────────────────────────────────────────────────
    sap_base_url: str = ""
    sap_client_id: str = ""
    sap_client_secret: str = ""
    sap_system_id: str = ""

    # ── Derived helpers ───────────────────────────────────────────────────────
    @property
    def effective_ai_key(self) -> str:
        """Returns the active AI key (supports GEMINI_API_KEY or AI_API_KEY)."""
        return self.gemini_api_key or self.ai_api_key

    @property
    def is_demo_mode(self) -> bool:
        """True when in demo mode or no AI key is configured."""
        if self.ai_provider == "demo":
            return True
        return not bool(self.effective_ai_key)

    @property
    def sap_configured(self) -> bool:
        return bool(self.sap_base_url and self.sap_client_id and self.sap_client_secret)

    @property
    def mongodb_configured(self) -> bool:
        return bool(self.mongodb_uri)

    @field_validator("log_level")
    @classmethod
    def _validate_log_level(cls, v: str) -> str:
        level = v.upper()
        if level not in logging._nameToLevel:  # noqa: SLF001
            raise ValueError(f"Invalid log level: {v}")
        return level


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
