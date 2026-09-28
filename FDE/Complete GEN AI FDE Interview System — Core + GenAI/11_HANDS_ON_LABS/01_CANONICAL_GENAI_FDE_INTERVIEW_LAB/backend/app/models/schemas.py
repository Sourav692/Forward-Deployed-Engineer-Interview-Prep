from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    user_id: str = Field(..., examples=["u-manager-1"])
    question: str = Field(..., min_length=3)
    prompt_name: str | None = Field(default=None, examples=["sales_account_summary"])
    prompt_version: str | None = Field(default=None, examples=["v1"])
    debug: bool = False


class Citation(BaseModel):
    source_id: str
    title: str
    allowed_roles: list[str]


class AskResponse(BaseModel):
    request_id: str
    user_id: str
    role: str
    intent: str
    answer: str
    citations: list[Citation]
    safety_flags: list[str]
    decision_trace: list[str] = []


class HealthResponse(BaseModel):
    status: str
    app: str


class PromptMetadata(BaseModel):
    name: str
    version: str
    use_case: str
    input_variables: list[str]
    expected_output_format: str
    owner: str
    risk_level: str
    change_history: list[str]
