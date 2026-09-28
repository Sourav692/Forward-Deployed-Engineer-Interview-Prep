from mcp_server.server import list_tools
def test_mcp_tools_present(): assert "execute_safe_sql" in list_tools()
