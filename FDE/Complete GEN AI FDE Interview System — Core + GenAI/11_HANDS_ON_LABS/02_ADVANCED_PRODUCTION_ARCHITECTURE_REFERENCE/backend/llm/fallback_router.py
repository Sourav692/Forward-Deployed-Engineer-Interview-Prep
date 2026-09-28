from backend.llm.local_mock_provider import LocalMockProvider

class FallbackRouter:
    def __init__(self, providers=None):
        self.providers = providers or [LocalMockProvider()]
    def complete(self, messages: list[dict], timeout_seconds: float = 20.0):
        for provider in self.providers:
            try:
                return provider.complete(messages, timeout_seconds)
            except Exception:
                continue
        return LocalMockProvider().complete(messages, timeout_seconds)
