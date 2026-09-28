from dataclasses import dataclass

@dataclass(frozen=True)
class TenantContext:
    user_id: str
    tenant_id: str
    roles: list[str]
    permission_scopes: list[str]
    request_id: str = "local-request"
    trace_id: str = "local-trace"
