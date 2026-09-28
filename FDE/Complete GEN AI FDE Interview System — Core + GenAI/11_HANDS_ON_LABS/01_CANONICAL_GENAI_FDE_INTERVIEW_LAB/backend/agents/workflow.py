from dataclasses import dataclass
from time import perf_counter
from backend.agents.guardrails import safe_failure_response, validate_grounding
from backend.agents.planner import classify_intent, prompt_name_for_intent, retrieval_required
from backend.agents.tools import AgentTools
from backend.app.models.schemas import AskResponse, Citation
from backend.app.services.llm_client import GroundedAnswerGenerator, LLMTimeout
from backend.app.services.prompt_registry import PromptNotFound, PromptRegistry
from backend.auth.users import get_user
from backend.observability import metrics
from backend.observability.audit import write_audit_event
from backend.observability.logging import log_event
from backend.observability.tracing import new_request_id


@dataclass
class AgentDependencies:
    tools: AgentTools
    prompt_registry: PromptRegistry
    answer_generator: GroundedAnswerGenerator
    audit_log_path: str
    default_prompt_version: str = "v1"


class EnterpriseAssistantWorkflow:
    def __init__(self, deps: AgentDependencies):
        self.deps = deps

    def run(self, user_id: str, question: str, prompt_name: str | None = None, prompt_version: str | None = None, debug: bool = False) -> AskResponse:
        start = perf_counter()
        request_id = new_request_id()
        trace: list[str] = ["request_received"]
        safety_flags: list[str] = []
        citations: list[Citation] = []
        intent = classify_intent(question)
        trace.append(f"intent={intent.value}")

        try:
            user = get_user(user_id)
            selected_prompt_name = prompt_name or prompt_name_for_intent(intent)
            selected_prompt_version = prompt_version or self.deps.default_prompt_version
            prompt = self.deps.prompt_registry.load(selected_prompt_name, selected_prompt_version)
            trace.append(f"prompt={selected_prompt_name}:{selected_prompt_version}")

            if not retrieval_required(intent):
                metrics.increment("no_retrieval_required")
                answer = safe_failure_response("no_context")
                safety_flags.append("retrieval_required_for_enterprise_answers")
                ranked_chunks = []
            else:
                retrieval = self.deps.tools.retrieve(question, user.role)
                trace.extend(retrieval.retrieval_notes)
                if retrieval.used_fallback:
                    safety_flags.append("retrieval_fallback_used")
                ranked_chunks = retrieval.ranked_chunks
                if not ranked_chunks:
                    answer = safe_failure_response("permission_denied" if intent.value == "security_policy" else "no_context")
                    safety_flags.append("permission_denied" if intent.value == "security_policy" else "no_context")
                elif intent.value == "security_policy" and not any("security_policy" in item.chunk.source_id for item in ranked_chunks):
                    answer = safe_failure_response("permission_denied")
                    safety_flags.append("permission_denied")
                    ranked_chunks = []
                else:
                    answer = self.deps.answer_generator.generate(question, ranked_chunks, prompt)

            answer, pii_flags = self.deps.tools.redact(answer)
            safety_flags.extend(pii_flags)
            safety_flags.extend(validate_grounding(answer, ranked_chunks))

            if "unredacted_pii_in_answer" in safety_flags:
                answer = safe_failure_response("pii_detected")

            for item in ranked_chunks:
                citations.append(
                    Citation(
                        source_id=item.chunk.source_id,
                        title=item.chunk.title,
                        allowed_roles=item.chunk.allowed_roles,
                    )
                )

            response = AskResponse(
                request_id=request_id,
                user_id=user.user_id,
                role=user.role.value,
                intent=intent.value,
                answer=answer,
                citations=citations,
                safety_flags=sorted(set(safety_flags)),
                decision_trace=trace if debug else [],
            )
            metrics.increment("ask_success")
            return response

        except PromptNotFound:
            metrics.increment("invalid_prompt")
            safety_flags.append("invalid_prompt")
            role = "unknown"
            try:
                role = get_user(user_id).role.value
            except ValueError:
                safety_flags.append("unknown_user")
            return AskResponse(
                request_id=request_id,
                user_id=user_id,
                role=role,
                intent=intent.value,
                answer=safe_failure_response("invalid_prompt"),
                citations=[],
                safety_flags=safety_flags,
                decision_trace=trace if debug else [],
            )
        except LLMTimeout:
            metrics.increment("llm_timeout")
            user = get_user(user_id)
            return AskResponse(
                request_id=request_id,
                user_id=user_id,
                role=user.role.value,
                intent=intent.value,
                answer=safe_failure_response("llm_timeout"),
                citations=[],
                safety_flags=["llm_timeout"],
                decision_trace=trace if debug else [],
            )
        finally:
            elapsed_ms = round((perf_counter() - start) * 1000, 2)
            metrics.record_latency_ms(elapsed_ms)
            log_event("ask_completed", request_id=request_id, user_id=user_id, intent=intent.value, elapsed_ms=elapsed_ms)
            write_audit_event(
                self.deps.audit_log_path,
                {
                    "event": "ask_completed",
                    "request_id": request_id,
                    "user_id": user_id,
                    "intent": intent.value,
                    "elapsed_ms": elapsed_ms,
                    "safety_flags": safety_flags,
                },
            )
