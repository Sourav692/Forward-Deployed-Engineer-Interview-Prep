"""
session_state.py

Manages Streamlit session state for the Canonical GenAI FDE Interview Lab.

Responsibilities
----------------
- Chat history
- Current tenant
- Current user
- Previous questions and answers
- Session reset
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import streamlit as st


# ============================================================
# Data Models
# ============================================================

@dataclass
class ChatMessage:
    role: str
    content: str


@dataclass
class QARecord:
    question: str
    answer: str
    metadata: dict[str, Any] = field(default_factory=dict)


# ============================================================
# Default Session State
# ============================================================

_DEFAULT_STATE = {
    "tenant_id": "demo-tenant",
    "user_id": "demo-user",
    "chat_history": [],
    "qa_history": [],
}


# ============================================================
# Initialization
# ============================================================

def initialize_session() -> None:
    """
    Initialize all required Streamlit session variables.
    Safe to call multiple times.
    """

    for key, value in _DEFAULT_STATE.items():
        if key not in st.session_state:
            st.session_state[key] = value.copy() if isinstance(value, list) else value


# ============================================================
# Tenant
# ============================================================

def set_tenant(tenant_id: str) -> None:
    st.session_state["tenant_id"] = tenant_id.strip()


def get_tenant() -> str:
    return st.session_state["tenant_id"]


# ============================================================
# User
# ============================================================

def set_user(user_id: str) -> None:
    st.session_state["user_id"] = user_id.strip()


def get_user() -> str:
    return st.session_state["user_id"]


# ============================================================
# Chat History
# ============================================================

def add_user_message(message: str) -> None:
    st.session_state["chat_history"].append(
        ChatMessage(
            role="user",
            content=message,
        )
    )


def add_assistant_message(message: str) -> None:
    st.session_state["chat_history"].append(
        ChatMessage(
            role="assistant",
            content=message,
        )
    )


def get_chat_history() -> list[ChatMessage]:
    return st.session_state["chat_history"]


# ============================================================
# Previous Questions / Answers
# ============================================================

def add_qa(
    question: str,
    answer: str,
    metadata: dict[str, Any] | None = None,
) -> None:
    st.session_state["qa_history"].append(
        QARecord(
            question=question,
            answer=answer,
            metadata=metadata or {},
        )
    )


def get_previous_questions() -> list[str]:
    return [
        qa.question
        for qa in st.session_state["qa_history"]
    ]


def get_previous_answers() -> list[str]:
    return [
        qa.answer
        for qa in st.session_state["qa_history"]
    ]


def get_qa_history() -> list[QARecord]:
    return st.session_state["qa_history"]


# ============================================================
# Reset Session
# ============================================================

def reset_session() -> None:
    """
    Clears conversation while keeping a valid session.
    """

    st.session_state["chat_history"] = []
    st.session_state["qa_history"] = []

    st.session_state["tenant_id"] = "demo-tenant"
    st.session_state["user_id"] = "demo-user"


# ============================================================
# Debug Helper
# ============================================================

def session_summary() -> dict[str, Any]:
    """
    Useful for debugging or interview demonstrations.
    """

    return {
        "tenant": get_tenant(),
        "user": get_user(),
        "messages": len(get_chat_history()),
        "questions": len(get_qa_history()),
    }