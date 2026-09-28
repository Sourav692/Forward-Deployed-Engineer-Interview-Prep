from fastapi import APIRouter
from backend.evals.ci_quality_gate import run_quality_gate
router=APIRouter()
@router.post("/run")
def run(): return run_quality_gate()
