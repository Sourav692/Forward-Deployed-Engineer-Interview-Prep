def generate_sql(question: str, tables: list[str]) -> str:
    return f"SELECT * FROM {tables[0]} LIMIT 50" if tables else "SELECT 1 LIMIT 1"
