from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Optional

from app.db.base import get_db
from app.core.security import get_current_user
from app.services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()

@router.get("/history")
async def get_chat_history(
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    history = chat_service.get_history(user_id)
    return history

@router.post("/send")
async def send_chat_message(
    payload: Dict,
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    message = payload.get("message")
    emotion = payload.get("emotion")

    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    reply = chat_service.send_message(user_id, message, emotion)
    return reply
