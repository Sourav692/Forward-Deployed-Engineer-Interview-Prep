from backend.llm.provider_interface import LLMProvider, LLMResponse

class OpenAIProvider(LLMProvider):
    name = "openai"
    def __init__(self, api_key: str | None, model: str):
        self.api_key = api_key
        self.model = model
    def complete(self, messages: list[dict], timeout_seconds: float = 20.0) -> LLMResponse:
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        raise NotImplementedError("Wire the official provider SDK here for a real deployment")
