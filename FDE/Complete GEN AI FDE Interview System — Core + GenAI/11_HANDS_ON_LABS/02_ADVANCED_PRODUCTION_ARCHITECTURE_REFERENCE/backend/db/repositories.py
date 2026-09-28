from dataclasses import dataclass, field
from uuid import uuid4

@dataclass
class InMemoryRepository:
    documents: dict = field(default_factory=dict)
    chunks: dict = field(default_factory=dict)
    reviews: dict = field(default_factory=dict)
    audit: list = field(default_factory=list)

    def add_review(self, item: dict) -> dict:
        item = dict(item)
        item.setdefault("id", f"rev_{uuid4().hex[:8]}")
        item.setdefault("status", "PENDING_REVIEW")
        self.reviews[item["id"]] = item
        return item

repo = InMemoryRepository()
