from dataclasses import dataclass
from backend.auth.roles import Role


@dataclass(frozen=True)
class User:
    user_id: str
    display_name: str
    role: Role


USERS: dict[str, User] = {
    "u-sales-1": User("u-sales-1", "Sana Sales", Role.SALES_REP),
    "u-support-1": User("u-support-1", "Sam Support", Role.SUPPORT_AGENT),
    "u-manager-1": User("u-manager-1", "Maya Manager", Role.MANAGER),
    "u-admin-1": User("u-admin-1", "Ari Admin", Role.ADMIN),
}


def get_user(user_id: str) -> User:
    try:
        return USERS[user_id]
    except KeyError as exc:
        raise ValueError(f"Unknown user_id: {user_id}") from exc
