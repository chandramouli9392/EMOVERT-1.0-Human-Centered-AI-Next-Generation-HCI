from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.base import get_db
from app.core.security import get_current_user
from app.models.session import Session as SessionModel
from app.schemas.session import SessionResponse

router = APIRouter()

@router.post("/start", response_model=SessionResponse)
async def start_session(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    db_session = SessionModel(user_id=int(current_user["sub"]))
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.post("/{session_id}/end")
async def end_session(session_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    db_session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.user_id == int(current_user["sub"])
    ).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    db_session.end_time = datetime.utcnow()
    db_session.status = "completed"
    if db_session.start_time:
        db_session.duration = int((db_session.end_time - db_session.start_time).total_seconds())
    db.commit()
    return {"message": "Session ended"}

@router.post("/{session_id}/pause")
async def pause_session(session_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    db_session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.user_id == int(current_user["sub"])
    ).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    db_session.status = "paused"
    db.commit()
    return {"message": "Session paused"}

@router.post("/{session_id}/resume")
async def resume_session(session_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    db_session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.user_id == int(current_user["sub"])
    ).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    db_session.status = "active"
    db.commit()
    return {"message": "Session resumed"}

@router.get("/history")
async def get_session_history(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(SessionModel).filter(
        SessionModel.user_id == int(current_user["sub"])
    ).order_by(SessionModel.start_time.desc()).all()
    return sessions
