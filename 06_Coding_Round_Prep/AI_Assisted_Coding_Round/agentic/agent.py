"""Starter file. Build the agent gate by gate.

Run one gate at a time:  pytest -k gate1   (then gate2, gate3, gate4)

Gate 1 target API (later gates add keyword args and new names):

    agent = Agent(llm, tools, system="You are a helpful agent.", max_steps=8)
    result = agent.run("What's the weather in Pune?")   # -> AgentResult
    result.final, result.steps, result.messages

`tools` is a dict: tool name -> plain Python callable taking keyword arguments.
"""
from dataclasses import dataclass, field


class MaxStepsExceeded(Exception):
    pass


@dataclass
class AgentResult:
    final: str
    steps: int
    messages: list
    tokens: int = 0
    trace: list = field(default_factory=list)


class Agent:
    def __init__(self, llm, tools, system="You are a helpful agent.", max_steps=8):
        raise NotImplementedError

    def run(self, user_message):
        raise NotImplementedError
