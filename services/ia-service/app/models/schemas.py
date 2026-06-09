from pydantic import BaseModel
from typing import List, Optional

# Chatbot
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    confidence: float = 0.95
    intent: Optional[str] = None
    suggestions: Optional[List[str]] = None

# Recommandations
class RecommendationRequest(BaseModel):
    user_id: str
    product_id: Optional[str] = None
    limit: int = 5

class ProductRecommendation(BaseModel):
    product_id: str
    product_name: str
    price: float
    score: float
    reason: str

class RecommendationResponse(BaseModel):
    recommendations: List[ProductRecommendation]
    method: str  # "collaborative", "content-based", "hybrid"
    generated_at: str

# Analyse sentiments tickets
class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: str  # "positive", "negative", "neutral"
    score: float
    urgency_level: str  # "low", "medium", "high"
