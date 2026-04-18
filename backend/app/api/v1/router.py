from fastapi import APIRouter

from app.api.v1.routes.ai import router as ai_router
from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.chat import router as chat_router
from app.api.v1.routes.courses import router as courses_router
from app.api.v1.routes.learning import router as learning_router
from app.api.v1.routes.payments import router as payments_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(courses_router)
api_router.include_router(learning_router)
api_router.include_router(ai_router)
api_router.include_router(payments_router)
api_router.include_router(chat_router)
