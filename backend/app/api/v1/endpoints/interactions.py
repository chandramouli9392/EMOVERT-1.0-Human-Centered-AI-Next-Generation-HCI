from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from app.db.base import get_db
from app.core.security import get_current_user
from app.models.interaction_log import InteractionLog

router = APIRouter()

class InteractionEventRequest(BaseModel):
    session_id: Optional[int] = Field(None, description="Optional active session id")
    interaction_id: str = Field(..., description="Unique interaction cycle id")
    event_type: str = Field(..., description="Operational event type")
    modality: Optional[str] = Field(None, description="visual, voice, manual, environment")
    source: Optional[str] = Field(None, description="visual_estimation, voice_input, manual_input")
    latency_ms: Optional[int] = Field(None, description="Response or recovery latency in milliseconds")
    is_fallback: Optional[bool] = Field(False, description="Whether this event represents a fallback transition")
    recovery_outcome: Optional[str] = Field(None, description="recovered, failed, cancelled, completed")
    confirmed_emotion: Optional[str] = Field(None, description="Anonymized confirmed state label only")

@router.post("/events")
async def record_interaction_event(
    event: InteractionEventRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record privacy-preserving operational fallback telemetry."""
    try:
        user_id = int(current_user["sub"])
        log_entry = InteractionLog(
            user_id=user_id,
            session_id=event.session_id,
            interaction_id=event.interaction_id,
            event_type=event.event_type,
            modality=event.modality,
            source=event.source,
            latency_ms=event.latency_ms,
            is_fallback=bool(event.is_fallback),
            recovery_outcome=event.recovery_outcome,
            confirmed_emotion=event.confirmed_emotion,
            timestamp=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
        return {"status": "recorded", "event_type": event.event_type}
    except Exception as e:
        db.rollback()
        return {"status": "skipped", "error": str(e)}

@router.get("/metrics")
async def get_interaction_metrics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve operational telemetry summary (fallback frequency, recovery success rate)."""
    user_id = int(current_user["sub"])
    events = db.query(InteractionLog).filter(InteractionLog.user_id == user_id).all()
    
    total_events = len(events)
    fallback_events = [e for e in events if e.is_fallback]
    completed_events = [e for e in events if e.event_type in ["INTERACTION_COMPLETED", "STATE_CONFIRMED"]]
    
    return {
        "total_interactions_logged": total_events,
        "fallback_transitions_count": len(fallback_events),
        "successful_completions": len(completed_events),
        "recovery_rate_pct": round((len(completed_events) / max(1, len(fallback_events))) * 100, 1) if fallback_events else 100.0
    }
