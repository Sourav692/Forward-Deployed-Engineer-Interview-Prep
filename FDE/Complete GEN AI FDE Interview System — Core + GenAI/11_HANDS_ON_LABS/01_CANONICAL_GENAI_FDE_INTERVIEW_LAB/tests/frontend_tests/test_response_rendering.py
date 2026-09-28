"""Tests for frontend/streamlit configuration handling."""

from __future__ import annotations
from frontend.streamlit import api_client

import importlib
import os

import pytest
import frontend



class TestFrontendConfiguration:
    def test_default_backend_url_is_available(self, monkeypatch):
        monkeypatch.delenv("BACKEND_API_URL", raising=False)
        monkeypatch.delenv("REQUEST_TIMEOUT_SECONDS", raising=False)

        importlib.reload(api_client)

        assert api_client.BACKEND_API_URL == "http://localhost:8000"
        assert api_client.REQUEST_TIMEOUT_SECONDS > 0

    def test_environment_configuration_is_loaded(self, monkeypatch):
        monkeypatch.setenv("BACKEND_API_URL", "http://backend:8000")
        monkeypatch.setenv("REQUEST_TIMEOUT_SECONDS", "45")

        importlib.reload(api_client)

        assert api_client.BACKEND_API_URL == "http://backend:8000"
        assert api_client.REQUEST_TIMEOUT_SECONDS == 45

    def test_backend_url_has_no_trailing_slash(self, monkeypatch):
        monkeypatch.setenv("BACKEND_API_URL", "http://backend:8000/")
        importlib.reload(api_client)

        assert api_client.BACKEND_API_URL == "http://backend:8000"

    def test_invalid_timeout_falls_back_to_safe_default(self, monkeypatch):
        monkeypatch.setenv("REQUEST_TIMEOUT_SECONDS", "not-a-number")
        importlib.reload(api_client)

        assert isinstance(api_client.REQUEST_TIMEOUT_SECONDS, int)
        assert api_client.REQUEST_TIMEOUT_SECONDS > 0

    def test_required_configuration_values_are_not_empty(self, monkeypatch):
        monkeypatch.setenv("BACKEND_API_URL", "")
        importlib.reload(api_client)

        assert api_client.BACKEND_API_URL
        assert api_client.REQUEST_TIMEOUT_SECONDS > 0