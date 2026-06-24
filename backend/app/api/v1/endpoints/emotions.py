from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.db.base import get_db
from app.core.security import get_current_user
from app.models.emotion import EmotionLog
from app.schemas.session import EmotionDetectRequest, EmotionDetectResponse
from app.services.emotion_detection import EmotionDetector

router = APIRouter()
detector = EmotionDetector()

@router.post("/detect", response_model=EmotionDetectResponse)
async def detect_emotion(
    request: EmotionDetectRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = detector.detect_emotion(request.image_data)

    # Log emotion
    emotion_log = EmotionLog(
        user_id=int(current_user["sub"]),
        session_id=1,  # Get from active session
        emotion=result["emotion"],
        confidence=result["confidence"]
    )
    db.add(emotion_log)
    db.commit()

    return EmotionDetectResponse(
        emotion=result["emotion"],
        confidence=result["confidence"],
        all_emotions=result.get("all_emotions", {})
    )

@router.get("/history")
async def get_emotion_history(
    period: Optional[str] = "week",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    emotions = db.query(EmotionLog).filter(
        EmotionLog.user_id == int(current_user["sub"])
    ).order_by(EmotionLog.timestamp.desc()).limit(100).all()
    return emotions

@router.get("/summary")
async def get_emotion_summary(
    date: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Aggregate emotions for the given date
    emotions = db.query(EmotionLog).filter(
        EmotionLog.user_id == int(current_user["sub"])
    ).all()

    emotion_counts = {}
    for e in emotions:
        emotion_counts[e.emotion] = emotion_counts.get(e.emotion, 0) + 1

    dominant = max(emotion_counts, key=emotion_counts.get) if emotion_counts else "neutral"

    return {
        "date": date,
        "dominant_emotion": dominant,
        "emotion_counts": emotion_counts,
        "total_emotions": len(emotions)
    }
