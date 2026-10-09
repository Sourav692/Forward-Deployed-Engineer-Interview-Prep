# Level 5: Senior FDE / Staff-Level Scenarios

Problems 41 to 50: the judgment calls a senior forward deployed engineer makes around agent actions, answer quality, incidents and long-running workflows.

| Notebook | Problems | Theory file | What it trains |
| --- | --- | --- | --- |
| [01_agent_action_guardrails.ipynb](01_agent_action_guardrails.ipynb) | 43 Agent Tool Execution Safety; 47 Human-in-the-Loop Approval Queue; 48 Tool-Call Retry Prevention | [01_agent_action_guardrails_THEORY.md](01_agent_action_guardrails_THEORY.md) | Checking an agent's action before it runs: permissions, approvals and safe retries. |
| [02_answer_quality_and_fallback.ipynb](02_answer_quality_and_fallback.ipynb) | 42 Simple Evaluator Scoring; 45 Model Fallback Logic; 46 Hallucination Risk Scoring | [02_answer_quality_and_fallback_THEORY.md](02_answer_quality_and_fallback_THEORY.md) | Scoring answers simply and falling back to backup models without bypassing safety. |
| [03_incident_investigation.ipynb](03_incident_investigation.ipynb) | 41 Group Customer Incidents by Root Cause; 50 Incident Timeline Reconstruction | [03_incident_investigation_THEORY.md](03_incident_investigation_THEORY.md) | Turning messy tickets and logs into clear causes and per-request timelines. |
| [04_workflows_and_deadlines.ipynb](04_workflows_and_deadlines.ipynb) | 44 Multi-Step Workflow State; 49 SLA Breach Detection | [04_workflows_and_deadlines_THEORY.md](04_workflows_and_deadlines_THEORY.md) | Tracking work that spans time, with saved state, expiry and deadline rules. |
