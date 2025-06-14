.PHONY: build start stop up down prune logs

build:
	docker compose build

start:
	docker compose up -d

stop:
	docker compose stop

up:
	docker compose up --build

down:
	docker compose down -v

logs:
	docker compose logs -f --tail=100 consumer

prune:
	docker system prune -af --volumes