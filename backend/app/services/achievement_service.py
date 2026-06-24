"""EMOVERT Achievements & Milestones Service

Defines standard user achievements, checks progress conditions,
and updates the database list of unlocked achievements.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.session import Session as SessionModel

logger = logging.getLogger(__name__)

# Catalog of achievements in EMOVERT
ACHIEVEMENT_CATALOG = [
    {
        "id": "first_steps",
        "title": "First Steps",
        "description": "Log your first completed focus session.",
        "icon": "🚀",
        "points": 50,
    },
    {
        "id": "streak_3",
        "title": "Focus Habit",
        "description": "Maintain a 3-day active focus streak.",
        "icon": "🔥",
        "points": 100,
    },
    {
        "id": "streak_7",
        "title": "Unstoppable",
        "description": "Maintain a 7-day active focus streak.",
        "icon": "⚡",
        "points": 250,
    },
    {
        "id": "flow_state",
        "title": "Flow State",
        "description": "Achieve a focus score of 90%+ in any session.",
        "icon": "🧘",
        "points": 150,
    },
    {
        "id": "hour_lock",
        "title": "Deep Work Hour",
        "description": "Accumulate 1 hour of active focus sessions.",
        "icon": "⏱️",
        "points": 200,
    },
    {
        "id": "serene_focus",
        "title": "Serene Focus",
        "description": "Achieve 80%+ focus while maintaining a happy or neutral emotional state.",
        "icon": "🌊",
        "points": 150,
    }
]


class AchievementService:
    """Manages tracking, unlocking, and reporting gamified achievements."""

    def __init__(self):
        pass

    def get_all_achievements(self, user_id: int, db: Session) -> List[Dict]:
        """Get all catalog achievements with their unlocked status for the user."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        # Run check to see if new achievements should be unlocked
        self.check_and_unlock_achievements(user_id, db)

        unlocked_ids = user.achievements or []
        
        result = []
        for ach in ACHIEVEMENT_CATALOG:
            item = ach.copy()
            item["unlocked"] = ach["id"] in unlocked_ids
            item["unlocked_at"] = datetime.utcnow().isoformat() if ach["id"] in unlocked_ids else None
            result.append(item)

        return result

    def get_unlocked_achievements(self, user_id: int, db: Session) -> List[Dict]:
        """Get only the achievements that the user has unlocked."""
        all_ach = self.get_all_achievements(user_id, db)
        return [ach for ach in all_ach if ach["unlocked"]]

    def check_and_unlock_achievements(self, user_id: int, db: Session) -> List[str]:
        """Audit the user's progress and unlock any new achievements.
        
        Returns:
            List[str]: Newly unlocked achievement IDs in this run.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        existing_unlocked = set(user.achievements or [])
        newly_unlocked = []

        # Fetch user sessions
        sessions = db.query(SessionModel).filter(
            SessionModel.user_id == user_id,
            SessionModel.status == "completed"
        ).all()

        if not sessions:
            return []

        # 1. First Steps
        if "first_steps" not in existing_unlocked:
            newly_unlocked.append("first_steps")

        # 2. Focus Habit (3 streak)
        if "streak_3" not in existing_unlocked and user.streak >= 3:
            newly_unlocked.append("streak_3")

        # 3. Unstoppable (7 streak)
        if "streak_7" not in existing_unlocked and user.streak >= 7:
            newly_unlocked.append("streak_7")

        # 4. Flow State (focus >= 90)
        if "flow_state" not in existing_unlocked:
            has_flow = any(s.focus_score >= 90.0 for s in sessions)
            if has_flow:
                newly_unlocked.append("flow_state")

        # 5. Deep Work Hour (total duration >= 3600 seconds)
        if "hour_lock" not in existing_unlocked:
            total_duration = sum(s.duration for s in sessions)
            if total_duration >= 3600:
                newly_unlocked.append("hour_lock")

        # 6. Serene Focus (focus >= 80, mock check since we don't store individual session emotions easily)
        if "serene_focus" not in existing_unlocked:
            # Let's say if they have a session with focus >= 85 and dominant emotion was happy/neutral
            has_serene = any(s.focus_score >= 80.0 for s in sessions)
            if has_serene and user.dominant_emotion in ["happy", "neutral"]:
                newly_unlocked.append("serene_focus")

        if newly_unlocked:
            # Save to user database
            updated_unlocked = list(existing_unlocked.union(newly_unlocked))
            user.achievements = updated_unlocked
            db.commit()
            logger.info(f"User {user_id} unlocked achievements: {newly_unlocked}")

        return newly_unlocked
