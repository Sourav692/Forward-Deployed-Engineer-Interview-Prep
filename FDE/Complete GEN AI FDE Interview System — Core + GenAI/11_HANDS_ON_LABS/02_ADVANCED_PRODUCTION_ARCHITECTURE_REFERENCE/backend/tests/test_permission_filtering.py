from backend.auth.tenant_context import TenantContext
from backend.auth.permissions import can_access
def test_cross_tenant_denied():
    ctx=TenantContext("u","tenant_a",["user"],["support"])
    assert can_access(ctx,"tenant_a",["support"])
    assert not can_access(ctx,"tenant_b",["support"])
