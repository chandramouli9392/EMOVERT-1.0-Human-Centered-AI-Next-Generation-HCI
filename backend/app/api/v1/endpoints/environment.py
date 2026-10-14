from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.core.security import get_current_user
from app.services.environment_service import environment_service

router = APIRouter()

class ApplyEnvironmentRequest(BaseModel):
    emotion: str = Field(..., description="Confirmed user emotion state to adapt to")
    device_target: Optional[str] = Field("all", description="Target hardware: 'lighting', 'audio', 'display', 'all'")
    simulate_hardware_failure: Optional[bool] = Field(False, description="Simulate hardware connectivity failure for testing")

@router.post("/apply")
async def apply_environment(
    data: ApplyEnvironmentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Apply environmental changes (lighting, audio, display) for confirmed affective state."""
    result = environment_service.apply_environment_action(
        emotion=data.emotion,
        device_target=data.device_target,
        simulate_hardware_failure=data.simulate_hardware_failure
    )
    return result

@router.get("/status")
async def get_environment_status(
    current_user: dict = Depends(get_current_user)
):
    """Retrieve current environment preset and hardware controller status."""
    return environment_service.get_status()

@router.get("/presets/{emotion}")
async def get_preset_for_emotion(
    emotion: str,
    current_user: dict = Depends(get_current_user)
):
    """Retrieve preview of environmental preset for any emotion."""
    return environment_service.get_preset_for_emotion(emotion)
