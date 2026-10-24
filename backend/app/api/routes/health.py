"""
MIR Backend — Health Check Route
GET /health
"""

from __future__ import annotations

from fastapi import APIRouter

from app.core.config import get_settings
from app.db.database import get_db_or_none
from app.schemas.api import HealthResponse

router = APIRouter(tags=["Health"])

VERSION = "1.0.0"


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns the operational status of the API and its dependencies.",
)
async def health() -> HealthResponse:
    settings = get_settings()
    db = get_db_or_none()

    db_status = "connected" if db is not None else "disconnected"
    overall = "ok" if db_status == "connected" else "degraded"

    return HealthResponse(
        status=overall,
        version=VERSION,
        app_env=settings.app_env,
        database=db_status,
        ai_provider=settings.ai_provider,
        is_demo_mode=settings.is_demo_mode,
        sap_configured=settings.sap_configured,
    )
