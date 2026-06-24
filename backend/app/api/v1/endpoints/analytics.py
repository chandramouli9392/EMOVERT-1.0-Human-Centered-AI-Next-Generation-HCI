from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.base import get_db
from app.core.security import get_current_user
from app.services.analytics_service import AnalyticsService

router = APIRouter()
analytics_service = AnalyticsService()

@router.get("/dashboard")
async def get_dashboard_data(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    stats = analytics_service.get_dashboard_stats(user_id, db)
    return stats

@router.get("/weekly")
async def get_weekly_trends(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    trends = analytics_service.get_weekly_trends(user_id, db)
    return trends

@router.get("/monthly")
async def get_monthly_trends(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    trends = analytics_service.get_monthly_trends(user_id, db)
    return trends

@router.get("/calendar")
async def get_calendar_trends(
    year: int = Query(default=None),
    month: int = Query(default=None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    
    # Default to current year and month if not provided
    now = datetime.utcnow()
    target_year = year if year is not None else now.year
    target_month = month if month is not None else now.month
    
    calendar_data = analytics_service.get_calendar_trends(user_id, target_year, target_month, db)
    return calendar_data
