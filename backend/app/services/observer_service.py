import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.product import ProductModel
from app.models.pitch import PitchEventModel
from app.config import settings

def evaluate_exit_intent(
    db: Session,
    session_id: str,
    product_id: str,
    mouse_y: int = 0,
    time_on_page: int = 0,
    trigger_type: str = "exit_intent",
) -> Dict[str, Any]:
    """
    Observer Agent:
    Evaluates exit signals and triggers personalized conversion pitches for high-value items.
    """
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        return {"should_trigger": False, "reason": "Product not found"}

    # Check if already pitched in this session for this product
    existing_pitch = (
        db.query(PitchEventModel)
        .filter(PitchEventModel.session_id == session_id, PitchEventModel.product_id == product_id)
        .first()
    )
    if existing_pitch:
        return {
            "should_trigger": False,
            "reason": "Pitch already generated for this product in current session",
            "pitch_id": existing_pitch.id,
        }

    # Signal evaluation
    mouse_leaving = mouse_y < 50
    idle_time_met = time_on_page >= settings.EXIT_INTENT_DWELL_SECONDS
    is_high_value = product.priceINR >= settings.HIGH_VALUE_THRESHOLD_INR

    # Force allow if client triggered via explicit hesitation/dwell
    should_trigger = (
        (mouse_leaving or idle_time_met or trigger_type in ["idle_dwell", "cart_hesitation"])
        and is_high_value
    )

    if not should_trigger:
        return {
            "should_trigger": False,
            "reason": f"Signal thresholds not satisfied (high_value={is_high_value}, mouse_leaving={mouse_leaving})",
        }

    # Generate custom pitch
    pitch_id = f"pe-{uuid.uuid4().hex[:8]}"
    if product.gender == "women":
        offer = f"{settings.DEFAULT_DISCOUNT_PERCENT}% Mono Time Privilege Savings + Complimentary Velvet Travel Pouch"
        code = "MONOTIME10"
    else:
        offer = f"{settings.DEFAULT_DISCOUNT_PERCENT}% Exclusive Mono Time Welcome + Free Stainless Sizing Tool"
        code = settings.DEFAULT_COUPON_CODE

    pitch_record = PitchEventModel(
        id=pitch_id,
        session_id=session_id,
        product_id=product.id,
        product_name=product.title,
        gender=product.gender,
        trigger_type=trigger_type,
        offer=offer,
        code=code,
        clicked=False,
        converted=False,
        created_at=datetime.utcnow(),
    )
    db.add(pitch_record)
    db.commit()

    return {
        "should_trigger": True,
        "id": pitch_id,
        "timestamp": "Just now",
        "product_id": product.id,
        "product_name": product.title,
        "gender": product.gender,
        "trigger_type": trigger_type,
        "offer": offer,
        "code": code,
        "clicked": False,
        "converted": False,
        "reason": "High-value intent detected with exit signal",
    }
