import sys
import os
import time
import bcrypt
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_unauthenticated_admin_endpoints_return_401():
    """Direct API calls to /api/admin/* without a session return 401."""
    res_analytics = client.get("/api/admin/analytics")
    assert res_analytics.status_code == 401
    assert "detail" in res_analytics.json()

    res_orders = client.get("/api/admin/orders")
    assert res_orders.status_code == 401

    res_pitches = client.get("/api/admin/pitches")
    assert res_pitches.status_code == 401

    res_me = client.get("/api/admin/me")
    assert res_me.status_code == 401


def test_admin_login_failure_generic_message():
    """Failed login returns generic 'Invalid username or password.'"""
    res = client.post("/api/admin/login", json={"username": "wrong", "password": "bad"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid username or password."


def test_admin_login_success_anurag_ashu():
    """Successful login with Anurag_Ashu / ViratKohli sets admin_session cookie."""
    from app.routers.admin import failed_login_attempts
    failed_login_attempts.clear()
    res = client.post("/api/admin/login", json={"username": "Anurag_Ashu", "password": "ViratKohli"})
    assert res.status_code == 200
    assert "admin_session" in res.cookies


def test_admin_login_rate_limiting():
    """Rate limiting responds 429 after 5 failed attempts with retry delay."""
    from app.routers.admin import failed_login_attempts
    failed_login_attempts.clear()

    # Make 5 failed attempts
    for _ in range(5):
        r = client.post("/api/admin/login", json={"username": "bad", "password": "bad"})
        assert r.status_code == 401

    # 6th attempt must trigger rate limit 429
    r_blocked = client.post("/api/admin/login", json={"username": "bad", "password": "bad"})
    assert r_blocked.status_code == 429
    assert "retry" in r_blocked.json()["detail"].lower()
    assert "Retry-After" in r_blocked.headers

    failed_login_attempts.clear()


def test_chat_response_exposes_retrieved_sources():
    """Exposes source document names in chatbot response payload."""
    res = client.post(
        "/api/agent/chat",
        json={
            "message": "What is your return policy?",
            "product_id": "titan-edge-slate",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "sources" in data
    assert isinstance(data["sources"], list)
    assert len(data["sources"]) > 0
    assert any("Return" in s for s in data["sources"])
