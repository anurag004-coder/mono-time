import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_URL = f"sqlite:///{BACKEND_DIR / 'sales_agent.db'}"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Mono Time - Autonomous Multi-Modal Sales & Clienteling System"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = DEFAULT_DB_URL
    
    # Gemini AI API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Vector DB & OpenAI keys (optional)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT", "")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "sales-agent-products")
    
    # Observer Pitch Rules
    HIGH_VALUE_THRESHOLD_INR: int = 2000
    EXIT_INTENT_DWELL_SECONDS: int = 120
    DEFAULT_DISCOUNT_PERCENT: int = 10
    DEFAULT_COUPON_CODE: str = "MONOTIME10"

    # Admin Authentication & Security
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "Anurag_Ashu")
    ADMIN_PASSWORD_HASH: str = os.getenv(
        "ADMIN_PASSWORD_HASH",
        "$2b$12$Qzkisov7BJwxjlVziaJEt.EkdLybCIZ9N16w7kvrSiwSJxKMS4DTm",
    )
    SESSION_SECRET: str = os.getenv(
        "SESSION_SECRET",
        "mono-time-atelier-secure-anurag-ashu-secret-key-2026-prod",
    )
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Budget Shield & Cost Protection (Guarantees $0.00 bills on live links)
    ENABLE_GEMINI_API: bool = os.getenv("ENABLE_GEMINI_API", "True").lower() in ("true", "1", "yes")
    MAX_GEMINI_CALLS_PER_DAY: int = int(os.getenv("MAX_GEMINI_CALLS_PER_DAY", "50"))
    MAX_GEMINI_CALLS_PER_HOUR: int = int(os.getenv("MAX_GEMINI_CALLS_PER_HOUR", "15"))
    RATE_LIMIT_PER_MINUTE_PER_IP: int = int(os.getenv("RATE_LIMIT_PER_MINUTE_PER_IP", "6"))
    RATE_LIMIT_PER_HOUR_PER_IP: int = int(os.getenv("RATE_LIMIT_PER_HOUR_PER_IP", "30"))

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
