from backend.auth.tenant_context import TenantContext

def demo_context() -> TenantContext:
    return TenantContext(
        user_id="demo_user",
        tenant_id="tenant_a",
        roles=["user", "reviewer"],
        permission_scopes=["public", "support", "sales"],
    )
