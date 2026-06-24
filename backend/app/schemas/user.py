from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    total_sessions: int = 0
    total_emotions_logged: int = 0
    dominant_emotion: str = "neutral"
    focus_score: float = 0.0
    eq_score: float = 0.0
    streak: int = 0
    achievements: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
