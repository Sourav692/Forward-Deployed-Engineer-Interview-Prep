"""Provided helpers. Do not modify. A scripted fake LLM so the round needs no network.

LLM contract:
    llm.complete(messages, tools) -> {
        "content": str | None,
        "tool_calls": [{"id": str, "name": str, "arguments": "<json string>"}],
        "usage": {"tokens": int},
    }
`messages` use the chat format: system / user / assistant (may carry "tool_calls") /
tool (carries "tool_call_id" and string "content").
`tools` is a list of {"name": str, "description": str}.
"""
import json
import itertools

_ids = itertools.count(1)


class LLMTransientError(Exception):
    """Rate limit / 5xx style error. Safe to retry."""


def tc(name, id=None, **args):
    """Build a tool call: tc("get_weather", city="Pune")."""
    return {"id": id or f"call_{next(_ids)}", "name": name, "arguments": json.dumps(args)}


def raw_tc(name, arguments, id=None):
    """Tool call with an arbitrary (possibly malformed) arguments string."""
    return {"id": id or f"call_{next(_ids)}", "name": name, "arguments": arguments}


def reply(content=None, calls=None, tokens=10):
    return {"content": content, "tool_calls": calls or [], "usage": {"tokens": tokens}}


class ScriptedLLM:
    """Returns scripted replies in order. An Exception instance in the script is raised."""

    def __init__(self, script):
        self.script = list(script)
        self.calls = []  # snapshots of what the agent sent

    def complete(self, messages, tools):
        self.calls.append({"messages": [dict(m) for m in messages], "tools": tools})
        if not self.script:
            raise AssertionError("LLM script exhausted: agent called the model more often than expected")
        item = self.script.pop(0)
        if isinstance(item, Exception):
            raise item
        return item
