def requires_approval(sql: str) -> bool:
    return "join" in sql.lower() or "pii" in sql.lower()
