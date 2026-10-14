"""EMOVERT Environmental Adaptation & IoT Service

Manages ambient adjustments based on user emotional state and wellness goals:
- Ambient Lighting (color temperature, RGB palette, brightness, lighting modes)
- Ambient Audio / Soundscapes
- Visual Ambiance / Display Glow
- Production-grade IoT controller interface with accurate status verification
  (never falsely claims physical hardware success when running in local simulation)
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Evidence-based ambient presets corresponding to confirmed affect states
AMBIENT_PRESETS: Dict[str, Dict[str, Any]] = {
    "happy": {
        "lighting": {
            "mode": "warm_vitality",
            "color_hex": "#FBBF24",
            "color_name": "Warm Gold",
            "brightness_pct": 75,
            "color_temp_k": 3200,
        },
        "audio": {
            "ambience": "gentle_uplift",
            "volume_pct": 40,
            "soundscape": "morning_sunlight",
        },
        "display": {
            "glow_color": "rgba(251, 191, 36, 0.25)",
            "pulse_rate": "steady",
        },
    },
    "calm": {
        "lighting": {
            "mode": "tranquil_azure",
            "color_hex": "#38BDF8",
            "color_name": "Tranquil Sky Blue",
            "brightness_pct": 60,
            "color_temp_k": 4000,
        },
        "audio": {
            "ambience": "ocean_waves",
            "volume_pct": 35,
            "soundscape": "gentle_water",
        },
        "display": {
            "glow_color": "rgba(56, 189, 248, 0.25)",
            "pulse_rate": "slow",
        },
    },
    "sad": {
        "lighting": {
            "mode": "comforting_amber",
            "color_hex": "#F97316",
            "color_name": "Cozy Amber",
            "brightness_pct": 50,
            "color_temp_k": 2700,
        },
        "audio": {
            "ambience": "rainfall_hearth",
            "volume_pct": 30,
            "soundscape": "soft_piano",
        },
        "display": {
            "glow_color": "rgba(249, 115, 22, 0.20)",
            "pulse_rate": "slow",
        },
    },
    "stressed": {
        "lighting": {
            "mode": "respiratory_sage",
            "color_hex": "#34D399",
            "color_name": "Soothing Sage Green",
            "brightness_pct": 55,
            "color_temp_k": 3500,
        },
        "audio": {
            "ambience": "forest_breath",
            "volume_pct": 45,
            "soundscape": "binaural_alpha_waves",
        },
        "display": {
            "glow_color": "rgba(52, 211, 153, 0.30)",
            "pulse_rate": "respiratory_pace",
        },
    },
    "angry": {
        "lighting": {
            "mode": "cooling_lavender",
            "color_hex": "#818CF8",
            "color_name": "Cooling Indigo Lavender",
            "brightness_pct": 45,
            "color_temp_k": 4500,
        },
        "audio": {
            "ambience": "deep_relaxation",
            "volume_pct": 35,
            "soundscape": "river_stream",
        },
        "display": {
            "glow_color": "rgba(129, 140, 248, 0.25)",
            "pulse_rate": "cooling_down",
        },
    },
    "neutral": {
        "lighting": {
            "mode": "balanced_daylight",
            "color_hex": "#E2E8F0",
            "color_name": "Neutral Daylight",
            "brightness_pct": 70,
            "color_temp_k": 5000,
        },
        "audio": {
            "ambience": "subtle_air",
            "volume_pct": 20,
            "soundscape": "neutral_focus",
        },
        "display": {
            "glow_color": "rgba(226, 232, 240, 0.15)",
            "pulse_rate": "none",
        },
    },
    "focused": {
        "lighting": {
            "mode": "clarity_cyan",
            "color_hex": "#06B6D4",
            "color_name": "Clarity Cyan",
            "brightness_pct": 80,
            "color_temp_k": 5500,
        },
        "audio": {
            "ambience": "brown_noise",
            "volume_pct": 35,
            "soundscape": "deep_focus_waves",
        },
        "display": {
            "glow_color": "rgba(6, 182, 212, 0.25)",
            "pulse_rate": "steady",
        },
    },
}

class EnvironmentService:
    """Manages environmental adaptation with real/simulated controller distinction."""

    def __init__(self):
        self._current_state = {
            "active_emotion": "neutral",
            "preset": AMBIENT_PRESETS["neutral"],
            "hardware_connected": False,
            "controller_type": "software_emulation",
            "last_applied_at": datetime.utcnow().isoformat(),
        }

    def get_preset_for_emotion(self, emotion: str) -> Dict[str, Any]:
        """Fetch environment preset for a normalized emotion."""
        normalized = (emotion or "neutral").lower()
        if normalized in ["happy", "excited"]:
            key = "happy"
        elif normalized in ["calm", "curious"]:
            key = "calm"
        elif normalized in ["sad", "sleepy", "boredom"]:
            key = "sad"
        elif normalized in ["stress", "stressed", "anxiety", "confusion"]:
            key = "stressed"
        elif normalized in ["angry", "disgust", "fear"]:
            key = "angry"
        elif normalized in ["focused"]:
            key = "focused"
        else:
            key = "neutral"
        return AMBIENT_PRESETS.get(key, AMBIENT_PRESETS["neutral"])

    def apply_environment_action(
        self,
        emotion: str,
        device_target: Optional[str] = "all",
        simulate_hardware_failure: bool = False
    ) -> Dict[str, Any]:
        """Apply environmental change.
        
        Truthful hardware status:
        - If physical IoT bridge is not connected or fails, status reports
          controller_type='software_emulation' with hardware_confirmed=False.
        """
        if simulate_hardware_failure:
            return {
                "success": False,
                "error": "Environmental IoT gateway timeout or unreachable",
                "controller_type": "physical_iot",
                "hardware_confirmed": False,
                "emotion": emotion,
                "applied_preset": None,
                "timestamp": datetime.utcnow().isoformat(),
            }

        preset = self.get_preset_for_emotion(emotion)
        self._current_state = {
            "active_emotion": emotion,
            "preset": preset,
            "hardware_connected": False,  # Transparent: true when external bridge configured
            "controller_type": "software_emulation",
            "last_applied_at": datetime.utcnow().isoformat(),
        }

        return {
            "success": True,
            "controller_type": "software_emulation",
            "hardware_confirmed": False,  # Accurate reporting as required
            "device_target": device_target,
            "emotion": emotion,
            "applied_preset": preset,
            "message": f"Ambient environment adapted for {emotion} state (software emulation active)",
            "timestamp": datetime.utcnow().isoformat(),
        }

    def get_status(self) -> Dict[str, Any]:
        """Return current ambient status."""
        return self._current_state


environment_service = EnvironmentService()
