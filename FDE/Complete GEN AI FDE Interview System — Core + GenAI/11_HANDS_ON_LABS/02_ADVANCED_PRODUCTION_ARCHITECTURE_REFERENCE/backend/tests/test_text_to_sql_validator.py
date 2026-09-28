from backend.text_to_sql.query_validator import validate_sql
def test_blocks_delete(): assert not validate_sql("DELETE FROM users")["allowed"]
def test_allows_limited_select(): assert validate_sql("SELECT * FROM tickets LIMIT 10")["allowed"]
