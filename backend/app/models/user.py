from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, JSON
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    google_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Stats
    total_sessions = Column(Integer, default=0)
    total_emotions_logged = Column(Integer, default=0)
    dominant_emotion = Column(String, default="neutral")
    focus_score = Column(Float, default=0.0)
    eq_score = Column(Float, default=0.0)
    streak = Column(Integer, default=0)
    achievements = Column(JSON, default=list)
