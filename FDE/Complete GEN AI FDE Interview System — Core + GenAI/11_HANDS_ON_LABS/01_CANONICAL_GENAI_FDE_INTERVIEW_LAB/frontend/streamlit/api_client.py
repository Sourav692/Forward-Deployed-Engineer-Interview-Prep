"""HTTP client for the canonical GenAI FDE Interview Lab backend.

This module is designed for the Streamlit frontend located at:

    frontend/streamlit/api_client.py

The backend exposes these endpoints:

    GET  /health
    POST /ask
    GET  /metrics
    GET  /prompts/{name}/{version}

Environment variables:

    BACKEND_API_URL            Default: http://localhost:8000
    REQUEST_TIMEOUT_SECONDS    Default: 30

The client deliberately keeps HTTP concerns outside the Streamlit UI so that
frontend rendering, error handling, and API integration can be tested
independently.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Mapping
from urllib.parse import quote

import requests
from requests import Response, Session
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

DEFAULT_BACKEND_API_URL = "http://localhost:8000"
DEFAULT_TIMEOUT_SECONDS = 30.0


class ApiClientError(RuntimeError):
    """Base exception for all API-client failures."""


class ApiConnectionError(ApiClientError):
    """Raised when the backend cannot be reached."""


class ApiTimeoutError(ApiClientError):
    """Raised when the backend does not answer before the configured timeout."""


class ApiResponseError(ApiClientError):
    """Raised when the backend returns an unsuccessful HTTP response."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int,
        detail: str | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.detail = detail


class ApiProtocolError(ApiClientError):
    """Raised when a successful response is malformed or incomplete."""


@dataclass(frozen=True, slots=True)
class Citation:
    """Source evidence returned by the canonical backend."""

    source_id: str
    title: str
    allowed_roles: tuple[str, ...]

    @classmethod
    def from_dict(cls, value: Mapping[str, Any]) -> "Citation":
        source_id = value.get("source_id")
        title = value.get("title")
        allowed_roles = value.get("allowed_roles", [])

        if not isinstance(source_id, str) or not source_id.strip():
            raise ApiProtocolError("A citation is missing a valid 'source_id'.")
        if not isinstance(title, str) or not title.strip():
            raise ApiProtocolError("A citation is missing a valid 'title'.")
        if not isinstance(allowed_roles, list) or not all(
            isinstance(role, str) for role in allowed_roles
        ):
            raise ApiProtocolError("Citation 'allowed_roles' must be a list of strings.")

        return cls(
            source_id=source_id,
            title=title,
            allowed_roles=tuple(allowed_roles),
        )


@dataclass(frozen=True, slots=True)
class AskResult:
    """Typed representation of the backend's AskResponse model."""

    request_id: str
    user_id: str
    role: str
    intent: str
    answer: str
    citations: tuple[Citation, ...]
    safety_flags: tuple[str, ...]
    decision_trace: tuple[str, ...]

    @classmethod
    def from_dict(cls, value: Mapping[str, Any]) -> "AskResult":
        required_string_fields = (
            "request_id",
            "user_id",
            "role",
            "intent",
            "answer",
        )
        parsed: dict[str, str] = {}

        for field_name in required_string_fields:
            field_value = value.get(field_name)
            if not isinstance(field_value, str):
                raise ApiProtocolError(
                    f"Backend response is missing a valid '{field_name}' field."
                )
            parsed[field_name] = field_value

        raw_citations = value.get("citations", [])
        raw_safety_flags = value.get("safety_flags", [])
        raw_decision_trace = value.get("decision_trace", [])

        if not isinstance(raw_citations, list):
            raise ApiProtocolError("Backend field 'citations' must be a list.")
        if not isinstance(raw_safety_flags, list) or not all(
            isinstance(flag, str) for flag in raw_safety_flags
        ):
            raise ApiProtocolError("Backend field 'safety_flags' must be a list of strings.")
        if not isinstance(raw_decision_trace, list) or not all(
            isinstance(step, str) for step in raw_decision_trace
        ):
            raise ApiProtocolError("Backend field 'decision_trace' must be a list of strings.")

        citations = tuple(
            Citation.from_dict(item)
            for item in raw_citations
            if isinstance(item, Mapping)
        )
        if len(citations) != len(raw_citations):
            raise ApiProtocolError("Every citation must be a JSON object.")

        return cls(
            request_id=parsed["request_id"],
            user_id=parsed["user_id"],
            role=parsed["role"],
            intent=parsed["intent"],
            answer=parsed["answer"],
            citations=citations,
            safety_flags=tuple(raw_safety_flags),
            decision_trace=tuple(raw_decision_trace),
        )

    def to_dict(self) -> dict[str, Any]:
        """Return a Streamlit-friendly dictionary representation."""

        return {
            "request_id": self.request_id,
            "user_id": self.user_id,
            "role": self.role,
            "intent": self.intent,
            "answer": self.answer,
            "citations": [
                {
                    "source_id": citation.source_id,
                    "title": citation.title,
                    "allowed_roles": list(citation.allowed_roles),
                }
                for citation in self.citations
            ],
            "safety_flags": list(self.safety_flags),
            "decision_trace": list(self.decision_trace),
        }


class GenAIFDEApiClient:
    """Reusable client for the canonical FastAPI backend."""

    def __init__(
        self,
        base_url: str | None = None,
        *,
        timeout_seconds: float | None = None,
        session: Session | None = None,
        retry_total: int = 2,
    ) -> None:
        configured_url = base_url or os.getenv(
            "BACKEND_API_URL", DEFAULT_BACKEND_API_URL
        )
        configured_timeout = timeout_seconds or _timeout_from_environment()

        if not configured_url.strip():
            raise ValueError("base_url must not be empty.")
        if configured_timeout <= 0:
            raise ValueError("timeout_seconds must be greater than zero.")
        if retry_total < 0:
            raise ValueError("retry_total must be zero or greater.")

        self.base_url = configured_url.rstrip("/")
        self.timeout_seconds = float(configured_timeout)
        self.session = session or _build_session(retry_total=retry_total)

    def health(self) -> dict[str, str]:
        """Check whether the canonical backend is available."""

        payload = self._request_json("GET", "/health")
        status = payload.get("status")
        app = payload.get("app")

        if not isinstance(status, str) or not isinstance(app, str):
            raise ApiProtocolError(
                "Health response must contain string fields 'status' and 'app'."
            )

        return {"status": status, "app": app}

    def ask_question(
        self,
        *,
        user_id: str,
        question: str,
        prompt_name: str | None = None,
        prompt_version: str | None = None,
        debug: bool = False,
    ) -> AskResult:
        """Submit a grounded question to the enterprise assistant workflow.

        Args:
            user_id: Canonical demo user, for example ``u-manager-1``.
            question: User question. The backend requires at least 3 characters.
            prompt_name: Optional explicit prompt name.
            prompt_version: Optional explicit prompt version, for example ``v1``.
            debug: Include the backend decision trace when enabled.

        Returns:
            A validated :class:`AskResult`.
        """

        normalized_user_id = user_id.strip()
        normalized_question = question.strip()

        if not normalized_user_id:
            raise ValueError("user_id must not be empty.")
        if len(normalized_question) < 3:
            raise ValueError("question must contain at least 3 characters.")
        if prompt_version and not prompt_name:
            raise ValueError("prompt_version requires prompt_name.")

        request_body: dict[str, Any] = {
            "user_id": normalized_user_id,
            "question": normalized_question,
            "debug": bool(debug),
        }
        if prompt_name:
            request_body["prompt_name"] = prompt_name.strip()
        if prompt_version:
            request_body["prompt_version"] = prompt_version.strip()

        payload = self._request_json("POST", "/ask", json=request_body)
        return AskResult.from_dict(payload)

    def metrics(self) -> dict[str, Any]:
        """Return the backend's current in-memory metrics snapshot."""

        return dict(self._request_json("GET", "/metrics"))

    def prompt_metadata(self, name: str, version: str = "v1") -> dict[str, Any]:
        """Retrieve metadata for a registered prompt version."""

        normalized_name = name.strip()
        normalized_version = version.strip()
        if not normalized_name:
            raise ValueError("name must not be empty.")
        if not normalized_version:
            raise ValueError("version must not be empty.")

        safe_name = quote(normalized_name, safe="")
        safe_version = quote(normalized_version, safe="")
        return dict(
            self._request_json(
                "GET", f"/prompts/{safe_name}/{safe_version}"
            )
        )

    def close(self) -> None:
        """Close pooled HTTP connections."""

        self.session.close()

    def __enter__(self) -> "GenAIFDEApiClient":
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def _request_json(
        self,
        method: str,
        path: str,
        **kwargs: Any,
    ) -> Mapping[str, Any]:
        url = f"{self.base_url}{path}"

        try:
            response = self.session.request(
                method=method,
                url=url,
                timeout=self.timeout_seconds,
                headers={"Accept": "application/json"},
                **kwargs,
            )
        except requests.Timeout as exc:
            raise ApiTimeoutError(
                f"The backend did not respond within {self.timeout_seconds:g} seconds."
            ) from exc
        except requests.ConnectionError as exc:
            raise ApiConnectionError(
                f"Could not connect to the backend at {self.base_url}. "
                "Confirm that the FastAPI service is running."
            ) from exc
        except requests.RequestException as exc:
            raise ApiClientError(f"Backend request failed: {exc}") from exc

        if not response.ok:
            self._raise_response_error(response)

        try:
            payload = response.json()
        except ValueError as exc:
            raise ApiProtocolError(
                f"Backend returned non-JSON content for {method} {path}."
            ) from exc

        if not isinstance(payload, Mapping):
            raise ApiProtocolError(
                f"Backend returned an unexpected JSON type for {method} {path}."
            )

        return payload

    @staticmethod
    def _raise_response_error(response: Response) -> None:
        detail = _extract_error_detail(response)

        if response.status_code == 400:
            message = detail or "The backend rejected the request."
        elif response.status_code == 404:
            message = detail or "The requested backend resource was not found."
        elif response.status_code == 422:
            message = detail or "The request did not pass backend validation."
        elif response.status_code >= 500:
            message = "The backend encountered an internal error."
        else:
            message = detail or f"Backend request failed with HTTP {response.status_code}."

        raise ApiResponseError(
            message,
            status_code=response.status_code,
            detail=detail,
        )


def ask_question(
    question: str,
    user_id: str,
    *,
    prompt_name: str | None = None,
    prompt_version: str | None = None,
    debug: bool = False,
    base_url: str | None = None,
    timeout_seconds: float | None = None,
) -> dict[str, Any]:
    """Convenience function suitable for direct use from ``app.py``.

    Example::

        result = ask_question(
            question="What renewal risks exist for customer Acme Bank?",
            user_id="u-manager-1",
            debug=True,
        )
        print(result["answer"])
    """

    with GenAIFDEApiClient(
        base_url=base_url,
        timeout_seconds=timeout_seconds,
    ) as client:
        return client.ask_question(
            user_id=user_id,
            question=question,
            prompt_name=prompt_name,
            prompt_version=prompt_version,
            debug=debug,
        ).to_dict()


def _build_session(*, retry_total: int) -> Session:
    session = requests.Session()
    retry = Retry(
        total=retry_total,
        connect=retry_total,
        read=retry_total,
        status=retry_total,
        allowed_methods=frozenset({"GET"}),
        status_forcelist=(502, 503, 504),
        backoff_factor=0.25,
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def _timeout_from_environment() -> float:
    raw_value = os.getenv("REQUEST_TIMEOUT_SECONDS")
    if raw_value is None:
        return DEFAULT_TIMEOUT_SECONDS

    try:
        value = float(raw_value)
    except ValueError as exc:
        raise ValueError(
            "REQUEST_TIMEOUT_SECONDS must be a valid number."
        ) from exc

    if value <= 0:
        raise ValueError("REQUEST_TIMEOUT_SECONDS must be greater than zero.")
    return value


def _extract_error_detail(response: Response) -> str | None:
    try:
        payload = response.json()
    except ValueError:
        text = response.text.strip()
        return text[:500] if text else None

    if isinstance(payload, Mapping):
        detail = payload.get("detail")
        if isinstance(detail, str):
            return detail
        if isinstance(detail, list):
            messages: list[str] = []
            for item in detail:
                if isinstance(item, Mapping):
                    message = item.get("msg")
                    location = item.get("loc")
                    if isinstance(message, str):
                        if isinstance(location, list):
                            messages.append(f"{'.'.join(map(str, location))}: {message}")
                        else:
                            messages.append(message)
            if messages:
                return "; ".join(messages)

    return None