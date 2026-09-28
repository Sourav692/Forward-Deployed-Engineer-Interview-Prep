from pydantic import BaseModel
from typing import List, Dict

class AskRequest(BaseModel):
    tenant: str
    role: str
    question: str

class AskResponse(BaseModel):
    answer: str
    citations: List[str]
    safe: bool
    detection_signals: List[str]
    audit_event: Dict[str, str]

class ToolRequest(BaseModel):
    tenant: str
    role: str
    tool_name: str
    arguments: Dict[str, str]
