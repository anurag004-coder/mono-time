from app.routers.products import router as products_router
from app.routers.agent import router as agent_router
from app.routers.sessions import router as sessions_router
from app.routers.merchant import router as merchant_router
from app.routers.checkout import router as checkout_router
from app.routers.admin import router as admin_router

__all__ = [
    "products_router",
    "agent_router",
    "sessions_router",
    "merchant_router",
    "checkout_router",
    "admin_router",
]
