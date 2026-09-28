from pydantic import BaseModel

class AgentMessage(BaseModel):
    request_id: str
    trace_id: str
    tenant_id: str
    sender: str
    receiver: str
    task_type: str
    payload: dict
    risk_level: str = "low"
