import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from backend.evals.rag_eval import run_rag_eval
from backend.evals.permission_eval import run_permission_eval
from backend.evals.safety_eval import run_safety_eval

def run_quality_gate() -> dict:
    results = {"rag": run_rag_eval(), "permission": run_permission_eval(), "safety": run_safety_eval()}
    return {"passed": all(r["passed"] for r in results.values()), "results": results}

if __name__ == "__main__":
    result = run_quality_gate()
    print(result)
    raise SystemExit(0 if result["passed"] else 1)
