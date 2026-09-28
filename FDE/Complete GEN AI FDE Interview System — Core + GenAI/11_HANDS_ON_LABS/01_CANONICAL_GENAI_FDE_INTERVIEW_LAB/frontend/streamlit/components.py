"""Reusable Streamlit rendering components for the GenAI FDE canonical lab.

The helpers in this module render API responses without coupling the UI to a
single backend implementation. They accept ordinary mappings, tolerate missing
optional fields, and avoid rendering raw HTML supplied by the API.

Expected response fields from the canonical ``POST /ask`` endpoint include:
``answer``, ``citations``, ``safety_flags``, ``request_id``, ``user_id``,
``role``, ``intent`` and ``decision_trace``. Optional latency, model, token and
cost fields are also supported when a future backend version supplies them.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

import streamlit as st


@dataclass(frozen=True, slots=True)
class ErrorDetails:
    """Normalized error information suitable for user-facing display."""

    title: str
    message: str
    status_code: int | None = None
    request_id: str | None = None
    retryable: bool = False
    technical_details: str | None = None


def render_answer(answer: str | None, *, heading: str = "Answer") -> None:
    """Render the generated answer in a readable container.

    Args:
        answer: Generated answer text. Empty values produce a warning instead
            of an empty panel.
        heading: Section heading shown above the answer.
    """

    st.subheader(heading)
    normalized = _clean_text(answer)
    if not normalized:
        st.warning("The API returned no answer text.")
        return

    with st.container(border=True):
        st.markdown(normalized)


def render_evidence_cards(
    citations: Sequence[Mapping[str, Any]] | None,
    *,
    heading: str = "Sources and evidence",
) -> None:
    """Render source citations as expandable evidence cards.

    Canonical citations use ``source_id``, ``title`` and ``allowed_roles``.
    The renderer additionally supports common optional fields such as
    ``excerpt``, ``score``, ``uri``, ``page`` and ``metadata``.
    """

    st.subheader(heading)
    evidence = [item for item in (citations or []) if isinstance(item, Mapping)]
    if not evidence:
        st.info("No source evidence was returned for this answer.")
        return

    for index, source in enumerate(evidence, start=1):
        title = _clean_text(source.get("title")) or f"Evidence {index}"
        source_id = _clean_text(source.get("source_id") or source.get("id"))
        score = _as_float(source.get("score") or source.get("relevance_score"))
        label_parts = [f"{index}. {title}"]
        if score is not None:
            label_parts.append(f"relevance {score:.2f}")

        with st.expander(" — ".join(label_parts), expanded=index == 1):
            if source_id:
                st.caption(f"Source ID: {source_id}")

            excerpt = _clean_text(
                source.get("excerpt")
                or source.get("text")
                or source.get("content")
                or source.get("snippet")
            )
            if excerpt:
                st.markdown("**Evidence excerpt**")
                st.markdown(excerpt)

            location_parts: list[str] = []
            page = source.get("page") or source.get("page_number")
            if page not in (None, ""):
                location_parts.append(f"Page {page}")
            section = _clean_text(source.get("section"))
            if section:
                location_parts.append(f"Section: {section}")
            if location_parts:
                st.caption(" · ".join(location_parts))

            roles = _string_list(source.get("allowed_roles"))
            if roles:
                st.markdown(f"**Permitted roles:** {', '.join(roles)}")

            uri = _clean_text(source.get("uri") or source.get("url"))
            if uri and _is_safe_link(uri):
                st.link_button("Open source", uri)

            metadata = source.get("metadata")
            if isinstance(metadata, Mapping) and metadata:
                with st.popover("View metadata"):
                    st.json(dict(metadata), expanded=False)


def render_safety_warnings(
    safety_flags: Sequence[str] | None,
    *,
    blocked: bool | None = None,
) -> None:
    """Render safety, policy and permission warnings.

    Args:
        safety_flags: Backend-provided warning or policy flag strings.
        blocked: Explicit block state. If omitted, blocking is inferred from
            flag names containing terms such as ``blocked`` or ``denied``.
    """

    flags = [flag for flag in _string_list(safety_flags) if flag]
    inferred_block = any(
        token in flag.lower()
        for flag in flags
        for token in ("blocked", "denied", "forbidden", "unsafe", "permission")
    )
    is_blocked = inferred_block if blocked is None else blocked

    if not flags and not is_blocked:
        st.success("Safety and permission checks passed.", icon="✅")
        return

    if is_blocked:
        st.error(
            "The request was blocked by a safety or permission control.",
            icon="🛡️",
        )
    else:
        st.warning("The response includes safety or policy warnings.", icon="⚠️")

    if flags:
        with st.container(border=True):
            for flag in flags:
                st.markdown(f"- {flag}")


def render_latency_and_metadata(
    response: Mapping[str, Any] | None,
    *,
    latency_ms: float | int | None = None,
    heading: str = "Request metadata",
) -> None:
    """Render latency, identity, routing and model metadata.

    The function recognizes multiple common field names so it can support the
    current canonical API and future observability-enriched responses.
    """

    payload: Mapping[str, Any] = response or {}
    resolved_latency = _first_number(
        latency_ms,
        payload.get("latency_ms"),
        payload.get("duration_ms"),
        payload.get("elapsed_ms"),
        _nested_get(payload, "metadata", "latency_ms"),
    )

    st.subheader(heading)

    metrics: list[tuple[str, str]] = []
    if resolved_latency is not None:
        metrics.append(("Latency", _format_latency(resolved_latency)))

    role = _clean_text(payload.get("role"))
    intent = _clean_text(payload.get("intent"))
    model = _clean_text(
        payload.get("model")
        or payload.get("model_name")
        or _nested_get(payload, "metadata", "model")
    )
    token_count = _first_number(
        payload.get("total_tokens"),
        payload.get("tokens"),
        _nested_get(payload, "usage", "total_tokens"),
    )
    cost = _first_number(
        payload.get("estimated_cost_usd"),
        payload.get("cost_usd"),
        _nested_get(payload, "usage", "cost_usd"),
    )

    if role:
        metrics.append(("Role", role))
    if intent:
        metrics.append(("Intent", intent))
    if model:
        metrics.append(("Model", model))
    if token_count is not None:
        metrics.append(("Tokens", f"{int(token_count):,}"))
    if cost is not None:
        metrics.append(("Estimated cost", f"${cost:.4f}"))

    if metrics:
        columns = st.columns(min(len(metrics), 4))
        for index, (label, value) in enumerate(metrics):
            columns[index % len(columns)].metric(label, value)
    else:
        st.info("No latency or operational metrics were returned.")

    request_id = _clean_text(payload.get("request_id"))
    user_id = _clean_text(payload.get("user_id"))
    trace = _string_list(payload.get("decision_trace"))

    details: dict[str, Any] = {}
    if request_id:
        details["request_id"] = request_id
    if user_id:
        details["user_id"] = user_id
    if trace:
        details["decision_trace"] = trace

    for key in ("prompt_name", "prompt_version", "cache_hit", "retrieval_count"):
        value = payload.get(key)
        if value not in (None, "", [], {}):
            details[key] = value

    if details:
        with st.expander("Technical details", expanded=False):
            st.json(details, expanded=False)


def render_error_message(
    error: ErrorDetails | Exception | Mapping[str, Any] | str,
    *,
    show_technical_details: bool = False,
) -> None:
    """Render a normalized, actionable API or application error.

    Technical details are hidden by default to avoid exposing internals in a
    buyer-facing demo. Enable them only in an explicit debug mode.
    """

    details = normalize_error(error)
    st.error(f"**{details.title}**\n\n{details.message}", icon="🚨")

    context: list[str] = []
    if details.status_code is not None:
        context.append(f"HTTP {details.status_code}")
    if details.request_id:
        context.append(f"Request ID: {details.request_id}")
    if context:
        st.caption(" · ".join(context))

    if details.retryable:
        st.info(
            "You can retry the request. If the problem continues, confirm that "
            "the backend is running and that the configured API URL is correct."
        )

    if show_technical_details and details.technical_details:
        with st.expander("Technical error details", expanded=False):
            st.code(details.technical_details, language="text")


def render_api_response(
    response: Mapping[str, Any],
    *,
    latency_ms: float | int | None = None,
    show_metadata: bool = True,
) -> None:
    """Render a complete successful canonical API response."""

    render_safety_warnings(
        _string_list(response.get("safety_flags")),
        blocked=_optional_bool(response.get("blocked")),
    )
    render_answer(_clean_text(response.get("answer")))
    render_evidence_cards(_mapping_list(response.get("citations")))
    if show_metadata:
        render_latency_and_metadata(response, latency_ms=latency_ms)


def normalize_error(
    error: ErrorDetails | Exception | Mapping[str, Any] | str,
) -> ErrorDetails:
    """Convert common HTTP/client errors into a stable display model."""

    if isinstance(error, ErrorDetails):
        return error

    if isinstance(error, str):
        return ErrorDetails(title="Request failed", message=error)

    if isinstance(error, Mapping):
        status_code = _as_int(error.get("status_code") or error.get("status"))
        request_id = _clean_text(error.get("request_id"))
        raw_detail = error.get("detail") or error.get("message") or error.get("error")
        message = _extract_error_text(raw_detail) or _default_error_message(status_code)
        return ErrorDetails(
            title=_error_title(status_code),
            message=message,
            status_code=status_code,
            request_id=request_id,
            retryable=_is_retryable(status_code),
            technical_details=_clean_text(error.get("technical_details")),
        )

    status_code = _as_int(getattr(error, "status_code", None))
    message = _clean_text(str(error)) or _default_error_message(status_code)
    request_id = _clean_text(getattr(error, "request_id", None))
    return ErrorDetails(
        title=_error_title(status_code),
        message=message,
        status_code=status_code,
        request_id=request_id,
        retryable=_is_retryable(status_code),
        technical_details=repr(error),
    )


def _error_title(status_code: int | None) -> str:
    if status_code == 400:
        return "Invalid request"
    if status_code in {401, 403}:
        return "Access denied"
    if status_code == 404:
        return "Resource not found"
    if status_code == 408:
        return "Request timed out"
    if status_code == 429:
        return "Too many requests"
    if status_code is not None and status_code >= 500:
        return "Backend service unavailable"
    return "Request failed"


def _default_error_message(status_code: int | None) -> str:
    if status_code == 400:
        return "Review the user, question and request options, then try again."
    if status_code in {401, 403}:
        return "Your current user or role is not permitted to perform this request."
    if status_code == 404:
        return "The requested API resource could not be found."
    if status_code == 408:
        return "The backend did not respond before the request timeout."
    if status_code == 429:
        return "The service is temporarily rate-limited. Try again shortly."
    if status_code is not None and status_code >= 500:
        return "The backend encountered an unexpected problem."
    return "The request could not be completed."


def _is_retryable(status_code: int | None) -> bool:
    return status_code is None or status_code in {408, 409, 425, 429} or (
        status_code is not None and status_code >= 500
    )


def _extract_error_text(value: Any) -> str:
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, Mapping):
        return _clean_text(value.get("message") or value.get("detail"))
    if isinstance(value, Sequence) and not isinstance(value, (str, bytes, bytearray)):
        messages = [_extract_error_text(item) for item in value]
        return "; ".join(message for message in messages if message)
    return _clean_text(value)


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _string_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value.strip()] if value.strip() else []
    if isinstance(value, Sequence) and not isinstance(value, (str, bytes, bytearray)):
        return [text for item in value if (text := _clean_text(item))]
    text = _clean_text(value)
    return [text] if text else []


def _mapping_list(value: Any) -> list[Mapping[str, Any]]:
    if not isinstance(value, Sequence) or isinstance(value, (str, bytes, bytearray)):
        return []
    return [item for item in value if isinstance(item, Mapping)]


def _as_float(value: Any) -> float | None:
    try:
        return float(value) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None


def _as_int(value: Any) -> int | None:
    try:
        return int(value) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None


def _first_number(*values: Any) -> float | None:
    for value in values:
        number = _as_float(value)
        if number is not None:
            return number
    return None


def _nested_get(mapping: Mapping[str, Any], *keys: str) -> Any:
    current: Any = mapping
    for key in keys:
        if not isinstance(current, Mapping):
            return None
        current = current.get(key)
    return current


def _format_latency(value: float) -> str:
    if value < 1_000:
        return f"{value:.0f} ms"
    return f"{value / 1_000:.2f} s"


def _optional_bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    return None


def _is_safe_link(uri: str) -> bool:
    lowered = uri.strip().lower()
    return lowered.startswith(("https://", "http://"))


__all__ = [
    "ErrorDetails",
    "normalize_error",
    "render_answer",
    "render_api_response",
    "render_evidence_cards",
    "render_error_message",
    "render_latency_and_metadata",
    "render_safety_warnings",
]