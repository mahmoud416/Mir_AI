"""
MIR Backend — Dashboard Routes Unit Tests
"""

from __future__ import annotations


def test_dashboard_stats_endpoint(client):
    resp = client.get("/api/v1/dashboard/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "stats" in data
    assert "recentConversations" in data
    assert "recentTickets" in data
    stats = data["stats"]
    assert "totalConversations" in stats
    assert "openTickets" in stats
    assert "resolutionRate" in stats
    assert "escalationRate" in stats
