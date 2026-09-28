from dataclasses import dataclass

@dataclass
class LLMResponse:
    text: str
    provider: str
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0

class LLMProvider:
    name = "base"
    def complete(self, messages: list[dict], timeout_seconds: float = 20.0) -> LLMResponse:
        raise NotImplementedError
