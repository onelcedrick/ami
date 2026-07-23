.PHONY: help infra-start infra-stop dev build clean

help:
	@echo "Commandes AM Info:"
	@echo "  make infra-start  - Démarrer PostgreSQL, Redis, RabbitMQ"
	@echo "  make infra-stop   - Arrêter l'infrastructure"
	@echo "  make dev          - Mode développement"
	@echo "  make build        - Builder tous les services"
	@echo "  make clean        - Nettoyer"

infra-start:
	@echo "🚀 Démarrage infrastructure..."
	docker compose up -d postgres redis rabbitmq mailhog
	@echo "✅ Infrastructure prête!"
	@echo "PostgreSQL: localhost:5433"
	@echo "Redis: localhost:6380"
	@echo "RabbitMQ: localhost:5673 (UI: http://localhost:15673)"
	@echo "MailHog: http://localhost:8026"

infra-stop:
	docker compose down

dev:
	@echo "🚀 Démarrage développement..."
	docker compose up -d

build:
	@echo "🔨 Build services Go..."
	cd services/api-gateway && go build -o bin/gateway cmd/main.go
	cd services/auth-service && go build -o bin/auth cmd/main.go
	cd services/product-service && go build -o bin/product cmd/main.go
	cd services/cart-service && go build -o bin/cart cmd/main.go
	cd services/order-service && go build -o bin/order cmd/main.go
	cd services/ticket-service && go build -o bin/ticket cmd/main.go
	cd services/admin-service && go build -o bin/admin cmd/main.go

clean:
	docker compose down -v
	rm -rf services/*/bin
	rm -rf frontend/.next
	rm -rf frontend/node_modules
