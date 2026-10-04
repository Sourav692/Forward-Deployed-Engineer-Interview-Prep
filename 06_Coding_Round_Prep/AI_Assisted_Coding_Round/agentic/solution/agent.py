"""Reference solution. Do not open until you have finished the mock."""
import inspect
import json
import threading
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeout
from dataclasses import dataclass, field

from fake_llm import LLMTransientError


class MaxStepsExceeded(Exception):
    pass


class BudgetExceeded(Exception):
    pass


@dataclass
class AgentResult:
    final: str
    steps: int
    messages: list
    tokens: int = 0
    trace: list = field(default_factory=list)


def _is_error(text):
    return text.startswith(("ERROR", "DENIED"))


class Agent:
    def __init__(self, llm, tools, system="You are a helpful agent.", max_steps=8,
                 max_retries=3, sleep=time.sleep, token_budget=None,
                 requires_approval=(), approver=None, tool_timeout=None):
        self.llm = llm
        self.tools = tools
        self.system = system
        self.max_steps = max_steps
        self.max_retries = max_retries
        self.sleep = sleep
        self.token_budget = token_budget
        self.requires_approval = set(requires_approval)
        self.approver = approver
        self.tool_timeout = tool_timeout
        self._specs = [{"name": n, "description": inspect.getdoc(f) or ""} for n, f in tools.items()]

    # ---- LLM call with retry/backoff on transient errors only ----
    def _call_llm(self, messages):
        for attempt in range(self.max_retries + 1):
            try:
                return self.llm.complete(list(messages), self._specs)
            except LLMTransientError:
                if attempt == self.max_retries:
                    raise
                self.sleep(2 ** attempt)

    # ---- one tool call -> always returns a string the model can read ----
    def _exec(self, call, cache, lock):
        name = call["name"]
        fn = self.tools.get(name)
        if fn is None:
            return f"ERROR: unknown tool '{name}'"
        try:
            args = json.loads(call.get("arguments") or "{}")
            if not isinstance(args, dict):
                raise ValueError("arguments must be a JSON object")
        except (ValueError, TypeError) as e:
            return f"ERROR: invalid JSON arguments: {e}"
        try:
            inspect.signature(fn).bind(**args)
        except TypeError as e:
            return f"ERROR: bad arguments: {e}"

        side_effect = name in self.requires_approval
        key = (name, json.dumps(args, sort_keys=True))
        if side_effect:
            with lock:
                if key in cache:
                    return cache[key]
                if self.approver is None or not self.approver(name, args):
                    return "DENIED: approval required"
                out = self._invoke(fn, args)
                if not _is_error(out):
                    cache[key] = out
                return out
        return self._invoke(fn, args)

    @staticmethod
    def _invoke(fn, args):
        try:
            out = fn(**args)
        except Exception as e:  # noqa: BLE001 - the model should see tool failures
            return f"ERROR: {type(e).__name__}: {e}"
        return out if isinstance(out, str) else json.dumps(out)

    # ---- all tool calls of one assistant turn, in parallel, ordered results ----
    def _run_calls(self, calls, cache, lock, trace, step):
        pool = ThreadPoolExecutor(max_workers=len(calls))
        futures = [pool.submit(self._exec, c, cache, lock) for c in calls]
        results = []
        for c, f in zip(calls, futures):
            try:
                out = f.result(timeout=self.tool_timeout)
            except FutureTimeout:
                out = f"ERROR: tool '{c['name']}' timed out after {self.tool_timeout}s"
            results.append(out)
            trace.append({"step": step, "type": "tool", "name": c["name"], "ok": not _is_error(out)})
        pool.shutdown(wait=False)
        return results

    def run(self, user_message):
        messages = [{"role": "system", "content": self.system},
                    {"role": "user", "content": user_message}]
        trace, tokens, cache, lock = [], 0, {}, threading.Lock()
        for step in range(1, self.max_steps + 1):
            resp = self._call_llm(messages)
            trace.append({"step": step, "type": "llm"})
            tokens += resp.get("usage", {}).get("tokens", 0)
            if self.token_budget is not None and tokens > self.token_budget:
                raise BudgetExceeded(f"{tokens} > {self.token_budget}")
            calls = resp.get("tool_calls") or []
            msg = {"role": "assistant", "content": resp.get("content")}
            if calls:
                msg["tool_calls"] = calls
            messages.append(msg)
            if not calls:
                return AgentResult(resp.get("content") or "", step, messages, tokens, trace)
            for c, out in zip(calls, self._run_calls(calls, cache, lock, trace, step)):
                messages.append({"role": "tool", "tool_call_id": c["id"], "content": out})
        raise MaxStepsExceeded(f"no final answer after {self.max_steps} steps")


def evaluate(make_agent, cases):
    """Run eval cases. make_agent(case) -> Agent. Returns pass/fail summary with reasons."""
    failures = []
    for case in cases:
        try:
            res = make_agent(case).run(case["input"])
        except Exception as e:  # noqa: BLE001
            failures.append({"input": case["input"], "reasons": [f"exception: {type(e).__name__}"]})
            continue
        used = [t["name"] for t in res.trace if t["type"] == "tool"]
        reasons = []
        if "expect_tools" in case and used != case["expect_tools"]:
            reasons.append(f"tools {used} != {case['expect_tools']}")
        if "expect_contains" in case and case["expect_contains"] not in res.final:
            reasons.append(f"final missing {case['expect_contains']!r}")
        if reasons:
            failures.append({"input": case["input"], "reasons": reasons})
    return {"passed": len(cases) - len(failures), "total": len(cases), "failures": failures}
