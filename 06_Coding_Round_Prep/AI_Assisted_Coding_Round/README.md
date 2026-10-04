# OpenAI AI-assisted coding round: prep kit (agentic app building)

Start with `ROADMAP_7_DAY.md`.

| File or folder | What it is |
|---|---|
| `ROADMAP_7_DAY.md` | Day-by-day plan with exact library docs and problem IDs, checkpoints, logistics |
| `LIBRARY_MAP.md` | Gumroad library docs ranked for this round (with corrections) |
| `MOCK_PROBLEM_AGENTIC.md` | 60-minute, 4-gate agent-loop mock |
| `RUBRIC.md` | 40-point self-scoring rubric |
| `agentic/` | Starter `agent.py`, provided `fake_llm.py`, `test_agent.py` (25 tests), `solution/` (do not open early) |
| `ledger_drill/` | Credit ledger with expiry: starter, `LEDGER_PROBLEM.md`, `test_ledger.py` (21 tests), `solution/` |
| `AI_PROMPT_PLAYBOOK.md` | How to steer and verify your AI assistant, with example prompts |
| `VERBAL_QA.md` | Answer outlines for likely follow-up questions |
| `SOURCES_AND_CONFIDENCE.md` | What is well supported, what is uncertain, and links |

## Running the kits
```
cd agentic
pip install pytest
pytest -k gate1 -q        # then gate2, gate3, gate4
```
```
cd ledger_drill
pytest -k gate1 -q
```
The solutions pass all tests (25 and 21). If you want to check a solution against the tests, copy the test file and `solution/<file>.py` into a temporary folder and run pytest there. Running from the kit folder uses your own stub or implementation.

The mock and rubric are practice material written for this prep. They are not OpenAI's questions or scoring.
