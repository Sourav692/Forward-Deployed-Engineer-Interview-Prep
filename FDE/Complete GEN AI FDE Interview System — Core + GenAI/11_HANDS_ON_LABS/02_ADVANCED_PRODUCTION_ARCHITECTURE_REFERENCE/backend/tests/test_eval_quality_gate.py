from backend.evals.ci_quality_gate import run_quality_gate
def test_quality_gate_passes(): assert run_quality_gate()["passed"]
