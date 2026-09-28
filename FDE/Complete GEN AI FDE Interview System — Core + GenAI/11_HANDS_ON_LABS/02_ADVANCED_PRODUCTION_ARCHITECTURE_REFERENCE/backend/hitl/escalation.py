def escalation_target(risk_level: str) -> str:
    return "manager" if risk_level == "high" else "reviewer"
