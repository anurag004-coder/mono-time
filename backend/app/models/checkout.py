from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON
from app.database import Base

class CheckoutOrderModel(Base):
    __tablename__ = "checkout_orders"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, nullable=True, index=True)
    amount_inr = Column(Integer, nullable=False)
    discount_code = Column(String, nullable=True)
    discount_percent = Column(Integer, default=0)
    status = Column(String, default="succeeded")  # 'succeeded' | 'declined' | 'pending'
    customer_email = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    shipping_city = Column(String, nullable=True)
    payment_method = Column(String, default="card")  # 'card' | 'upi' | 'cod'
    payment_details = Column(JSON, default=dict)
    items_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
