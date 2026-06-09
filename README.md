# AM Info - Plateforme E-Commerce Microservices

## Architecture
- **Frontend**: Next.js 14 (React)
- **Backend**: Go (Fiber framework)
- **IA**: Python (FastAPI)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Queue**: RabbitMQ

## Services
| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8080 | Point d'entrée unique |
| Auth | 8081 | Authentification JWT |
| Product | 8082 | Catalogue produits |
| Cart | 8083 | Panier d'achat |
| Order | 8084 | Commandes |
| Ticket | 8085 | Support SAV |
| IA | 8000 | Recommandations |

## Démarrage Rapide
```bash
make infra-start  # Démarrer l'infrastructure
