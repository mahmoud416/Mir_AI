"""
MIR Backend — Security Utilities
Admin token authentication and future JWT infrastructure.
"""

from __future__ import annotations

from fastapi import Header, HTTPException, status

from app.core.config import get_settings


async def require_admin(x_admin_token: str = Header(alias="X-Admin-Token")) -> None:
    """
    Dependency that validates the X-Admin-Token header for admin-only endpoints
    (e.g., knowledge base import).

    Usage:
        @router.post("/admin/endpoint", dependencies=[Depends(require_admin)])
    """
    settings = get_settings()
    if not x_admin_token or x_admin_token != settings.admin_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin token.",
        )
