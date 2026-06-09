import os

# URLs des services
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8082")
ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://localhost:8084")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6380")

# Modèle
MODEL_PATH = os.getenv("MODEL_PATH", "./data")

# Cache TTL
CACHE_TTL = 3600  # 1 heure
