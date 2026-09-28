from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.app.dependencies import demo_context
from backend.hitl.review_queue import list_reviews, decide_review

router = APIRouter()
class ReviewDecision(BaseModel):
    decision: str
    edited_payload: dict | None = None
    override_reason: str | None = None

@router.get('/queue')
def queue(ctx=Depends(demo_context)):
    return {"items": list_reviews(ctx)}

@router.post('/{review_id}/decision')
def decision(review_id: str, req: ReviewDecision, ctx=Depends(demo_context)):
    return decide_review(ctx, review_id, req.decision, req.edited_payload, req.override_reason)
