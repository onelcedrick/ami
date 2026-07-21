#!/bin/bash
echo "🚀 Démarrage de tous les services..."

# Infrastructure
docker compose up -d postgres redis
sleep 3

# Services Go en arrière-plan
cd services/product-service && ./bin/product-service &
cd services/auth-service && ./bin/auth-service &
cd services/cart-service && ./bin/cart-service &
cd services/order-service && ./bin/order-service &
cd services/ticket-service && ./bin/ticket-service &
cd services/api-gateway && ./bin/gateway &
cd admin-service && ./bin/admin-service &

echo "✅ Tous les services sont lancés !"
echo "Gateway: http://localhost:8080"
echo "Products: http://localhost:8082"
echo "Auth: http://localhost:8081"
echo "Cart: http://localhost:8083"
echo "Orders: http://localhost:8084"
echo "Tickets: http://localhost:8085"
echo "Admin: http://localhost:8086"

# Garder le script en vie
wait
