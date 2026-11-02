import time
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.pitch import PitchEventModel
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.schemas.pitch import ExitIntentCheckRequest, PitchClaimRequest
from app.services.agent_graph import SupervisorAgent
from app.services.observer_service import evaluate_exit_intent
from app.services.rate_limiter import ip_rate_limiter, budget_shield

router = APIRouter(prefix="", tags=["Autonomous Agents"])

def get_client_ip(request: Request) -> str:
    """Extract real client IP even behind Cloudflare tunnel or reverse proxies."""
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()
    x_forwarded = request.headers.get("x-forwarded-for")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "127.0.0.1"

@router.post("/agent/chat", response_model=ChatMessageResponse)
def chat_with_agent(body: ChatMessageRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = get_client_ip(request)
    allowed, rate_msg = ip_rate_limiter.is_allowed(client_ip)

    if not allowed:
        return ChatMessageResponse(
            id=f"rate-{int(time.time())}",
            sender="agent",
            agent_type="concierge",
            text=(
                f"**Mono Time Atelier Notice:**\n\n"
                f"{rate_msg}\n\n"
                f"For personalized white-glove acquisitions, please contact our concierge team at **concierge@monotime.com**."
            ),
            timestamp=datetime.utcnow().strftime("%I:%M %p"),
            attached_product=None,
            suggested_prompts=["What watches look best on smaller wrists?", "Apply code MONOTIME10"],
            sources=["Client Data & Security Protocol"],
            confidence=1.0,
        )

    result = SupervisorAgent.execute(
        db=db,
        user_message=body.message,
        session_id=body.session_id or "session-guest",
        product_id=body.product_id,
        chat_history=body.chat_history,
    )
    return result

@router.get("/agent/budget-status")
def get_budget_status():
    """Returns current live Gemini API usage and budget protection status."""
    return budget_shield.get_stats()

@router.post("/observer/check-exit-intent")
def check_exit_intent(body: ExitIntentCheckRequest, db: Session = Depends(get_db)):
    result = evaluate_exit_intent(
        db=db,
        session_id=body.session_id or "session-guest",
        product_id=body.product_id,
        mouse_y=body.mouse_y or 0,
        time_on_page=body.time_on_page_seconds or 0,
        trigger_type=body.trigger_type or "exit_intent",
    )
    return result

@router.post("/observer/claim-pitch")
def claim_pitch(body: PitchClaimRequest, db: Session = Depends(get_db)):
    pitch = db.query(PitchEventModel).filter(PitchEventModel.id == body.pitch_id).first()
    if pitch:
        pitch.clicked = True
        db.commit()
        return {"status": "claimed", "pitch_id": pitch.id, "code": pitch.code}
    return {"status": "not_found"}
