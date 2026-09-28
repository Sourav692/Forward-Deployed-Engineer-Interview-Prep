from abc import ABC, abstractmethod

class EnterpriseConnector(ABC):
    @abstractmethod
    def authenticate(self) -> None: ...
    @abstractmethod
    def fetch_changed_items(self, since_cursor: str | None) -> tuple[list[dict], str | None]: ...
    @abstractmethod
    def fetch_permissions(self, item_id: str) -> list[str]: ...
    @abstractmethod
    def fetch_deleted_items(self, since_cursor: str | None) -> list[str]: ...
    @abstractmethod
    def normalize(self, raw_item: dict) -> dict: ...

class DemoConnector(EnterpriseConnector):
    def __init__(self, tenant_id: str, source_system: str):
        self.tenant_id = tenant_id
        self.source_system = source_system
    def authenticate(self) -> None:
        return None
    def fetch_changed_items(self, since_cursor: str | None):
        return [{"id": "policy_1", "title": "Refund Policy", "body": "Refunds above 20 EUR require human approval. Legal and compliance decisions always require review."}], "cursor_1"
    def fetch_permissions(self, item_id: str) -> list[str]:
        return ["public", "support"]
    def fetch_deleted_items(self, since_cursor: str | None) -> list[str]:
        return []
    def normalize(self, raw_item: dict) -> dict:
        return {"tenant_id": self.tenant_id, "source_system": self.source_system, "source_id": raw_item["id"], "title": raw_item["title"], "content": raw_item["body"]}
