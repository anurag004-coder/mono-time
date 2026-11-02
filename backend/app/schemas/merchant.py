from typing import List, Optional
from pydantic import BaseModel
from app.schemas.pitch import PitchEventResponse

class MerchantStatsResponse(BaseModel):
    totalSessions: int
    pitchesTriggered: int
    pitchesClicked: int
    cartsRecovered: int
    recoveredRevenueINR: int
    conversionRatePercent: float
    ctrPercent: float

class MerchantPitchListResponse(BaseModel):
    pitches: List[PitchEventResponse]
    stats: MerchantStatsResponse
