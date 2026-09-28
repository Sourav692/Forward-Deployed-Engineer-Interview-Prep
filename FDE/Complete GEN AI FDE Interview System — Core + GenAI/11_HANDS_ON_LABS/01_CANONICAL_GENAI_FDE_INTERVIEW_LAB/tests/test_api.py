from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_manager_can_get_renewal_risk_answer():
    response = client.post(
        "/ask",
        json={
            "user_id": "u-manager-1",
            "question": "What renewal risks exist for customer Acme Bank?",
            "debug": True,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["intent"] == "sales_account_summary"
    assert body["citations"]
    assert "Acme Bank" in body["answer"]
    assert "request_received" in body["decision_trace"]


def test_unknown_user_returns_400():
    response = client.post(
        "/ask",
        json={"user_id": "missing", "question": "What is the refund policy?"},
    )
    assert response.status_code == 400
