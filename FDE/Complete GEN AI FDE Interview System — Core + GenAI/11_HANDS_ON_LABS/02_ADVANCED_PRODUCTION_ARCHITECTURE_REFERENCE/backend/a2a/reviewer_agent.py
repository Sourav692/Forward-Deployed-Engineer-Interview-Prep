def assess_risk(message):
    return {"requires_review": message.risk_level != "low"}
