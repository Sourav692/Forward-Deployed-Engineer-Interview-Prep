from backend.auth.roles import Role


def can_access(role: Role | str, allowed_roles: list[str]) -> bool:
    """Return True when a role is explicitly allowed to access a document.

    This deliberately avoids implicit hierarchy. In regulated enterprise systems,
    access should usually be explicit and policy-backed, not assumed from title.
    """

    role_value = role.value if isinstance(role, Role) else role
    return role_value in allowed_roles


def explain_denial(role: Role | str, source_id: str) -> str:
    role_value = role.value if isinstance(role, Role) else role
    return f"role={role_value} is not authorized to retrieve source={source_id}"
