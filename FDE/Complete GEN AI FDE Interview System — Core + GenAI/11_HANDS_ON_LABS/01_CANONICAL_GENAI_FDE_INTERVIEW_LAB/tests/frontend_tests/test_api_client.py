"""Tests for frontend/streamlit/api_client.py."""

from __future__ import annotations

import requests
import pytest


from frontend.streamlit import api_client


class FakeResponse:
    """Minimal requests.Response substitute used by the unit tests."""

    def __init__(self, status_code: int, payload=None, json_error: Exception | None = None):
        self.status_code = status_code
        self._payload = payload
        self._json_error = json_error
        self.text = "" if payload is None else str(payload)

    def json(self):
        if self._json_error is not None:
            raise self._json_error
        return self._payload

    def raise_for_status(self):
        if self.status_code >= 400:
            raise requests.HTTPError(f"HTTP {self.status_code}", response=self)


class TestApiClient:
    def test_valid_backend_response(self, monkeypatch):
        payload = {
            "answer": "The release is ready.",
            "evidence": [
                {"title": "Readiness report", "source": "report.md", "snippet": "82/100"}
            ],
            "status": "ok",
            "latency_ms": 142,
        }

        monkeypatch.setattr(
            api_client.requests,
            "post",
            lambda *args, **kwargs: FakeResponse(200, payload),
        )

        result = api_client.ask_question(
            question="Is the release ready?",
            tenant_id="tenant-a",
            user_id="user-1",
        )

        assert result["answer"] == "The release is ready."
        assert result["status"] == "ok"
        assert result["evidence"][0]["source"] == "report.md"
        assert result["latency_ms"] == 142

    def test_backend_timeout(self, monkeypatch):
        def raise_timeout(*args, **kwargs):
            raise requests.Timeout("Backend did not respond in time")

        monkeypatch.setattr(api_client.requests, "post", raise_timeout)

        result = api_client.ask_question(
            question="What happened?",
            tenant_id="tenant-a",
            user_id="user-1",
        )

        assert result["status"] == "error"
        assert result["error_code"] == "backend_timeout"
        assert "time" in result["message"].lower()

    def test_permission_denied_response(self, monkeypatch):
        payload = {
            "status": "denied",
            "error_code": "permission_denied",
            "message": "You do not have permission to access this tenant.",
        }

        monkeypatch.setattr(
            api_client.requests,
            "post",
            lambda *args, **kwargs: FakeResponse(403, payload),
        )

        result = api_client.ask_question(
            question="Show confidential documents",
            tenant_id="tenant-b",
            user_id="user-1",
        )

        assert result["status"] == "denied"
        assert result["error_code"] == "permission_denied"
        assert "permission" in result["message"].lower()

    def test_unsafe_request_response(self, monkeypatch):
        payload = {
            "status": "blocked",
            "error_code": "unsafe_request",
            "message": "The request was blocked by the safety policy.",
        }

        monkeypatch.setattr(
            api_client.requests,
            "post",
            lambda *args, **kwargs: FakeResponse(422, payload),
        )

        result = api_client.ask_question(
            question="Perform an unsafe action",
            tenant_id="tenant-a",
            user_id="user-1",
        )

        assert result["status"] == "blocked"
        assert result["error_code"] == "unsafe_request"
        assert "blocked" in result["message"].lower()

    def test_malformed_backend_response(self, monkeypatch):
        monkeypatch.setattr(
            api_client.requests,
            "post",
            lambda *args, **kwargs: FakeResponse(
                200,
                json_error=ValueError("Invalid JSON"),
            ),
        )

        result = api_client.ask_question(
            question="Return malformed data",
            tenant_id="tenant-a",
            user_id="user-1",
        )

        assert result["status"] == "error"
        assert result["error_code"] == "malformed_backend_response"
        assert "invalid" in result["message"].lower() or "malformed" in result["message"].lower()