HIGH_RISK_TOOLS = {'issue_refund', 'send_email', 'update_customer_status', 'export_records'}
ALLOWED_ROLES = {'admin'}

def evaluate_tool_request(role: str, tool_name: str, arguments: dict):
    if tool_name in HIGH_RISK_TOOLS and role not in ALLOWED_ROLES:
        return {'approved': False, 'requires_human_approval': True, 'reason': 'High-risk tool requires admin or human approval.'}
    if any('attacker' in str(v).lower() for v in arguments.values()):
        return {'approved': False, 'requires_human_approval': True, 'reason': 'Suspicious destination or argument detected.'}
    return {'approved': True, 'requires_human_approval': False, 'reason': 'Allowed by role and policy.'}
