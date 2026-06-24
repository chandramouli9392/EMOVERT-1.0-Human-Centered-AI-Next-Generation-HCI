from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class SessionStart(BaseModel):
    pass

class SessionResponse(BaseModel):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: int
    focus_score: float
    attention_score: float
    drowsiness_score: float
    status: str
    drowsiness_events: int
    distraction_events: int

    class Config:
        from_attributes = True

class EmotionDetectRequest(BaseModel):
    image_data: str  # base64 encoded image

class EmotionDetectResponse(BaseModel):
    emotion: str
    confidence: float
    all_emotions: Dict[str, float]
