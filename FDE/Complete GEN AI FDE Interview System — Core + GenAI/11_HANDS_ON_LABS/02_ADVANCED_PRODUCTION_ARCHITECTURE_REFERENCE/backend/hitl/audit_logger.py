from uuid import uuid4
from backend.db.repositories import repo

def audit(ctx, action: str, entity_type: str, entity_id: str, before_state, after_state) -> dict:
    event = {"id": f"aud_{uuid4().hex[:8]}", "tenant_id": ctx.tenant_id, "actor_id": ctx.user_id, "action": action, "entity_type": entity_type, "entity_id": entity_id, "before_state": before_state, "after_state": after_state, "request_id": ctx.request_id, "trace_id": ctx.trace_id}
    repo.audit.append(event)
    return event
