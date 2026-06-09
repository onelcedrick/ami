from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime

from app.models.schemas import RecommendationResponse, ProductRecommendation
from app.services.recommender import RecommendationEngine
from app.services.product_client import ProductClient

router = APIRouter()

# Initialisation
product_client = ProductClient()
recommender = RecommendationEngine(product_client)

@router.get("/recommendations/{user_id}", response_model=RecommendationResponse)
async def get_recommendations(
    user_id: str,
    product_id: Optional[str] = Query(None),
    limit: int = Query(5, le=20)
):
    """Recommandations personnalisées pour un utilisateur"""
    try:
        recs = await recommender.get_recommendations(user_id, product_id, limit)
        
        return RecommendationResponse(
            recommendations=[ProductRecommendation(**r) for r in recs],
            method="hybrid" if product_id else "collaborative",
            generated_at=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
async def get_trending(limit: int = Query(10, le=50)):
    """Produits tendance"""
    try:
        trending = await recommender.get_trending_products(limit)
        return {"trending": trending, "updated_at": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
