from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Optional
import base64
import numpy as np
import cv2

from app.db.base import get_db
from app.core.security import get_current_user
from app.models.session import Session as SessionModel
from app.services.focus_service import FocusAnalyzer
from app.services.drowsiness_service import DrowsinessDetector
from app.services.distraction_service import DistractionDetector

router = APIRouter()
focus_analyzer = FocusAnalyzer()
drowsiness_detector = DrowsinessDetector()
distraction_detector = DistractionDetector()

def decode_image_to_cv2(image_data: str) -> np.ndarray:
    """Helper to decode base64 string to cv2 frame."""
    if "," in image_data:
        image_data = image_data.split(",")[1]
    img_bytes = base64.b64decode(image_data)
    nparr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return frame

@router.post("/analyze")
async def analyze_focus(
    request: Dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_data = request.get("image_data")
    if not image_data:
        raise HTTPException(status_code=400, detail="Missing image_data")

    try:
        frame = decode_image_to_cv2(image_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {e}")

    # Analyze focus, drowsiness, distraction
    focus_score = focus_analyzer.calculate_focus_score(frame)
    attention_score = focus_analyzer.calculate_attention_score(frame)
    drowsiness = drowsiness_detector.detect_drowsiness(frame)
    distraction = distraction_detector.detect_distraction(frame)

    # Get active session and update it
    user_id = int(current_user["sub"])
    active_session = db.query(SessionModel).filter(
        SessionModel.user_id == user_id,
        SessionModel.status == "active"
    ).order_by(SessionModel.start_time.desc()).first()

    if active_session:
        # Update rolling averages
        active_session.focus_score = (active_session.focus_score + focus_score) / 2.0
        active_session.attention_score = (active_session.attention_score + attention_score) / 2.0
        active_session.drowsiness_score = (active_session.drowsiness_score + drowsiness["score"]) / 2.0
        
        # Log events
        if drowsiness["severity"] in ["medium", "high"] and drowsiness["consecutive_frames"] == 15:
            active_session.drowsiness_events += 1

        if distraction["severity"] in ["medium", "high"] and distraction["consecutive_distracted_frames"] == 20:
            active_session.distraction_events += 1

        db.commit()
        db.refresh(active_session)

    return {
        "focus_score": focus_score,
        "attention_score": attention_score,
        "drowsiness": {
            "score": drowsiness["score"],
            "is_drowsy": drowsiness["is_drowsy"],
            "severity": drowsiness["severity"]
        },
        "distraction": {
            "score": distraction["score"],
            "is_distracted": distraction["is_distracted"],
            "severity": distraction["severity"],
            "type": distraction["distraction_type"]
        },
        "session_active": active_session is not None
    }

@router.get("/score/{session_id}")
async def get_session_score(
    session_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.user_id == int(current_user["sub"])
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session.id,
        "focus_score": round(session.focus_score, 2),
        "attention_score": round(session.attention_score, 2),
        "drowsiness_score": round(session.drowsiness_score, 2),
        "drowsiness_events": session.drowsiness_events,
        "distraction_events": session.distraction_events,
    }

@router.get("/trends")
async def get_focus_trends(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch weekly trends
    user_id = int(current_user["sub"])
    
    # Simple query to get last 10 completed session focus scores
    sessions = db.query(SessionModel).filter(
        SessionModel.user_id == user_id,
        SessionModel.status == "completed"
    ).order_by(SessionModel.start_time.desc()).limit(10).all()

    trends = []
    for s in reversed(sessions):
        trends.append({
            "session_id": s.id,
            "date": s.start_time.strftime("%d %b"),
            "focus_score": round(s.focus_score, 2),
            "attention_score": round(s.attention_score, 2),
        })

    return {
        "trends": trends,
        "average_focus": round(sum(t["focus_score"] for t in trends) / len(trends), 2) if trends else 75.0
    }
