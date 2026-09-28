from enum import StrEnum


class Intent(StrEnum):
    SALES_ACCOUNT_SUMMARY = "sales_account_summary"
    SUPPORT_POLICY = "support_policy"
    SECURITY_POLICY = "security_policy"
    INCIDENT_TRIAGE = "incident_triage_summary"
    GENERAL_KNOWLEDGE = "general_knowledge"


def classify_intent(question: str) -> Intent:
    q = question.lower()
    if any(term in q for term in ["renewal", "account", "risk", "customer"]):
        return Intent.SALES_ACCOUNT_SUMMARY
    if any(term in q for term in ["refund", "ticket", "support", "response"]):
        return Intent.SUPPORT_POLICY
    if any(term in q for term in ["security", "soc2", "incident escalation", "admin-only"]):
        return Intent.SECURITY_POLICY
    if any(term in q for term in ["outage", "latency", "incident", "triage"]):
        return Intent.INCIDENT_TRIAGE
    return Intent.GENERAL_KNOWLEDGE


def retrieval_required(intent: Intent) -> bool:
    return intent != Intent.GENERAL_KNOWLEDGE


def prompt_name_for_intent(intent: Intent) -> str:
    mapping = {
        Intent.SALES_ACCOUNT_SUMMARY: "sales_account_summary",
        Intent.SUPPORT_POLICY: "customer_support_response",
        Intent.SECURITY_POLICY: "internal_policy_answer",
        Intent.INCIDENT_TRIAGE: "incident_triage_summary",
        Intent.GENERAL_KNOWLEDGE: "internal_policy_answer",
    }
    return mapping[intent]
