from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.session import SessionModel, ProductViewModel
from app.schemas.session import SessionTrackRequest, SessionResponse

router = APIRouter(prefix="/sessions", tags=["Session Tracking"])

@router.post("/track", response_model=SessionResponse)
def track_session(body: SessionTrackRequest, db: Session = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == body.session_id).first()
    now = datetime.utcnow()

    if not session:
        session = SessionModel(
            id=body.session_id,
            created_at=now,
            last_activity=now,
            current_product_id=body.product_id,
            total_dwell_seconds=body.dwell_seconds or 0,
        )
        db.add(session)
    else:
        session.last_activity = now
        session.total_dwell_seconds += body.dwell_seconds or 0
        if body.product_id:
            session.current_product_id = body.product_id

    # Track product view if product_id supplied
    if body.product_id:
        pv = ProductViewModel(
            session_id=body.session_id,
            product_id=body.product_id,
            viewed_at=now,
            dwell_seconds=body.dwell_seconds or 0,
            scroll_depth=body.scroll_depth or 0.0,
            added_to_cart=body.added_to_cart or False,
        )
        db.add(pv)

    db.commit()
    return SessionResponse(id=session.id, status="active", last_activity=session.last_activity.isoformat())
