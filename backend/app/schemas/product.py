from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class ProductSpecs(BaseModel):
    caseDiameter: Optional[str] = None
    caseThickness: Optional[str] = None
    lugToLug: Optional[str] = None
    waterResistance: Optional[str] = None
    movement: Optional[str] = None
    dialColor: Optional[str] = None
    strapMaterial: Optional[str] = None
    glass: Optional[str] = None
    clasp: Optional[str] = None
    warranty: Optional[str] = None

class FitRecommendation(BaseModel):
    recommendedWristMin: float
    recommendedWristMax: float
    fitNotes: str

class ProductBase(BaseModel):
    id: str
    title: str
    brand: str
    gender: str
    category: str
    priceINR: int
    priceUSD: Optional[int] = 0
    originalPriceINR: Optional[int] = None
    image: str
    badge: Optional[str] = None
    isHero: Optional[bool] = False
    tagline: Optional[str] = None
    description: str
    shortSpecs: List[str] = []
    specs: Dict[str, Any] = {}
    fitRecommendation: Dict[str, Any] = {}
    inStock: Optional[bool] = True
    rating: Optional[float] = 4.8
    reviewsCount: Optional[int] = 100

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

class ProductSearchRequest(BaseModel):
    query: str
    gender: Optional[str] = "all"
    category: Optional[str] = "All"
    limit: Optional[int] = 6
