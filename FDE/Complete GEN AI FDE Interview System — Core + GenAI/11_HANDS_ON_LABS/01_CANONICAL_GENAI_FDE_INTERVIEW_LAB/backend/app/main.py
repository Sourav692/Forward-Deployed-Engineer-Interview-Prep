from fastapi import FastAPI, HTTPException
from backend.agents.tools import AgentTools
from backend.agents.workflow import AgentDependencies, EnterpriseAssistantWorkflow
from backend.app.config.settings import get_settings
from backend.app.models.schemas import AskRequest, AskResponse, HealthResponse, PromptMetadata
from backend.app.services.llm_client import GroundedAnswerGenerator
from backend.app.services.prompt_registry import PromptNotFound, PromptRegistry
from backend.observability.logging import configure_logging
from backend.observability.metrics import snapshot

settings = get_settings()
configure_logging(settings.log_level)

workflow = EnterpriseAssistantWorkflow(
    AgentDependencies(
        tools=AgentTools(),
        prompt_registry=PromptRegistry(),
        answer_generator=GroundedAnswerGenerator(),
        audit_log_path=settings.audit_log_path,
        default_prompt_version=settings.default_prompt_version,
    )
)

app = FastAPI(
    title="GenAI FDE Interview Lab",
    description="Production-aware enterprise GenAI assistant lab for FDE interview preparation.",
    version="1.0.0",
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", app="genai-fde-interview-lab")


@app.post("/ask", response_model=AskResponse)
def ask(payload: AskRequest) -> AskResponse:
    try:
        return workflow.run(
            user_id=payload.user_id,
            question=payload.question,
            prompt_name=payload.prompt_name,
            prompt_version=payload.prompt_version,
            debug=payload.debug,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/metrics")
def metrics():
    return snapshot()


@app.get("/prompts/{name}/{version}", response_model=PromptMetadata)
def prompt_metadata(name: str, version: str = "v1") -> PromptMetadata:
    try:
        return PromptRegistry().metadata(name, version)
    except PromptNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
