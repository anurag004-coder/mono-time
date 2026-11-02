from typing import Optional, Dict, Any
from pydantic import BaseModel

class SessionTrackRequest(BaseModel):
    session_id: str
    product_id: Optional[str] = None
    dwell_seconds: Optional[int] = 0
    scroll_depth: Optional[float] = 0.0
    mouse_x: Optional[int] = 0
    mouse_y: Optional[int] = 0
    added_to_cart: Optional[bool] = False

class SessionResponse(BaseModel):
    id: str
    status: str = "active"
    last_activity: str
