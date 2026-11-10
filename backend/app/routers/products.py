from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.product import ProductModel
from app.schemas.product import ProductResponse, ProductSearchRequest
from app.services.rag_search import semantic_search_products

from app.routers.admin import require_admin_auth

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
def get_products(
    gender: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(ProductModel)
    if gender and gender != "all":
        query = query.filter((ProductModel.gender == gender) | (ProductModel.gender == "unisex"))
    if category and category != "All":
        query = query.filter(ProductModel.category == category)
    return query.all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/search", response_model=List[ProductResponse])
def search_products(body: ProductSearchRequest, db: Session = Depends(get_db)):
    return semantic_search_products(
        db=db,
        query=body.query,
        gender=body.gender or "all",
        category=body.category or "All",
        limit=body.limit or 6,
    )

@router.post("/{product_id}/toggle-stock", response_model=ProductResponse)
def toggle_stock(product_id: str, db: Session = Depends(get_db)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.inStock = not product.inStock
    db.commit()
    db.refresh(product)
    return product

