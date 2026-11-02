
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.routers import (
    products_router,
    agent_router,
    sessions_router,
    merchant_router,
    checkout_router,
    admin_router,
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API Gateway & Agent Service for Autonomous Multi-Modal Sales & Clienteling System",
    version="1.0.0",
)

# CORS Configuration for Next.js frontend and network/tunnel sharing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(products_router, prefix=settings.API_V1_STR)
app.include_router(agent_router, prefix=settings.API_V1_STR)
app.include_router(sessions_router, prefix=settings.API_V1_STR)
app.include_router(merchant_router, prefix=settings.API_V1_STR)
app.include_router(checkout_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "docs": "/docs",
        "endpoints": {
            "products": "/api/products",
            "chat": "/api/agent/chat",
            "observer": "/api/observer/check-exit-intent",
            "merchant": "/api/merchant/analytics",
            "checkout": "/api/checkout/create-intent",
        },
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
