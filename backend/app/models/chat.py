from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from app.database import Base

class ChatMessageModel(Base):
    __tablename__ = "chat_history"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, nullable=True, index=True)
    sender = Column(String, nullable=False)  # 'user' | 'agent'
    agent_type = Column(String, nullable=True)  # 'supervisor' | 'stylist' | 'rag'
    text = Column(Text, nullable=False)
    attached_product_id = Column(String, ForeignKey("products.id"), nullable=True)
    suggested_prompts = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
