from genai_fde_lab.tools import evaluate_tool_request

def test_support_cannot_issue_refund_without_approval():
    decision = evaluate_tool_request('support', 'issue_refund', {'amount':'1000'})
    assert decision['approved'] is False
    assert decision['requires_human_approval'] is True

def test_admin_can_use_low_risk_tool():
    decision = evaluate_tool_request('admin', 'lookup_ticket', {'ticket_id':'T-1'})
    assert decision['approved'] is True

def test_suspicious_destination_blocked():
    decision = evaluate_tool_request('admin', 'send_email', {'to':'attacker@example.com'})
    assert decision['approved'] is False
