from fastapi import APIRouter

from app.api.v1.endpoints import auth, sessions, emotions, focus, analytics, coach, chat, music, reports, achievements

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])
api_router.include_router(emotions.router, prefix="/emotions", tags=["Emotions"])
api_router.include_router(focus.router, prefix="/focus", tags=["Focus"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(coach.router, prefix="/coach", tags=["Coach"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(music.router, prefix="/music", tags=["Music"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])
