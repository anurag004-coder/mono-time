import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.product import ProductModel
from app.models.chat import ChatMessageModel
from app.services.gemini_service import call_gemini_concierge, get_sources_for_response
from app.services.rag_search import semantic_search_products

class SupervisorAgent:
    """
    Supervisor Agent:
    Orchestrates shopper queries across Gemini 1.5 Flash (with Budget Shield),
    Stylist recommendations, and RAG catalog search.
    Accurately discerns catalog recommendations vs specific watch inquiries.
    """

    @classmethod
    def execute(
        cls,
        db: Session,
        user_message: str,
        session_id: str = "session-guest",
        product_id: Optional[str] = None,
        chat_history: Optional[List[dict]] = None,
    ) -> Dict[str, Any]:
        lower = user_message.lower().strip()
        product = None

        # Check if user query is a broad discovery/recommendation query across the boutique
        is_catalog_recommendation = any(k in lower for k in [
            "what watch", "which watch", "recommend", "suggest", "best watch", "best on",
            "watches for", "smaller wrist", "small wrist", "slender wrist", "petite wrist",
            "large wrist", "broad wrist", "collection", "all watches", "women's", "men's"
        ])

        # If user explicitly refers to "this watch" or a specific model title/brand
        explicit_single_target = any(k in lower for k in [
            "this watch", "this piece", "this model", "will it fit", "will this fit", "is it waterproof"
        ])

        # 1. Product targeting
        if "casio" in lower or "edifice" in lower:
            product = db.query(ProductModel).filter(ProductModel.brand == "Casio").first()
        elif "retro" in lower or "a168" in lower:
            product = db.query(ProductModel).filter(ProductModel.id.ilike("%a168%")).first()
        elif "timex" in lower or "waterbury" in lower:
            product = db.query(ProductModel).filter(ProductModel.brand == "Timex").first()
        elif "fossil" in lower or "jacqueline" in lower:
            product = db.query(ProductModel).filter(ProductModel.brand == "Fossil").first()
        elif "raga" in lower:
            product = db.query(ProductModel).filter(ProductModel.title.ilike("%Raga%")).first()
        elif "diver" in lower or "oceanic" in lower:
            product = db.query(ProductModel).filter(ProductModel.category == "Diver").first()
        elif "titan" in lower or "edge" in lower:
            product = db.query(ProductModel).filter(ProductModel.brand == "Titan").first()
        elif product_id and explicit_single_target:
            product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
        elif product_id and not is_catalog_recommendation:
            # Contextual fallback if not asking a multi-watch recommendation query
            product = db.query(ProductModel).filter(ProductModel.id == product_id).first()

        # 2. General store policy/support queries: detach product context
        is_general_support = any(k in lower for k in [
            "track", "order", "status", "shipment", "warranty", "guarantee",
            "return", "exchange", "refund", "authenticity", "authentic", "care",
            "clean", "demagnetiz", "privacy", "security", "watchmaker network",
            "who are you", "what is mono time", "discount", "coupon", "code", "voucher"
        ])
        if is_general_support and not any(b in lower for b in ["casio", "timex", "fossil", "titan", "diver"]):
            product = None

        product_dict = None
        if product:
            product_dict = {
                "id": product.id,
                "title": product.title,
                "brand": product.brand,
                "gender": product.gender,
                "category": product.category,
                "priceINR": product.priceINR,
                "specs": product.specs or {},
                "fitRecommendation": product.fitRecommendation or {},
            }

        # Check for multi-product budget RAG searches (e.g. "show me watches under 20000")
        if any(k in lower for k in ["find watches", "search watches", "show me watches under", "recommend under", "budget", "watches under"]):
            ranked_products = semantic_search_products(db, user_message, limit=3)
            rec_names = [f"• **{p.title}** ({p.brand}, ₹{p.priceINR:,})" for p in ranked_products]
            response_text = (
                f"**Mono Time Search Results:**\n\n"
                f"I discovered {len(ranked_products)} exceptional timepieces matching your search:\n\n"
                + "\n".join(rec_names)
                + f"\n\nWould you like me to inspect the wrist dimensions or case proportions of any specific model?"
            )
            suggested = [
                f"Will the {ranked_products[0].brand} fit a 6.5-inch wrist?" if ranked_products else "Check wrist sizing",
                "Apply MONOTIME10 discount code",
                "Show all Minimalist timepieces",
            ]
            agent_type = "rag"
            sources = [f"Spec sheet: {p.title}" for p in ranked_products]
        else:
            # Query all products for broader context
            all_db_products = db.query(ProductModel).all()
            all_products_list = [
                {
                    "id": p.id,
                    "title": p.title,
                    "brand": p.brand,
                    "gender": p.gender,
                    "category": p.category,
                    "priceINR": p.priceINR,
                    "specs": p.specs or {},
                    "fitRecommendation": p.fitRecommendation or {},
                }
                for p in all_db_products
            ]

            # Dispatch to Gemini AI Concierge / Horology Engine
            response_text, suggested, agent_type = call_gemini_concierge(
                user_message=user_message,
                product_dict=product_dict,
                all_products=all_products_list,
                chat_history=chat_history,
            )
            sources = get_sources_for_response(user_message, product_dict, agent_type)

        # Record messages in DB
        user_msg_id = f"usr-{uuid.uuid4().hex[:8]}"
        agent_msg_id = f"agent-{uuid.uuid4().hex[:8]}"

        db_user_msg = ChatMessageModel(
            id=user_msg_id,
            session_id=session_id,
            sender="user",
            agent_type=None,
            text=user_message,
            attached_product_id=product.id if product else None,
            created_at=datetime.utcnow(),
        )
        db_agent_msg = ChatMessageModel(
            id=agent_msg_id,
            session_id=session_id,
            sender="agent",
            agent_type=agent_type,
            text=response_text,
            attached_product_id=product.id if product else None,
            suggested_prompts=suggested,
            created_at=datetime.utcnow(),
        )
        db.add(db_user_msg)
        db.add(db_agent_msg)
        db.commit()

        return {
            "id": agent_msg_id,
            "sender": "agent",
            "agent_type": agent_type,
            "text": response_text,
            "timestamp": datetime.utcnow().strftime("%I:%M %p"),
            "attached_product": product_dict,
            "suggested_prompts": suggested,
            "sources": sources,
            "confidence": 0.98,
        }
