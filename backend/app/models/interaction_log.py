from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class InteractionLog(Base):
    """Stores non-sensitive operational telemetry for multimodal fallbacks."""
    __tablename__ = "interaction_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=True)
    interaction_id = Column(String, index=True, nullable=False)
    event_type = Column(String, nullable=False)  # INTERACTION_STARTED, VOICE_FALLBACK_ACTIVATED, etc.
    modality = Column(String, nullable=True)    # visual, voice, manual, environment
    source = Column(String, nullable=True)      # visual_estimation, voice_input, manual_input
    latency_ms = Column(Integer, nullable=True)
    is_fallback = Column(Boolean, default=False)
    recovery_outcome = Column(String, nullable=True)  # recovered, failed, cancelled, completed
    confirmed_emotion = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
