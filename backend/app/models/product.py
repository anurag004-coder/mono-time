from sqlalchemy import Column, String, Integer, Float, Boolean, Text, JSON
from app.database import Base

class ProductModel(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=False, index=True)
    gender = Column(String, nullable=False, index=True)  # 'men' | 'women' | 'unisex'
    category = Column(String, nullable=False, index=True)
    priceINR = Column(Integer, nullable=False)
    priceUSD = Column(Integer, nullable=False, default=0)
    originalPriceINR = Column(Integer, nullable=True)
    image = Column(String, nullable=False)
    badge = Column(String, nullable=True)
    isHero = Column(Boolean, default=False)
    tagline = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    shortSpecs = Column(JSON, default=list)
    specs = Column(JSON, default=dict)
    fitRecommendation = Column(JSON, default=dict)
    inStock = Column(Boolean, default=True)
    rating = Column(Float, default=4.8)
    reviewsCount = Column(Integer, default=100)
