import re

EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
PHONE_RE = re.compile(r"(?<!\d)(?:\+?\d[\d\s().-]{7,}\d)(?!\d)")
CUSTOMER_ID_RE = re.compile(r"\b(?:CUST|CUS|CUSTOMER)[-_]?[0-9]{3,}\b", re.IGNORECASE)
ACCOUNT_RE = re.compile(r"\b(?:ACC|ACCT|ACCOUNT)[-_]?[0-9]{4,}\b", re.IGNORECASE)
# Practical demo rule: redact two consecutive capitalized words.
PERSON_NAME_RE = re.compile(r"\b([A-Z][a-z]{2,}\s+[A-Z][a-z]{2,})\b")


def redact_pii(text: str) -> tuple[str, list[str]]:
    flags: list[str] = []
    redacted = text

    if EMAIL_RE.search(redacted):
        flags.append("email_redacted")
        redacted = EMAIL_RE.sub("[REDACTED_EMAIL]", redacted)
    if PHONE_RE.search(redacted):
        flags.append("phone_redacted")
        redacted = PHONE_RE.sub("[REDACTED_PHONE]", redacted)
    if CUSTOMER_ID_RE.search(redacted):
        flags.append("customer_id_redacted")
        redacted = CUSTOMER_ID_RE.sub("[REDACTED_CUSTOMER_ID]", redacted)
    if ACCOUNT_RE.search(redacted):
        flags.append("account_number_redacted")
        redacted = ACCOUNT_RE.sub("[REDACTED_ACCOUNT]", redacted)

    # Avoid redacting titles often present in docs.
    def redact_name(match: re.Match[str]) -> str:
        phrase = match.group(1)
        allowlist = {"Support Ticket", "CRM Record", "Refund Policy", "Security Policy", "Internal Policy"}
        org_suffixes = (" Bank", " Retail", " Health", " Systems", " Cloud", " Labs")
        if phrase in allowlist or phrase.endswith(org_suffixes):
            return phrase
        flags.append("possible_name_redacted")
        return "[REDACTED_NAME]"

    redacted = PERSON_NAME_RE.sub(redact_name, redacted)
    return redacted, sorted(set(flags))


def contains_unredacted_pii(text: str) -> bool:
    return any(pattern.search(text) for pattern in [EMAIL_RE, PHONE_RE, CUSTOMER_ID_RE, ACCOUNT_RE])
