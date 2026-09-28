.PHONY: test eval seed lint

test:
	pytest backend/tests -q

eval:
	python backend/evals/ci_quality_gate.py

seed:
	python scripts/seed_demo_data.py

lint:
	python -m compileall backend mcp_server scripts
