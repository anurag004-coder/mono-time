from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from app.database import Base

class PitchEventModel(Base):
    __tablename__ = "pitches_generated"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, nullable=True, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    product_name = Column(String, nullable=False)
    gender = Column(String, default="unisex")
    trigger_type = Column(String, default="exit_intent")  # 'exit_intent' | 'idle_dwell' | 'cart_hesitation'
    offer = Column(String, nullable=False)
    code = Column(String, nullable=False)
    clicked = Column(Boolean, default=False)
    converted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
