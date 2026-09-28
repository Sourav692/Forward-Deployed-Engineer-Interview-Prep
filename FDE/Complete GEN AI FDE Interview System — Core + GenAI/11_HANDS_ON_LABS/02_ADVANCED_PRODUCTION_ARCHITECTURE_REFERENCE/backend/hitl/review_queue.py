from backend.db.repositories import repo
from backend.hitl.audit_logger import audit

REVIEW_STATES = {"PENDING_REVIEW", "APPROVED", "APPROVED_WITH_EDITS", "REJECTED", "ESCALATED", "EXPIRED", "EXECUTED", "FAILED_EXECUTION", "ROLLED_BACK"}

def create_review_request(ctx, action_type: str, ai_recommendation: dict, policy: dict) -> dict:
    item = repo.add_review({"tenant_id": ctx.tenant_id, "created_by": ctx.user_id, "action_type": action_type, "ai_recommendation": ai_recommendation, "risk_level": policy["risk_level"], "policy_reason": policy["policy_reason"], "confidence_score": ai_recommendation.get("confidence", 0.0)})
    audit(ctx, "CREATE_REVIEW", "review_request", item["id"], None, item)
    return item

def list_reviews(ctx) -> list[dict]:
    return [r for r in repo.reviews.values() if r["tenant_id"] == ctx.tenant_id]

def decide_review(ctx, review_id: str, decision: str, edited_payload=None, override_reason: str | None = None) -> dict:
    item = repo.reviews[review_id]
    before = dict(item)
    item["status"] = decision.upper()
    item["edited_payload"] = edited_payload
    item["override_reason"] = override_reason
    audit(ctx, f"REVIEW_{decision.upper()}", "review_request", review_id, before, item)
    return item
