

"""Streamlit frontend for the canonical GenAI FDE Interview Lab.

Run from the lab root with:
    streamlit run frontend/streamlit/app.py

Environment variables:
    BACKEND_API_URL=http://localhost:8000
    REQUEST_TIMEOUT_SECONDS=30
"""

from __future__ import annotations

import os
import time
from typing import Any

import requests
import streamlit as st


BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000").rstrip("/")
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "30"))

DEFAULT_USERS = {
    "Sales Manager": "u-manager-1",
    "Support Agent": "u-support-1",
    "Security Analyst": "u-security-1",
    "Custom user": "",
}


def configure_page() -> None:
    """Configure the Streamlit page before rendering UI elements."""
    st.set_page_config(
        page_title="GenAI FDE Enterprise Assistant",
        page_icon="🤖",
        layout="wide",
        initial_sidebar_state="expanded",
    )


def initialise_session_state() -> None:
    """Create session-state keys used by the application."""
    defaults = {
        "last_response": None,
        "last_latency_ms": None,
        "last_tenant_id": "tenant-demo",
        "last_user_id": "u-manager-1",
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def check_backend_health() -> tuple[bool, str]:
    """Check whether the FastAPI backend is reachable."""
    try:
        response = requests.get(
            f"{BACKEND_API_URL}/health",
            timeout=min(REQUEST_TIMEOUT_SECONDS, 5),
        )
        response.raise_for_status()
        body = response.json()
        if body.get("status") == "ok":
            return True, body.get("app", "backend")
        return False, "Backend returned an unhealthy status."
    except requests.RequestException as exc:
        return False, str(exc)
    except ValueError:
        return False, "Backend health response was not valid JSON."


def submit_question(
    *,
    question: str,
    user_id: str,
    tenant_id: str,
    prompt_name: str | None,
    prompt_version: str | None,
    debug: bool,
) -> tuple[dict[str, Any], float]:
    """Call the canonical FastAPI /ask endpoint and return JSON plus latency."""
    payload: dict[str, Any] = {
        "user_id": user_id,
        "question": question,
        "debug": debug,
    }

    if prompt_name:
        payload["prompt_name"] = prompt_name
    if prompt_version:
        payload["prompt_version"] = prompt_version

    headers = {
        "Content-Type": "application/json",
        # The current backend does not expose tenant_id in AskRequest.
        # Passing it as a header keeps the frontend tenant-aware and allows
        # the backend to adopt tenant enforcement later without changing UI.
        "X-Tenant-ID": tenant_id,
    }

    started = time.perf_counter()
    response = requests.post(
        f"{BACKEND_API_URL}/ask",
        json=payload,
        headers=headers,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    latency_ms = (time.perf_counter() - started) * 1000

    try:
        body = response.json()
    except ValueError as exc:
        raise RuntimeError(
            f"Backend returned a non-JSON response (HTTP {response.status_code})."
        ) from exc

    if response.status_code == 401:
        raise PermissionError("Authentication failed. Check the selected user context.")
    if response.status_code == 403:
        raise PermissionError(
            body.get("detail", "This user is not permitted to access the requested data.")
        )
    if response.status_code == 400:
        raise ValueError(body.get("detail", "The backend rejected the request."))
    if response.status_code >= 500:
        raise RuntimeError(
            body.get("detail", "The backend encountered an internal error.")
        )

    response.raise_for_status()
    return body, latency_ms


def render_status_banner() -> None:
    """Display backend connectivity status in the sidebar."""
    healthy, detail = check_backend_health()
    if healthy:
        st.sidebar.success(f"Backend connected: {detail}")
    else:
        st.sidebar.error("Backend unavailable")
        st.sidebar.caption(detail)


def render_citations(citations: list[dict[str, Any]]) -> None:
    """Render retrieved evidence returned by the canonical backend."""
    st.subheader("Retrieved evidence and citations")

    if not citations:
        st.warning(
            "No citations were returned. Treat the answer as insufficiently grounded "
            "until supporting evidence is available."
        )
        return

    for index, citation in enumerate(citations, start=1):
        title = citation.get("title") or "Untitled source"
        source_id = citation.get("source_id") or "unknown"
        allowed_roles = citation.get("allowed_roles") or []

        with st.expander(f"{index}. {title}", expanded=index == 1):
            st.write(f"**Source ID:** `{source_id}`")
            if allowed_roles:
                st.write("**Permitted roles:** " + ", ".join(allowed_roles))
            else:
                st.write("**Permitted roles:** Not provided")


def render_safety_and_permissions(response: dict[str, Any]) -> None:
    """Render safety flags and role information."""
    st.subheader("Permission and safety status")

    role = response.get("role")
    safety_flags = response.get("safety_flags") or []

    left, right = st.columns(2)
    with left:
        if role:
            st.info(f"Resolved role: **{role}**")
        else:
            st.warning("The backend did not return a resolved user role.")

    with right:
        if safety_flags:
            st.warning("Safety flags: " + ", ".join(map(str, safety_flags)))
        else:
            st.success("No safety flags were returned.")


def render_answer(response: dict[str, Any], latency_ms: float) -> None:
    """Render answer, metadata, evidence, and optional debug trace."""
    answer = response.get("answer")

    st.subheader("Generated answer")
    if answer:
        st.markdown(answer)
    else:
        st.error("The backend response did not contain an answer.")

    metric_columns = st.columns(4)
    metric_columns[0].metric("Latency", f"{latency_ms:.0f} ms")
    metric_columns[1].metric("Intent", response.get("intent", "Unknown"))
    metric_columns[2].metric("Role", response.get("role", "Unknown"))
    metric_columns[3].metric(
        "Citations", len(response.get("citations") or [])
    )

    request_id = response.get("request_id")
    if request_id:
        st.caption(f"Request ID: `{request_id}`")

    render_safety_and_permissions(response)
    render_citations(response.get("citations") or [])

    decision_trace = response.get("decision_trace") or []
    if decision_trace:
        with st.expander("Decision trace", expanded=False):
            for step in decision_trace:
                st.write(f"- {step}")

    with st.expander("Raw backend response", expanded=False):
        st.json(response)


def render_sidebar() -> tuple[str, str, str | None, str | None, bool]:
    """Render user, tenant, and advanced request settings."""
    st.sidebar.header("Request context")

    selected_user = st.sidebar.selectbox(
        "Example user",
        options=list(DEFAULT_USERS.keys()),
        index=0,
        help="Select a known demo identity or enter a custom user ID.",
    )

    suggested_user_id = DEFAULT_USERS[selected_user]
    user_id = st.sidebar.text_input(
        "User ID",
        value=suggested_user_id or st.session_state.last_user_id,
        placeholder="u-manager-1",
        help="The backend resolves permissions and role from this ID.",
    ).strip()

    tenant_id = st.sidebar.text_input(
        "Tenant ID",
        value=st.session_state.last_tenant_id,
        placeholder="tenant-demo",
        help=(
            "Sent in the X-Tenant-ID header. The current canonical backend does "
            "not yet include tenant_id in the AskRequest schema."
        ),
    ).strip()

    with st.sidebar.expander("Advanced options", expanded=False):
        prompt_name = st.text_input(
            "Prompt name",
            placeholder="sales_account_summary",
        ).strip() or None
        prompt_version = st.text_input(
            "Prompt version",
            placeholder="v1",
        ).strip() or None
        debug = st.checkbox(
            "Include decision trace",
            value=True,
        )

    st.sidebar.divider()
    st.sidebar.caption(f"API: `{BACKEND_API_URL}`")
    render_status_banner()

    return user_id, tenant_id, prompt_name, prompt_version, debug


def main() -> None:
    """Render and run the Streamlit application."""
    configure_page()
    initialise_session_state()

    st.title("GenAI FDE Enterprise Assistant")
    st.caption(
        "Canonical lab frontend for grounded answers, permission-aware retrieval, "
        "safety visibility, and request diagnostics."
    )

    user_id, tenant_id, prompt_name, prompt_version, debug = render_sidebar()

    with st.form("question_form", clear_on_submit=False):
        question = st.text_area(
            "Question",
            height=140,
            placeholder="Example: What renewal risks exist for customer Acme Bank?",
            help="Enter a question that can be answered from the lab's permitted data.",
        )
        submitted = st.form_submit_button(
            "Ask assistant",
            type="primary",
            use_container_width=True,
        )

    if submitted:
        question = question.strip()

        if len(question) < 3:
            st.error("Enter a question containing at least three characters.")
        elif not user_id:
            st.error("Enter a user ID so the backend can evaluate permissions.")
        elif not tenant_id:
            st.error("Enter a tenant ID for request context.")
        else:
            st.session_state.last_user_id = user_id
            st.session_state.last_tenant_id = tenant_id

            try:
                with st.spinner("Retrieving permitted evidence and generating an answer..."):
                    response, latency_ms = submit_question(
                        question=question,
                        user_id=user_id,
                        tenant_id=tenant_id,
                        prompt_name=prompt_name,
                        prompt_version=prompt_version,
                        debug=debug,
                    )

                st.session_state.last_response = response
                st.session_state.last_latency_ms = latency_ms
                st.success("Answer generated successfully.")

            except PermissionError as exc:
                st.error(f"Permission denied: {exc}")
                st.info(
                    "Try a user whose role is authorised for the requested information. "
                    "Do not bypass permission checks."
                )
            except ValueError as exc:
                st.warning(f"Request rejected: {exc}")
            except requests.Timeout:
                st.error(
                    f"The backend did not respond within {REQUEST_TIMEOUT_SECONDS:g} seconds."
                )
                st.info("Confirm that the backend is running and inspect its logs.")
            except requests.ConnectionError:
                st.error(f"Could not connect to the backend at {BACKEND_API_URL}.")
                st.code("uvicorn backend.app.main:app --reload", language="bash")
            except requests.RequestException as exc:
                st.error(f"Backend request failed: {exc}")
            except RuntimeError as exc:
                st.error(str(exc))
            except Exception as exc:  # Defensive final boundary for a demo UI.
                st.error("An unexpected frontend error occurred.")
                st.exception(exc)

    if st.session_state.last_response is not None:
        st.divider()
        render_answer(
            st.session_state.last_response,
            float(st.session_state.last_latency_ms or 0),
        )
    else:
        st.info(
            "Enter a question and request context. The result will show the answer, "
            "retrieved citations, role, safety flags, latency, and optional decision trace."
        )


if __name__ == "__main__":
    main()