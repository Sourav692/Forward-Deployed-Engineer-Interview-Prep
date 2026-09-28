"""Tests for frontend/streamlit/components.py."""

from __future__ import annotations

from frontend.streamlit import components



class RecordingUi:
    """Small Streamlit-compatible recorder for rendering tests."""

    def __init__(self):
        self.calls: list[tuple[str, object]] = []

    def success(self, value):
        self.calls.append(("success", value))

    def warning(self, value):
        self.calls.append(("warning", value))

    def error(self, value):
        self.calls.append(("error", value))

    def info(self, value):
        self.calls.append(("info", value))

    def markdown(self, value, **kwargs):
        self.calls.append(("markdown", value))

    def write(self, value):
        self.calls.append(("write", value))

    def caption(self, value):
        self.calls.append(("caption", value))

    def expander(self, label, **kwargs):
        self.calls.append(("expander", label))
        return self

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class TestResponseRendering:
    def test_valid_backend_response_is_rendered(self, monkeypatch):
        ui = RecordingUi()
        monkeypatch.setattr(components, "st", ui)

        response = {
            "status": "ok",
            "answer": "The canonical lab passed all tests.",
            "evidence": [
                {
                    "title": "Test report",
                    "source": "pytest-output.txt",
                    "snippet": "20 passed",
                }
            ],
            "latency_ms": 95,
        }

        components.render_response(response)

        rendered = " ".join(str(value) for _, value in ui.calls)
        assert "canonical lab passed" in rendered.lower()
        assert "pytest-output.txt" in rendered
        assert "20 passed" in rendered
        assert "95" in rendered

    def test_permission_denied_response_is_rendered_as_error(self, monkeypatch):
        ui = RecordingUi()
        monkeypatch.setattr(components, "st", ui)

        components.render_response(
            {
                "status": "denied",
                "error_code": "permission_denied",
                "message": "You do not have permission to access this tenant.",
            }
        )

        assert any(
            call_type == "error" and "permission" in str(value).lower()
            for call_type, value in ui.calls
        )

    def test_unsafe_request_response_is_rendered_as_warning(self, monkeypatch):
        ui = RecordingUi()
        monkeypatch.setattr(components, "st", ui)

        components.render_response(
            {
                "status": "blocked",
                "error_code": "unsafe_request",
                "message": "This request was blocked by the safety policy.",
            }
        )

        assert any(
            call_type in {"warning", "error"} and "blocked" in str(value).lower()
            for call_type, value in ui.calls
        )

    def test_missing_evidence_is_handled_gracefully(self, monkeypatch):
        ui = RecordingUi()
        monkeypatch.setattr(components, "st", ui)

        components.render_response(
            {
                "status": "ok",
                "answer": "An answer exists, but no evidence was returned.",
                "evidence": [],
            }
        )

        rendered = " ".join(str(value) for _, value in ui.calls).lower()
        assert "answer exists" in rendered
        assert "no evidence" in rendered or "evidence unavailable" in rendered

    def test_malformed_backend_response_is_rendered_as_error(self, monkeypatch):
        ui = RecordingUi()
        monkeypatch.setattr(components, "st", ui)

        components.render_response(
            {
                "status": "error",
                "error_code": "malformed_backend_response",
                "message": "The backend returned malformed data.",
            }
        )

        assert any(
            call_type == "error" and "malformed" in str(value).lower()
            for call_type, value in ui.calls
        )