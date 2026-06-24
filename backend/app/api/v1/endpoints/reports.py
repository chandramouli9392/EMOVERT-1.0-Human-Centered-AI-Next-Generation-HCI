from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.core.security import get_current_user
from app.services.report_service import ReportService

router = APIRouter()
report_service = ReportService()

@router.get("/weekly")
async def get_weekly_report_file(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    report_bytes = report_service.generate_weekly_report(user_id, db)
    
    return Response(
        content=report_bytes,
        media_type="text/html",
        headers={
            "Content-Disposition": "attachment; filename=emovert_weekly_report.html",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/monthly")
async def get_monthly_report_file(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    report_bytes = report_service.generate_monthly_report(user_id, db)
    
    return Response(
        content=report_bytes,
        media_type="text/html",
        headers={
            "Content-Disposition": "attachment; filename=emovert_monthly_report.html",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.post("/{report_id}/share")
async def share_report_link(
    report_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])
    result = report_service.share_report(user_id, report_id, db)
    return result
