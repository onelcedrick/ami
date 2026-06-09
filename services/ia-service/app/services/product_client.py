import httpx
from typing import List, Dict, Optional
from app.config import PRODUCT_SERVICE_URL
import asyncio

class ProductClient:
    def __init__(self):
        self.base_url = PRODUCT_SERVICE_URL
        self.cache: Dict = {}
    
    async def get_all_products(self) -> List[Dict]:
        """Récupère tous les produits du catalogue"""
        cache_key = "all_products"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/api/v1/products",
                    params={"limit": 100}
                )
                if response.status_code == 200:
                    data = response.json()
                    products = data.get("data", [])
                    self.cache[cache_key] = products
                    return products
            except Exception as e:
                print(f"❌ Erreur Product Service: {e}")
        return []
    
    async def get_product(self, product_id: str) -> Optional[Dict]:
        """Récupère un produit par ID"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/api/v1/products/{product_id}"
                )
                if response.status_code == 200:
                    return response.json()
            except Exception:
                pass
        return None
    
    async def get_similar_products(self, product_id: str, limit: int = 5) -> List[Dict]:
        """Trouve des produits similaires (même catégorie)"""
        product = await self.get_product(product_id)
        if not product:
            return []
        
        category_id = product.get("category_id")
        all_products = await self.get_all_products()
        
        # Filtrer par catégorie et exclure le produit lui-même
        similar = [
            p for p in all_products 
            if p.get("category_id") == category_id and p["id"] != product_id
        ]
        
        return similar[:limit]
