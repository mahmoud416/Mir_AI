"""
MIR Backend — MongoDB Database Layer
Async connection management using Motor (asyncio-compatible pymongo driver).
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, IndexModel, TEXT

from app.core.config import get_settings

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


# ── Connection lifecycle ───────────────────────────────────────────────────────

async def connect_db() -> None:
    """Open the Motor client and verify the connection."""
    global _client, _db  # noqa: PLW0603
    settings = get_settings()

    if not settings.mongodb_configured:
        logger.warning(
            "MONGODB_URI is not set — running without a database. "
            "All DB operations will be unavailable."
        )
        return

    try:
        _client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
        _db = _client[settings.mongodb_database]
        # Verify connection
        await _client.admin.command("ping")
        logger.info("MongoDB connected — database: %s", settings.mongodb_database)
        await _ensure_indexes()
    except Exception as exc:
        logger.error("MongoDB connection failed: %s", exc)
        _client = None
        _db = None
        raise


async def disconnect_db() -> None:
    """Close the Motor client."""
    global _client, _db  # noqa: PLW0603
    if _client:
        _client.close()
        _client = None
        _db = None
        logger.info("MongoDB disconnected.")


def get_db() -> AsyncIOMotorDatabase:
    """Return the active database handle (raises if not connected)."""
    if _db is None:
        raise RuntimeError(
            "Database is not connected. "
            "Ensure MONGODB_URI is set and the app started successfully."
        )
    return _db


def get_db_or_none() -> AsyncIOMotorDatabase | None:
    """Return the active database handle or None (used by health checks)."""
    return _db


# ── Index definitions ─────────────────────────────────────────────────────────

async def _ensure_indexes() -> None:
    """Create all collection indexes idempotently."""
    db = get_db()

    # conversations
    await db.conversations.create_indexes([
        IndexModel([("user_id", ASCENDING)]),
        IndexModel([("status", ASCENDING)]),
        IndexModel([("created_at", DESCENDING)]),
    ])

    # messages
    await db.messages.create_indexes([
        IndexModel([("conversation_id", ASCENDING)]),
        IndexModel([("conversation_id", ASCENDING), ("created_at", ASCENDING)]),
    ])

    # tickets
    await db.tickets.create_indexes([
        IndexModel([("status", ASCENDING)]),
        IndexModel([("user_id", ASCENDING)]),
        IndexModel([("conversation_id", ASCENDING)]),
        IndexModel([("created_at", DESCENDING)]),
        IndexModel([("external_ticket_id", ASCENDING)], sparse=True),
    ])

    # knowledge_base
    await db.knowledge_base.create_indexes([
        IndexModel([("category", ASCENDING)]),
        IndexModel([("language", ASCENDING)]),
        IndexModel([("title", TEXT), ("content", TEXT)]),
        IndexModel([("is_active", ASCENDING)]),
    ])

    # dataset_records
    await db.dataset_records.create_indexes([
        IndexModel([("content_hash", ASCENDING)], unique=True),
        IndexModel([("category", ASCENDING)]),
        IndexModel([("language", ASCENDING)]),
        IndexModel([("import_job_id", ASCENDING)]),
    ])

    # import_jobs
    await db.import_jobs.create_indexes([
        IndexModel([("status", ASCENDING)]),
        IndexModel([("created_at", DESCENDING)]),
    ])

    logger.info("MongoDB indexes ensured.")
