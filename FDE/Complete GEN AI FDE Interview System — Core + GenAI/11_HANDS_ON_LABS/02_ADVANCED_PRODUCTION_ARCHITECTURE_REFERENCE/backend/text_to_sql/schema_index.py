def select_relevant_tables(question: str, schema: dict) -> list[str]:
    return list(schema.keys())[:5]
