from fastapi import FastAPI, Request
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

# Pure ASGI Security Headers Middleware (lightweight, zero-deadlock)
class SecurityHeadersMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message):
            if message.get("type") == "http.response.start":
                headers = list(message.get("headers", []))
                headers.extend([
                    (b"x-content-type-options", b"nosniff"),
                    (b"x-frame-options", b"SAMEORIGIN"),
                    (b"x-xss-protection", b"1; mode=block"),
                    (b"referrer-policy", b"strict-origin-when-cross-origin"),
                    (b"permissions-policy", b"camera=(), microphone=(), geolocation=()"),
                ])
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_wrapper)

app.add_middleware(SecurityHeadersMiddleware)

# Allowed CORS Origins (Never wildcard '.*' with credentials)
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://frontend-mu-seven-gmmp4fw1jh.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://frontend.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
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
            "checkout": "/api/checkout/create-intent",
        },
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
