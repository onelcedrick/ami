#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "🚀 Démarrage de tous les services..."

docker compose -f "$ROOT/docker-compose.yml" up -d postgres redis
sleep 3

cd "$ROOT/services/product-service" && ./bin/product &
cd "$ROOT/services/auth-service" && ./bin/auth &
cd "$ROOT/services/cart-service" && ./bin/cart &
cd "$ROOT/services/order-service" && ./bin/order &
cd "$ROOT/services/ticket-service" && ./bin/ticket &
cd "$ROOT/services/api-gateway" && ./bin/gateway &
cd "$ROOT/services/admin-service" && ./bin/admin &

echo "✅ Tous les services sont lancés !"
echo "Gateway: http://localhost:8080"
echo "Products: http://localhost:8082"
echo "Auth: http://localhost:8081"
echo "Cart: http://localhost:8083"
echo "Orders: http://localhost:8084"
echo "Tickets: http://localhost:8085"
echo "Admin: http://localhost:8086"

wait
