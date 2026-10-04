import time

import pytest

from agent import Agent, MaxStepsExceeded
from fake_llm import LLMTransientError, ScriptedLLM, raw_tc, reply, tc


def tool_msgs(llm_call):
    return [m for m in llm_call["messages"] if m["role"] == "tool"]


# ---------------- Gate 1: the agent loop ----------------
def test_gate1_final_answer_no_tools():
    llm = ScriptedLLM([reply("Hello!")])
    res = Agent(llm, {}).run("hi")
    assert res.final == "Hello!" and res.steps == 1
    assert res.messages[0]["role"] == "system" and res.messages[1] == {"role": "user", "content": "hi"}


def test_gate1_tool_loop_feeds_result_back():
    call = tc("get_weather", city="Pune")
    llm = ScriptedLLM([reply(calls=[call]), reply("It is 31C in Pune.")])
    res = Agent(llm, {"get_weather": lambda city: "31C"}).run("weather in Pune?")
    assert res.final == "It is 31C in Pune." and res.steps == 2
    tm = tool_msgs(llm.calls[1])
    assert len(tm) == 1 and tm[0]["content"] == "31C" and tm[0]["tool_call_id"] == call["id"]
    # the assistant tool-call message must precede its tool result
    roles = [m["role"] for m in llm.calls[1]["messages"]]
    assert roles == ["system", "user", "assistant", "tool"]


def test_gate1_multiple_calls_one_turn_keep_order():
    a, b = tc("f", x=1), tc("f", x=2)
    llm = ScriptedLLM([reply(calls=[a, b]), reply("done")])
    Agent(llm, {"f": lambda x: f"r{x}"}).run("go")
    tm = tool_msgs(llm.calls[1])
    assert [m["content"] for m in tm] == ["r1", "r2"]
    assert [m["tool_call_id"] for m in tm] == [a["id"], b["id"]]


def test_gate1_non_string_results_are_json_encoded():
    llm = ScriptedLLM([reply(calls=[tc("f")]), reply("ok")])
    Agent(llm, {"f": lambda: {"a": 1}}).run("go")
    assert tool_msgs(llm.calls[1])[0]["content"] == '{"a": 1}'


def test_gate1_max_steps():
    llm = ScriptedLLM([reply(calls=[tc("f")]) for _ in range(10)])
    with pytest.raises(MaxStepsExceeded):
        Agent(llm, {"f": lambda: "x"}, max_steps=3).run("loop forever")
    assert len(llm.calls) == 3


def test_gate1_tools_advertised_to_model():
    def lookup(q):
        """Search the docs."""
        return "x"

    llm = ScriptedLLM([reply("ok")])
    Agent(llm, {"lookup": lookup}).run("hi")
    assert llm.calls[0]["tools"] == [{"name": "lookup", "description": "Search the docs."}]


# ---------------- Gate 2: robustness ----------------
def test_gate2_tool_exception_becomes_message_and_loop_continues():
    def boom():
        raise RuntimeError("db down")

    llm = ScriptedLLM([reply(calls=[tc("boom")]), reply("Sorry, the DB is down.")])
    res = Agent(llm, {"boom": boom}).run("go")
    assert res.final == "Sorry, the DB is down."
    out = tool_msgs(llm.calls[1])[0]["content"]
    assert out.startswith("ERROR") and "db down" in out


def test_gate2_unknown_tool():
    llm = ScriptedLLM([reply(calls=[tc("nope")]), reply("ok")])
    Agent(llm, {}).run("go")
    assert "unknown tool" in tool_msgs(llm.calls[1])[0]["content"]


@pytest.mark.parametrize("args", ["{not json", "[1, 2]", '"str"'])
def test_gate2_malformed_arguments(args):
    llm = ScriptedLLM([reply(calls=[raw_tc("f", args)]), reply("ok")])
    called = []
    Agent(llm, {"f": lambda x: called.append(x)}).run("go")
    assert tool_msgs(llm.calls[1])[0]["content"].startswith("ERROR") and not called


def test_gate2_missing_and_unexpected_args_not_executed():
    called = []
    llm = ScriptedLLM([reply(calls=[tc("f"), tc("f", x=1, y=2)]), reply("ok")])
    Agent(llm, {"f": lambda x: called.append(x)}).run("go")
    msgs = tool_msgs(llm.calls[1])
    assert all(m["content"].startswith("ERROR") for m in msgs) and not called


def test_gate2_retries_transient_with_exponential_backoff():
    sleeps = []
    llm = ScriptedLLM([LLMTransientError(), LLMTransientError(), reply("ok")])
    res = Agent(llm, {}, sleep=sleeps.append).run("hi")
    assert res.final == "ok" and sleeps == [1, 2]


def test_gate2_retry_exhaustion_raises():
    sleeps = []
    llm = ScriptedLLM([LLMTransientError() for _ in range(4)])
    with pytest.raises(LLMTransientError):
        Agent(llm, {}, max_retries=3, sleep=sleeps.append).run("hi")
    assert sleeps == [1, 2, 4] and len(llm.calls) == 4


def test_gate2_non_transient_llm_error_not_retried():
    sleeps = []
    llm = ScriptedLLM([ValueError("bad request")])
    with pytest.raises(ValueError):
        Agent(llm, {}, sleep=sleeps.append).run("hi")
    assert sleeps == [] and len(llm.calls) == 1


# ---------------- Gate 3: guardrails ----------------
def test_gate3_token_budget():
    from agent import BudgetExceeded

    llm = ScriptedLLM([reply(calls=[tc("f")], tokens=60), reply("late", tokens=60)])
    with pytest.raises(BudgetExceeded):
        Agent(llm, {"f": lambda: "x"}, token_budget=100).run("go")


def test_gate3_tokens_are_summed_in_result():
    llm = ScriptedLLM([reply(calls=[tc("f")], tokens=30), reply("ok", tokens=20)])
    assert Agent(llm, {"f": lambda: "x"}, token_budget=100).run("go").tokens == 50


def test_gate3_denied_side_effect_is_not_executed():
    refunds = []
    llm = ScriptedLLM([reply(calls=[tc("issue_refund", order="A1")]), reply("I could not refund.")])
    res = Agent(llm, {"issue_refund": lambda order: refunds.append(order)},
                requires_approval={"issue_refund"}, approver=lambda n, a: False).run("refund A1")
    assert refunds == [] and res.final == "I could not refund."
    assert tool_msgs(llm.calls[1])[0]["content"].startswith("DENIED")


def test_gate3_no_approver_means_denied():
    llm = ScriptedLLM([reply(calls=[tc("issue_refund", order="A1")]), reply("no")])
    Agent(llm, {"issue_refund": lambda order: "ok"}, requires_approval={"issue_refund"}).run("x")
    assert tool_msgs(llm.calls[1])[0]["content"].startswith("DENIED")


def test_gate3_side_effect_idempotent_within_run():
    refunds, asked = [], []

    def approver(name, args):
        asked.append(args)
        return True

    llm = ScriptedLLM([
        reply(calls=[tc("issue_refund", order="A1")]),
        reply(calls=[tc("issue_refund", order="A1")]),  # model retries the same call
        reply(calls=[tc("issue_refund", order="B2")]),  # different args: new action
        reply("done"),
    ])
    Agent(llm, {"issue_refund": lambda order: (refunds.append(order), f"refunded {order}")[1]},
          requires_approval={"issue_refund"}, approver=approver).run("go")
    assert refunds == ["A1", "B2"] and len(asked) == 2
    assert tool_msgs(llm.calls[2])[-1]["content"] == "refunded A1"  # cached result returned


def test_gate3_read_only_tools_are_not_cached():
    n = []
    llm = ScriptedLLM([reply(calls=[tc("f")]), reply(calls=[tc("f")]), reply("ok")])
    Agent(llm, {"f": lambda: n.append(1) or "x"}).run("go")
    assert len(n) == 2


# ---------------- Gate 4: parallelism, timeouts, observability, evals ----------------
def test_gate4_parallel_tool_calls_preserve_order():
    def slow(tag):
        time.sleep(0.25)
        return tag

    llm = ScriptedLLM([reply(calls=[tc("slow", tag="a"), tc("slow", tag="b"), tc("slow", tag="c")]),
                       reply("ok")])
    t0 = time.time()
    Agent(llm, {"slow": slow}).run("go")
    assert time.time() - t0 < 0.6  # ~0.25s parallel, 0.75s serial
    assert [m["content"] for m in tool_msgs(llm.calls[1])] == ["a", "b", "c"]


def test_gate4_tool_timeout_does_not_block_other_calls():
    def hang():
        time.sleep(0.4)
        return "late"

    llm = ScriptedLLM([reply(calls=[tc("hang"), tc("fast")]), reply("ok")])
    t0 = time.time()
    Agent(llm, {"hang": hang, "fast": lambda: "quick"}, tool_timeout=0.05).run("go")
    assert time.time() - t0 < 0.3
    tm = tool_msgs(llm.calls[1])
    assert "timed out" in tm[0]["content"] and tm[1]["content"] == "quick"


def test_gate4_trace():
    def bad():
        raise RuntimeError("x")

    llm = ScriptedLLM([reply(calls=[tc("ok_tool"), tc("bad")]), reply("done")])
    res = Agent(llm, {"ok_tool": lambda: "fine", "bad": bad}).run("go")
    assert res.trace == [
        {"step": 1, "type": "llm"},
        {"step": 1, "type": "tool", "name": "ok_tool", "ok": True},
        {"step": 1, "type": "tool", "name": "bad", "ok": False},
        {"step": 2, "type": "llm"},
    ]


def test_gate4_eval_harness():
    from agent import evaluate

    def make_agent(case):
        return Agent(ScriptedLLM(case["script"]), {"lookup": lambda q: "42"})

    cases = [
        {"input": "q1", "script": [reply(calls=[tc("lookup", q="x")]), reply("The answer is 42")],
         "expect_tools": ["lookup"], "expect_contains": "42"},
        {"input": "q2", "script": [reply("I guess 7")],  # never called the tool: should fail
         "expect_tools": ["lookup"], "expect_contains": "42"},
        {"input": "q3", "script": [],  # LLM script exhausted -> exception counted as failure
         "expect_contains": "x"},
    ]
    out = evaluate(make_agent, cases)
    assert out["passed"] == 1 and out["total"] == 3
    assert [f["input"] for f in out["failures"]] == ["q2", "q3"]
    assert out["failures"][0]["reasons"]
