import csv
import json
from pathlib import Path
from backend.auth.roles import Role
from backend.rag.chunking import Chunk, chunk_text

DATA_ROOT = Path(__file__).resolve().parents[2] / "data"


def load_internal_docs(data_root: Path = DATA_ROOT) -> list[Chunk]:
    docs_path = data_root / "internal_docs"
    role_map = {
        "sales_playbook.md": [Role.SALES_REP.value, Role.MANAGER.value, Role.ADMIN.value],
        "refund_policy.md": [Role.SUPPORT_AGENT.value, Role.MANAGER.value, Role.ADMIN.value],
        "security_policy.md": [Role.MANAGER.value, Role.ADMIN.value],
        "onboarding_guide.md": [Role.SALES_REP.value, Role.SUPPORT_AGENT.value, Role.MANAGER.value, Role.ADMIN.value],
    }
    chunks: list[Chunk] = []
    for file_path in sorted(docs_path.glob("*.md")):
        allowed_roles = role_map.get(file_path.name, [Role.ADMIN.value])
        text = file_path.read_text(encoding="utf-8")
        chunks.extend(
            chunk_text(
                source_id=f"doc:{file_path.stem}",
                title=file_path.stem.replace("_", " ").title(),
                text=text,
                allowed_roles=allowed_roles,
                metadata={"source_type": "internal_doc", "file_name": file_path.name},
            )
        )
    return chunks


def load_crm_records(data_root: Path = DATA_ROOT) -> list[Chunk]:
    chunks: list[Chunk] = []
    with (data_root / "crm_records.csv").open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            text = (
                f"Customer {row['customer_name']} has ARR {row['arr_eur']} EUR, renewal date {row['renewal_date']}, "
                f"health score {row['health_score']}, owner {row['account_owner']}, renewal risk {row['renewal_risk']}. "
                f"Notes: {row['notes']}"
            )
            chunks.extend(
                chunk_text(
                    source_id=f"crm:{row['customer_id']}",
                    title=f"CRM Record - {row['customer_name']}",
                    text=text,
                    allowed_roles=[Role.SALES_REP.value, Role.MANAGER.value, Role.ADMIN.value],
                    metadata={"source_type": "crm", "customer_id": row["customer_id"]},
                )
            )
    return chunks


def load_support_tickets(data_root: Path = DATA_ROOT) -> list[Chunk]:
    tickets = json.loads((data_root / "support_tickets.json").read_text(encoding="utf-8"))
    chunks: list[Chunk] = []
    for ticket in tickets:
        text = (
            f"Support ticket {ticket['ticket_id']} for customer {ticket['customer_name']} has priority {ticket['priority']} "
            f"and status {ticket['status']}. Issue: {ticket['issue']}. Latest update: {ticket['latest_update']}."
        )
        chunks.extend(
            chunk_text(
                source_id=f"ticket:{ticket['ticket_id']}",
                title=f"Support Ticket - {ticket['ticket_id']}",
                text=text,
                allowed_roles=[Role.SUPPORT_AGENT.value, Role.MANAGER.value, Role.ADMIN.value],
                metadata={"source_type": "support_ticket", "customer_id": ticket["customer_id"]},
            )
        )
    return chunks


def load_corpus(data_root: Path = DATA_ROOT) -> list[Chunk]:
    return load_internal_docs(data_root) + load_crm_records(data_root) + load_support_tickets(data_root)
