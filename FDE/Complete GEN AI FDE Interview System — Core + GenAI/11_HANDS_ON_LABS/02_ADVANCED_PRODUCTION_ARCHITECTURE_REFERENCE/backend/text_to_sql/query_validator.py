import re
BLOCKED = {"insert", "update", "delete", "drop", "alter", "truncate", "create", "merge", "copy", "grant", "revoke", "call", "exec"}

def validate_sql(sql: str) -> dict:
    normalized = sql.strip().lower()
    tokens = set(re.findall(r"[a-z_]+", normalized))
    if not normalized.startswith("select"):
        return {"allowed": False, "reason": "Only SELECT is allowed"}
    blocked = BLOCKED.intersection(tokens)
    if blocked:
        return {"allowed": False, "reason": f"Blocked SQL tokens: {sorted(blocked)}"}
    if "limit" not in tokens:
        return {"allowed": False, "reason": "Query must include LIMIT"}
    return {"allowed": True, "reason": "Read-only limited query accepted"}
