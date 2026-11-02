import time
from typing import Dict, List, Tuple, Optional
from collections import defaultdict
from app.config import settings

class BudgetShield:
    """
    Budget Shield:
    Guarantees that Gemini AI API calls NEVER exceed configured daily & hourly limits.
    Protects against unexpected billing spikes from public or live link traffic.
    When the budget limit is reached, seamlessly switches to the local $0.00 horology engine.
    """
    def __init__(self):
        self._call_timestamps: List[float] = []

    def _cleanup_old_timestamps(self, now: float):
        cutoff_24h = now - 86400.0
        self._call_timestamps = [t for t in self._call_timestamps if t > cutoff_24h]

    def can_call_gemini(self) -> bool:
        if not getattr(settings, "ENABLE_GEMINI_API", True):
            return False
        
        api_key = getattr(settings, "GEMINI_API_KEY", "")
        if not api_key:
            return False

        now = time.time()
        self._cleanup_old_timestamps(now)

        max_daily = getattr(settings, "MAX_GEMINI_CALLS_PER_DAY", 50)
        max_hourly = getattr(settings, "MAX_GEMINI_CALLS_PER_HOUR", 15)

        # 24-hour limit check
        if len(self._call_timestamps) >= max_daily:
            print(f"[Budget Shield] Daily cap reached ({len(self._call_timestamps)}/{max_daily} calls). Serving response via local RAG engine (Cost: $0.00).")
            return False

        # 1-hour limit check
        cutoff_1h = now - 3600.0
        calls_last_hour = sum(1 for t in self._call_timestamps if t > cutoff_1h)
        if calls_last_hour >= max_hourly:
            print(f"[Budget Shield] Hourly burst cap reached ({calls_last_hour}/{max_hourly} calls). Serving response via local RAG engine (Cost: $0.00).")
            return False

        return True

    def record_gemini_call(self):
        now = time.time()
        self._call_timestamps.append(now)
        self._cleanup_old_timestamps(now)
        print(f"[Budget Shield] Gemini API call recorded. Usage today: {len(self._call_timestamps)}/{getattr(settings, 'MAX_GEMINI_CALLS_PER_DAY', 50)} calls.")

    def get_stats(self) -> dict:
        now = time.time()
        self._cleanup_old_timestamps(now)
        max_daily = getattr(settings, "MAX_GEMINI_CALLS_PER_DAY", 50)
        cutoff_1h = now - 3600.0
        calls_last_hour = sum(1 for t in self._call_timestamps if t > cutoff_1h)
        return {
            "calls_last_24h": len(self._call_timestamps),
            "max_daily_calls": max_daily,
            "calls_last_1h": calls_last_hour,
            "max_hourly_calls": getattr(settings, "MAX_GEMINI_CALLS_PER_HOUR", 15),
            "shield_active": len(self._call_timestamps) >= max_daily,
            "cost_protection": "Active ($0.00 Guaranteed Free Tier Bound)",
        }


class IPRateLimiter:
    """
    In-memory rate limiter per IP address to prevent spam or DoS attacks from live links.
    """
    def __init__(self):
        self._ip_history: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, ip: str) -> Tuple[bool, str]:
        now = time.time()
        history = self._ip_history[ip]

        # Clean timestamps older than 1 hour
        cutoff_1h = now - 3600.0
        history = [t for t in history if t > cutoff_1h]
        self._ip_history[ip] = history

        limit_min = getattr(settings, "RATE_LIMIT_PER_MINUTE_PER_IP", 6)
        limit_hour = getattr(settings, "RATE_LIMIT_PER_HOUR_PER_IP", 30)

        # 60s window
        cutoff_1m = now - 60.0
        calls_last_min = sum(1 for t in history if t > cutoff_1m)
        if calls_last_min >= limit_min:
            return False, "Rate limit reached: Please wait 30 seconds before sending another message."

        # 1-hour window
        if len(history) >= limit_hour:
            return False, "Hourly concierge rate limit reached. Please visit our boutique or email concierge@monotime.com."

        history.append(now)
        return True, ""


class ResponseCache:
    """
    In-memory cache for common chat inquiries to eliminate redundant computation and zero out API calls.
    """
    def __init__(self, ttl_seconds: float = 3600.0):
        self.ttl = ttl_seconds
        self._cache: Dict[str, Tuple[str, List[str], str, List[str], float]] = {}

    def get(self, key: str) -> Optional[Tuple[str, List[str], str, List[str]]]:
        item = self._cache.get(key)
        if not item:
            return None
        text, prompts, agent_type, sources, expire_at = item
        if time.time() > expire_at:
            del self._cache[key]
            return None
        return text, prompts, agent_type, sources

    def set(self, key: str, text: str, prompts: List[str], agent_type: str, sources: List[str]):
        self._cache[key] = (text, prompts, agent_type, sources, time.time() + self.ttl)


# Global singletons
budget_shield = BudgetShield()
ip_rate_limiter = IPRateLimiter()
response_cache = ResponseCache()

