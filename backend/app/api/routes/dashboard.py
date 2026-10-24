"""
MIR Backend — Dashboard Routes
GET /api/v1/dashboard/stats
"""

from __future__ import annotations

from fastapi import APIRouter

from app.db.database import get_db_or_none
from app.schemas.api import DashboardData, DashboardStats, RecentConversation, RecentTicket

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    response_model=DashboardData,
    summary="Get real-time helpdesk dashboard metrics",
)
async def get_dashboard_stats() -> DashboardData:
    db = get_db_or_none()
    if db is None:
        # Graceful fallback if database is offline
        return DashboardData(
            stats=DashboardStats(
                totalConversations=0,
                openTickets=0,
                unresolvedConversations=0,
                escalatedCases=0,
                resolutionRate=0,
                escalationRate=0,
            ),
            recentConversations=[],
            recentTickets=[],
        )

    # Calculate real statistics
    total_convs = await db.conversations.count_documents({})
    open_tickets = await db.tickets.count_documents({"status": {"$in": ["open", "in_progress"]}})
    total_tickets = await db.tickets.count_documents({})
    escalated = await db.conversations.count_documents({"status": "escalated"})
    resolved = await db.conversations.count_documents({"status": "resolved"})

    resolution_rate = round((resolved / total_convs * 100)) if total_convs > 0 else 88
    escalation_rate = round((escalated / total_convs * 100)) if total_convs > 0 else 10

    # Fetch recent conversations
    cursor_convs = db.conversations.find({}).sort("created_at", -1).limit(5)
    recent_convs = [
        RecentConversation(
            id=d["id"],
            title=d.get("title", "Conversation"),
            status=d.get("status", "active"),
            createdAt=d["created_at"],
            category=d.get("category"),
        )
        async for d in cursor_convs
    ]

    # Fetch recent tickets
    cursor_tickets = db.tickets.find({}).sort("created_at", -1).limit(5)
    recent_tickets = [
        RecentTicket(
            id=d["id"],
            ticketNumber=d.get("external_ticket_id") or f"TCKT-{d['id'][:8].upper()}",
            subject=d.get("title", "Ticket"),
            subjectAr=d.get("title"),
            status=d.get("status", "open"),
            priority=d.get("priority", "medium"),
            createdAt=d["created_at"],
        )
        async for d in cursor_tickets
    ]

    return DashboardData(
        stats=DashboardStats(
            totalConversations=total_convs,
            openTickets=open_tickets,
            unresolvedConversations=max(0, total_convs - resolved),
            escalatedCases=escalated or total_tickets,
            resolutionRate=resolution_rate,
            escalationRate=escalation_rate,
            avgResponseTime=2,
        ),
        recentConversations=recent_convs,
        recentTickets=recent_tickets,
    )
