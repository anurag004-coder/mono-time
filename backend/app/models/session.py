from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from app.database import Base

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    current_product_id = Column(String, ForeignKey("products.id"), nullable=True)
    total_dwell_seconds = Column(Integer, default=0)
    exit_signals_detected = Column(Integer, default=0)
    user_metadata = Column(JSON, default=dict)

class ProductViewModel(Base):
    __tablename__ = "product_views"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"), index=True)
    product_id = Column(String, ForeignKey("products.id"), index=True)
    viewed_at = Column(DateTime, default=datetime.utcnow)
    dwell_seconds = Column(Integer, default=0)
    scroll_depth = Column(Float, default=0.0)
    added_to_cart = Column(Boolean, default=False)
