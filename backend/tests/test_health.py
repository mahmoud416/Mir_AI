"""
MIR Backend — Health Endpoint Tests
"""

from __future__ import annotations


def test_health_returns_200(client):
    resp = client.get("/health")
    assert resp.status_code == 200


def test_health_schema(client):
    resp = client.get("/health")
    data = resp.json()
    assert "status" in data
    assert "version" in data
    assert "database" in data
    assert "ai_provider" in data
    assert "is_demo_mode" in data
    assert "sap_configured" in data


def test_health_status_values(client):
    resp = client.get("/health")
    data = resp.json()
    assert data["status"] in ("ok", "degraded", "error")
    assert data["database"] in ("connected", "disconnected")
