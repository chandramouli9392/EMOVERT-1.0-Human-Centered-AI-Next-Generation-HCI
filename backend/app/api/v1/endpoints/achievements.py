from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.core.security import get_current_user
from app.services.achievement_service import AchievementService

router = APIRouter()
achievement_service = AchievementService()

@router.get("")
async def get_all_user_achievements(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    achievements = achievement_service.get_all_achievements(user_id, db)
    return achievements

@router.get("/unlocked")
async def get_unlocked_user_achievements(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    unlocked = achievement_service.get_unlocked_achievements(user_id, db)
    return unlocked
