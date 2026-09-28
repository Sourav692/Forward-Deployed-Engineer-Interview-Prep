from backend.llm.provider_interface import LLMProvider, LLMResponse

class LocalMockProvider(LLMProvider):
    name = "mock"
    def complete(self, messages: list[dict], timeout_seconds: float = 20.0) -> LLMResponse:
        question = " ".join(m.get("content", "") for m in messages if m.get("role") == "user")
        return LLMResponse(text=f"Mock grounded answer for: {question[:100]}", provider="mock", model="local-mock", input_tokens=80, output_tokens=40)
