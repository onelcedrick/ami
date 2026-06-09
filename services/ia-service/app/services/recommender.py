import numpy as np
from typing import List, Dict
from collections import defaultdict
import random
import json
import os
from datetime import datetime

from app.services.product_client import ProductClient

class RecommendationEngine:
    def __init__(self, product_client: ProductClient):
        self.product_client = product_client
        self.user_history: Dict[str, List[str]] = defaultdict(list)
        self.product_views: Dict[str, int] = defaultdict(int)
        self.load_data()
    
    def load_data(self):
        """Charge les données d'entraînement sauvegardées"""
        data_path = "data/training_data.json"
        if os.path.exists(data_path):
            with open(data_path, "r") as f:
                data = json.load(f)
                self.user_history = defaultdict(list, data.get("user_history", {}))
    
    def save_data(self):
        """Sauvegarde les données"""
        os.makedirs("data", exist_ok=True)
        with open("data/training_data.json", "w") as f:
            json.dump({
                "user_history": dict(self.user_history),
            }, f)
    
    async def get_recommendations(
        self, 
        user_id: str, 
        product_id: str = None, 
        limit: int = 5
    ) -> List[Dict]:
        """
        Système de recommandation hybride :
        1. Content-based : produits similaires (même catégorie)
        2. Popularité : produits les plus vus
        3. Personnalisé : basé sur l'historique utilisateur
        """
        recommendations = []
        used_ids = set()
        
        # 1. Recommandations basées sur le produit consulté
        if product_id:
            similar = await self.product_client.get_similar_products(product_id, limit=3)
            for prod in similar:
                if prod["id"] not in used_ids:
                    recommendations.append({
                        "product_id": prod["id"],
                        "product_name": prod["name"],
                        "price": prod["price"],
                        "score": 0.9,
                        "reason": "Produit similaire"
                    })
                    used_ids.add(prod["id"])
        
        # 2. Historique utilisateur (collaboratif simplifié)
        if user_id in self.user_history:
            user_products = self.user_history[user_id]
            # Trouver d'autres utilisateurs avec goûts similaires
            for other_user, other_products in self.user_history.items():
                if other_user != user_id:
                    common = set(user_products) & set(other_products)
                    if common:
                        # Recommander les produits que l'autre utilisateur a vus
                        unique_to_other = set(other_products) - set(user_products)
                        for pid in list(unique_to_other)[:2]:
                            if pid not in used_ids:
                                product = await self.product_client.get_product(pid)
                                if product:
                                    recommendations.append({
                                        "product_id": product["id"],
                                        "product_name": product["name"],
                                        "price": product["price"],
                                        "score": 0.75,
                                        "reason": "Les clients similaires ont aimé"
                                    })
                                    used_ids.add(product["id"])
        
        # 3. Produits populaires (fallback)
        if len(recommendations) < limit:
            all_products = await self.product_client.get_all_products()
            # Trier par nombre de vues
            sorted_products = sorted(
                all_products, 
                key=lambda x: self.product_views.get(x["id"], 0), 
                reverse=True
            )
            
            for prod in sorted_products:
                if prod["id"] not in used_ids and len(recommendations) < limit:
                    recommendations.append({
                        "product_id": prod["id"],
                        "product_name": prod["name"],
                        "price": prod["price"],
                        "score": 0.6,
                        "reason": "Populaire"
                    })
                    used_ids.add(prod["id"])
        
        # Enregistrer la vue
        if product_id:
            self.user_history[user_id].append(product_id)
            self.product_views[product_id] += 1
            self.save_data()
        
        return recommendations[:limit]
    
    async def get_trending_products(self, limit: int = 10) -> List[Dict]:
        """Retourne les produits tendance basés sur les vues"""
        all_products = await self.product_client.get_all_products()
        
        trending = sorted(
            all_products,
            key=lambda x: self.product_views.get(x["id"], 0),
            reverse=True
        )[:limit]
        
        return [
            {
                "product_id": p["id"],
                "product_name": p["name"],
                "price": p["price"],
                "views": self.product_views.get(p["id"], 0)
            }
            for p in trending
        ]
