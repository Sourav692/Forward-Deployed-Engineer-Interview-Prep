class ApprovalPolicy:
    always_review = {"refund", "legal_summary", "compliance_decision", "external_email", "sql_query"}
    def classify(self, action_type: str, confidence: float, amount: float | None = None) -> dict:
        if action_type in self.always_review:
            return {"requires_review": True, "risk_level": "high", "policy_reason": f"{action_type} requires human approval"}
        if amount is not None and amount > 20:
            return {"requires_review": True, "risk_level": "high", "policy_reason": "refund amount exceeds automation limit"}
        if confidence < 0.70:
            return {"requires_review": True, "risk_level": "medium", "policy_reason": "low confidence"}
        return {"requires_review": False, "risk_level": "low", "policy_reason": "safe to answer"}
