from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.app.dependencies import demo_context
from backend.rag.answer_generator import answer_question
from backend.hitl.approval_policy import ApprovalPolicy
from backend.hitl.review_queue import create_review_request

router = APIRouter()
class ChatRequest(BaseModel):
    question: str
    action_type: str | None = None

@router.post("")
def chat(req: ChatRequest, ctx=Depends(demo_context)):
    answer = answer_question(req.question, ctx)
    policy = ApprovalPolicy().classify(req.action_type or "answer", answer["confidence"])
    if policy["requires_review"]:
        review = create_review_request(ctx, req.action_type or "answer", answer, policy)
        return {"status": "PENDING_REVIEW", "review_request": review, "answer_preview": answer}
    return {"status": "ANSWERED", "answer": answer}
