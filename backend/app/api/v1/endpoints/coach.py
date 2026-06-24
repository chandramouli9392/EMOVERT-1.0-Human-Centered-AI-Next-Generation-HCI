from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.db.base import get_db
from app.core.security import get_current_user
from app.services.coach_service import CoachService
from app.services.recommendation_service import RecommendationEngine
from app.models.user import User

router = APIRouter()
coach_service = CoachService()
rec_engine = RecommendationEngine()

@router.get("/daily")
async def get_daily_coaching_report(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    report = coach_service.get_daily_report(user_id, db)
    return report

@router.get("/weekly")
async def get_weekly_coaching_report(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    report = coach_service.get_weekly_report(user_id, db)
    return report

@router.get("/insights")
async def get_coaching_insights(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    insights = coach_service.get_insights(user_id, db)
    return insights

@router.get("/recommendations")
async def get_coach_recommendations(
    emotion: Optional[str] = Query(default=None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    
    # If no emotion is provided, look up the user's dominant emotion
    target_emotion = emotion
    if not target_emotion:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            target_emotion = user.dominant_emotion
        if not target_emotion:
            target_emotion = "neutral"

    recs = rec_engine.get_recommendations(target_emotion)
    return recs
