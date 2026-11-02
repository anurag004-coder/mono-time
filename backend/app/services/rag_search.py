from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.product import ProductModel

def semantic_search_products(
    db: Session,
    query: str,
    gender: str = "all",
    category: str = "All",
    limit: int = 6,
) -> List[ProductModel]:
    """
    RAG Search Agent:
    Retrieves and ranks products using semantic keyword expansion,
    category filters, gender matching, and attribute scoring.
    """
    db_query = db.query(ProductModel)

    if gender and gender != "all":
        db_query = db_query.filter((ProductModel.gender == gender) | (ProductModel.gender == "unisex"))

    if category and category != "All":
        db_query = db_query.filter(ProductModel.category == category)

    all_candidates = db_query.all()
    if not query or not query.strip():
        return all_candidates[:limit]

    tokens = [t.lower() for t in query.split() if len(t) > 1]

    # Keyword weights
    def score_product(p: ProductModel) -> float:
        score = 0.0
        text_corpus = f"{p.title} {p.brand} {p.category} {p.tagline or ''} {p.description} {' '.join(p.shortSpecs or [])}".lower()
        
        for token in tokens:
            if token in p.title.lower():
                score += 5.0
            elif token in p.brand.lower():
                score += 4.0
            elif token in p.category.lower():
                score += 3.5
            elif token in text_corpus:
                score += 1.5

        # Semantic affinity bonus
        if "breathable" in query.lower() or "summer" in query.lower():
            if "mesh" in text_corpus or "slim" in text_corpus or "leather" in text_corpus:
                score += 2.0
        if "formal" in query.lower() or "suit" in query.lower() or "office" in query.lower():
            if "minimalist" in text_corpus or "dress" in text_corpus or "slate" in text_corpus:
                score += 3.0
        if "diver" in query.lower() or "water" in query.lower() or "swimming" in query.lower():
            if "diver" in text_corpus or "300m" in text_corpus:
                score += 4.0
        if "women" in query.lower() or "jewelry" in query.lower():
            if p.gender == "women":
                score += 3.0

        return score

    ranked = sorted(all_candidates, key=score_product, reverse=True)
    return ranked[:limit]
