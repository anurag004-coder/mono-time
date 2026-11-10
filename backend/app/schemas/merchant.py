from typing import List, Optional
from pydantic import BaseModel
from app.schemas.pitch import PitchEventResponse

class SalesForecast(BaseModel):
    projected30DayRevenueINR: int
    expectedOrdersCount: int
    topVelocityReference: str
    inventoryDepletionDays: int
    highIntentCartProbability: float

class MerchantStatsResponse(BaseModel):
    totalSessions: int
    pitchesTriggered: int
    pitchesClicked: int
    cartsRecovered: int
    recoveredRevenueINR: int
    conversionRatePercent: float
    ctrPercent: float
    forecast: Optional[SalesForecast] = None

class MerchantPitchListResponse(BaseModel):
    pitches: List[PitchEventResponse]
    stats: MerchantStatsResponse
