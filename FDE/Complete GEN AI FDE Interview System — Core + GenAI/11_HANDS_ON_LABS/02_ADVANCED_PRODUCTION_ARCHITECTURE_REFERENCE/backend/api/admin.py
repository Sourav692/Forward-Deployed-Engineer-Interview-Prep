from fastapi import APIRouter
from backend.db.repositories import repo
router=APIRouter()
@router.get("/audit-log")
def audit_log(): return {"events": repo.audit}
@router.get("/dashboard")
def dashboard(): return {"documents": len(repo.documents), "chunks": len(repo.chunks), "reviews": len(repo.reviews), "audit_events": len(repo.audit)}
