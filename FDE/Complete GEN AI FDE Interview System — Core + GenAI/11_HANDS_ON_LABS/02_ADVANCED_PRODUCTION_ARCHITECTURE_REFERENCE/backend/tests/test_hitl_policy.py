from backend.hitl.approval_policy import ApprovalPolicy
def test_refund_requires_review():
    assert ApprovalPolicy().classify("refund", 0.95)["requires_review"]
