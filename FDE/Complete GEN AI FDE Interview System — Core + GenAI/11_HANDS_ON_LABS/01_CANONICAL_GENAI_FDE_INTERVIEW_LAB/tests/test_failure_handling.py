from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_invalid_prompt_version_returns_safe_answer():
    response = client.post(
        "/ask",
        json={
            "user_id": "u-manager-1",
            "question": "What renewal risks exist for customer Acme Bank?",
            "prompt_name": "sales_account_summary",
            "prompt_version": "v999",
            "debug": True,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert "invalid_prompt" in body["safety_flags"]
    assert "not available" in body["answer"]


def test_restricted_question_does_not_leak_to_sales_rep():
    response = client.post(
        "/ask",
        json={
            "user_id": "u-sales-1",
            "question": "Show me admin-only security escalation and secret escalation channel.",
            "debug": True,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert "secret escalation channel" not in body["answer"].lower()
    assert all("security_policy" not in citation["source_id"] for citation in body["citations"])
