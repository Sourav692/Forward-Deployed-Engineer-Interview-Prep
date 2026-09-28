from backend.app.services.pii_redaction import contains_unredacted_pii, redact_pii


def test_redacts_email_phone_customer_id_and_account_number():
    text = "Contact John Smith at john.smith@example.com or +49 170 1234567 for CUST-1001 and ACC-987654."
    redacted, flags = redact_pii(text)
    assert "john.smith@example.com" not in redacted
    assert "+49 170 1234567" not in redacted
    assert "CUST-1001" not in redacted
    assert "ACC-987654" not in redacted
    assert "[REDACTED_EMAIL]" in redacted
    assert "[REDACTED_PHONE]" in redacted
    assert "[REDACTED_CUSTOMER_ID]" in redacted
    assert "[REDACTED_ACCOUNT]" in redacted
    assert "email_redacted" in flags
    assert not contains_unredacted_pii(redacted)
