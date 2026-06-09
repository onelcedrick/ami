from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse, SentimentRequest, SentimentResponse
from app.services.chatbot import EcommerceChatbot

router = APIRouter()
chatbot = EcommerceChatbot()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chatbot e-commerce"""
    try:
        result = chatbot.get_response(request.message, request.user_id)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sentiment", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """Analyse le sentiment d'un message"""
    try:
        result = chatbot.analyze_sentiment(request.text)
        return SentimentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
