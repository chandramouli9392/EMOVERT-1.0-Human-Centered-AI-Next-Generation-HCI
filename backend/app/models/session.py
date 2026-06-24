from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, JSON, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration = Column(Integer, default=0)  # in seconds
    focus_score = Column(Float, default=0.0)
    attention_score = Column(Float, default=0.0)
    drowsiness_score = Column(Float, default=0.0)
    status = Column(String, default="active")  # active, paused, completed
    drowsiness_events = Column(Integer, default=0)
    distraction_events = Column(Integer, default=0)
    emotion_changes = Column(JSON, default=list)
