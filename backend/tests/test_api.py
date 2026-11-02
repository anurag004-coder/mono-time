import sys
import os
import uuid

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_and_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_get_products():
    response = client.get("/api/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 9
    assert any(p["id"] == "titan-edge-slate" for p in products)

def test_product_search():
    # Test RAG search for diver watches
    response = client.post("/api/products/search", json={"query": "diver 300m", "limit": 3})
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    assert any("diver" in r["title"].lower() or "diver" in r["category"].lower() for r in results)

def test_agent_chat_sizing_intent():
    response = client.post("/api/agent/chat", json={
        "session_id": "test-session",
        "message": "Will the 40mm Titan Edge fit a 6.5-inch wrist?",
        "product_id": "titan-edge-slate"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["sender"] == "agent"
    assert data["agent_type"] == "stylist"
    assert "Titan Edge" in data["text"]
    assert len(data["suggested_prompts"]) > 0

def test_agent_chat_rag_intent():
    response = client.post("/api/agent/chat", json={
        "session_id": f"test-session-{uuid.uuid4().hex[:6]}",
        "message": "Find me options for chronograph watches",
        "product_id": "titan-edge-slate"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["sender"] == "agent"
    assert data["agent_type"] == "rag"
    assert "Mono Time Search Results" in data["text"]

def test_exit_intent_observer():
    unique_session = f"test-observer-{uuid.uuid4().hex[:8]}"
    response = client.post("/api/observer/check-exit-intent", json={
        "session_id": unique_session,
        "product_id": "titan-edge-slate",
        "mouse_y": 20,
        "time_on_page_seconds": 130,
        "trigger_type": "exit_intent"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["should_trigger"] is True
    assert data["code"] == "MONOTIME10"

def test_merchant_analytics():
    response = client.get("/api/merchant/analytics")
    assert response.status_code == 200
    stats = response.json()
    assert stats["totalSessions"] > 0
    assert stats["pitchesTriggered"] > 0

def test_mock_checkout():
    intent = client.post("/api/checkout/create-intent", json={
        "amount_inr": 22499,
        "discount_code": "MONOTIME10"
    })
    assert intent.status_code == 200
    intent_data = intent.json()
    assert "clientSecret" in intent_data

    confirm = client.post("/api/checkout/confirm", json={
        "intent_id": intent_data["intentId"],
        "card_number": "4242424242424242",
        "expiry": "12/28",
        "cvc": "123",
        "customer_email": "anurag@monotime.com"
    })
    assert confirm.status_code == 200
    assert confirm.json()["status"] == "succeeded"
