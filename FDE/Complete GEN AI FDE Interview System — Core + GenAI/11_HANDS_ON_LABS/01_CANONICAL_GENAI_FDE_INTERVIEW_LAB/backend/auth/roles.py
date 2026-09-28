from enum import StrEnum


class Role(StrEnum):
    SALES_REP = "sales_rep"
    SUPPORT_AGENT = "support_agent"
    MANAGER = "manager"
    ADMIN = "admin"


ROLE_HIERARCHY: dict[Role, int] = {
    Role.SALES_REP: 1,
    Role.SUPPORT_AGENT: 1,
    Role.MANAGER: 2,
    Role.ADMIN: 3,
}
