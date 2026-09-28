from backend.auth.tenant_context import TenantContext

def can_access(ctx: TenantContext, tenant_id: str, required_scopes: list[str]) -> bool:
    if ctx.tenant_id != tenant_id:
        return False
    if "admin" in ctx.roles:
        return True
    return bool(set(ctx.permission_scopes).intersection(required_scopes))

def require_role(ctx: TenantContext, role: str) -> None:
    if role not in ctx.roles and "admin" not in ctx.roles:
        raise PermissionError(f"Missing required role: {role}")
