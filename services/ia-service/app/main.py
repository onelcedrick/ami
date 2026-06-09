from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, recommendations
import uvicorn

app = FastAPI(
    title="AM Info - IA Service",
    description="Service d'Intelligence Artificielle : Chatbot & Recommandations",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(chat.router, prefix="/api/v1/ia", tags=["Chatbot"])
app.include_router(recommendations.router, prefix="/api/v1/ia", tags=["Recommandations"])

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ia-service",
        "capabilities": [
            "chatbot_ecommerce",
            "product_recommendations",
            "sentiment_analysis",
            "trending_products"
        ]
    }

@app.get("/")
async def root():
    return {
        "message": "AM Info - IA Service",
        "docs": "/docs",
        "endpoints": {
            "chat": "/api/v1/ia/chat",
            "sentiment": "/api/v1/ia/sentiment",
            "recommendations": "/api/v1/ia/recommendations/{user_id}",
            "trending": "/api/v1/ia/trending"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
