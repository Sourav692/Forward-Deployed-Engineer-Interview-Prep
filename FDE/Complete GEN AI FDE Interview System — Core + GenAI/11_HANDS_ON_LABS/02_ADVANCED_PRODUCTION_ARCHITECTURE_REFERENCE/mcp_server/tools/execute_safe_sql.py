"""
STATUS: SAFETY-CONTRACT DEMONSTRATION

This tool demonstrates tenant-context validation and tool-boundary design.
It does not implement a complete external business-system integration.
"""

def run(payload: dict, ctx: dict) -> dict:
    assert ctx.get("tenant_id"), "tenant_id is required"
    return {"ok": True, "payload": payload}
