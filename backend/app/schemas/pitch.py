from typing import Optional
from pydantic import BaseModel

class ExitIntentCheckRequest(BaseModel):
    session_id: Optional[str] = "session-guest"
    product_id: str
    mouse_y: Optional[int] = 0
    time_on_page_seconds: Optional[int] = 0
    trigger_type: Optional[str] = "exit_intent"  # 'exit_intent' | 'idle_dwell' | 'cart_hesitation'

class PitchEventResponse(BaseModel):
    id: str
    timestamp: str
    product_id: str
    product_name: str
    gender: str
    trigger_type: str
    offer: str
    code: str
    clicked: bool = False
    converted: bool = False
    should_trigger: bool = True
    reason: Optional[str] = None

class PitchClaimRequest(BaseModel):
    pitch_id: str
    code: str
