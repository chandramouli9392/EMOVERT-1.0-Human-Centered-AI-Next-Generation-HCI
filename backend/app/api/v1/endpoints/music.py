from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.db.base import get_db
from app.core.security import get_current_user
from app.services.music_service import MusicService

router = APIRouter()
music_service = MusicService()

@router.get("/tracks")
async def get_audio_tracks(
    category: Optional[str] = Query(default=None),
    current_user: dict = Depends(get_current_user)
):
    tracks = music_service.get_tracks(category)
    return tracks

@router.get("/favorites")
async def get_favorite_tracks(
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    favorites = music_service.get_favorites(user_id)
    return favorites

@router.post("/favorites/{track_id}")
async def toggle_track_favorite(
    track_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = int(current_user["sub"])
    result = music_service.toggle_favorite(user_id, track_id)
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return result

@router.get("/recommendations")
async def get_music_recommendations(
    emotion: str = Query(...),
    current_user: dict = Depends(get_current_user)
):
    recommendations = music_service.get_recommendations(emotion)
    return recommendations
