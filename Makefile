.PHONY: up down build logs clean migrate seed test lint format

# Docker commands
up:
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

down-v:
	docker compose down -v

build:
	docker compose build

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f db

# Backend commands
migrate:
	docker compose exec backend alembic upgrade head

seed:
	docker compose exec backend python scripts/seed_data.py

test:
	docker compose exec backend pytest

lint:
	docker compose exec backend ruff check .

format:
	docker compose exec backend ruff format .

# Frontend commands
lint-frontend:
	docker compose exec frontend npm run lint

# Utility
clean:
	docker compose down -v --rmi local
	docker system prune -f

shell-backend:
	docker compose exec backend /bin/bash

shell-db:
	docker compose exec db psql -U postgres -d techinsight
