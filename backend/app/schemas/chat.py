from typing import List, Optional
from pydantic import BaseModel
from app.schemas.product import ProductResponse

class ChatMessageRequest(BaseModel):
    session_id: Optional[str] = "session-guest"
    message: str
    product_id: Optional[str] = None
    chat_history: Optional[List[dict]] = []

class ChatMessageResponse(BaseModel):
    id: str
    sender: str = "agent"
    agent_type: str = "stylist"  # 'supervisor' | 'stylist' | 'rag'
    text: str
    timestamp: str
    attached_product: Optional[ProductResponse] = None
    suggested_prompts: List[str] = []
    sources: List[str] = []
    confidence: float = 0.95
