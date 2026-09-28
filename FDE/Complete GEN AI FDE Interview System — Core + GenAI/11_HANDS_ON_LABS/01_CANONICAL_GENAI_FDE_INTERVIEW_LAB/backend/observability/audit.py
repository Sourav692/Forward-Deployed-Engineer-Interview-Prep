import json
from datetime import datetime, timezone
from pathlib import Path

SENSITIVE_KEYS = {"raw_question", "raw_answer", "full_context"}


def write_audit_event(path: str, event: dict) -> None:
    """Append a safe audit event as JSON Lines.

    Never log raw prompts, raw answers, full retrieved chunks, access tokens, or
    secrets. Audit logs should explain decisions, not become a second data leak.
    """

    safe_event = {key: value for key, value in event.items() if key not in SENSITIVE_KEYS}
    safe_event["timestamp"] = datetime.now(timezone.utc).isoformat()
    audit_path = Path(path)
    audit_path.parent.mkdir(parents=True, exist_ok=True)
    with audit_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(safe_event, sort_keys=True) + "\n")
