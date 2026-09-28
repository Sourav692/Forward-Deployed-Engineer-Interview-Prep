.PHONY: install test lint security run docker

install:
	pip install -r requirements.txt

test:
	pytest

lint:
	ruff check backend tests

security:
	bandit -r backend -q

run:
	uvicorn backend.app.main:app --reload

docker:
	docker compose up --build
