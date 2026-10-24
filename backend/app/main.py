"""
MIR Backend — FastAPI Application Entry Point
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.database import connect_db, disconnect_db

# ── Configure logging before anything else ────────────────────────────────────
configure_logging()
logger = logging.getLogger(__name__)

# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    settings = get_settings()
    logger.info("MIR backend starting — env=%s ai_provider=%s", settings.app_env, settings.ai_provider)

    # Connect to MongoDB (non-fatal if not configured)
    try:
        await connect_db()
        from app.db.seed_kb import seed_knowledge_base_if_empty
        await seed_knowledge_base_if_empty()
    except Exception as exc:
        logger.warning("MongoDB startup / seed failed: %s — running in no-db mode.", exc)

    yield

    await disconnect_db()
    logger.info("MIR backend shut down.")


# ── FastAPI app ────────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="MIR — IT Support Assistant API",
        description=(
            "AI-powered IT helpdesk backend for Microsoft account, Windows, "
            "Active Directory, and MFA troubleshooting.\n\n"
            "**Demo mode** is active when `AI_PROVIDER=demo` or `AI_API_KEY` is not set.\n\n"
            "**SAP integration** is not active in this prototype — tickets are saved in MongoDB."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Global error handlers ─────────────────────────────────────────────────

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:
        logger.error("Unhandled exception: %s %s — %s", request.method, request.url.path, exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred."},
        )

    # ── Routers ───────────────────────────────────────────────────────────────
    from app.api.routes.chat import conv_router, router as chat_router
    from app.api.routes.dashboard import router as dashboard_router
    from app.api.routes.health import router as health_router
    from app.api.routes.knowledge import router as knowledge_router
    from app.api.routes.tickets import router as ticket_router

    API_PREFIX = "/api/v1"

    app.include_router(health_router)                            # GET /health
    app.include_router(chat_router, prefix=API_PREFIX)          # POST /api/v1/chat
    app.include_router(conv_router, prefix=API_PREFIX)          # GET  /api/v1/conversations/...
    app.include_router(ticket_router, prefix=API_PREFIX)        # /api/v1/tickets
    app.include_router(knowledge_router, prefix=API_PREFIX)     # /api/v1/knowledge
    app.include_router(dashboard_router, prefix=API_PREFIX)     # /api/v1/dashboard

    logger.info("Routes registered. Docs: http://localhost:%d/docs", settings.app_port)
    return app


app = create_app()
