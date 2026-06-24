"""EMOVERT Analytics & Statistics Service

Aggregates database logs to calculate:
- User streaks and stats
- Weekly and monthly focus/emotion trends
- Daily calendar grids
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta, date as date_type
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.session import Session as SessionModel
from app.models.emotion import EmotionLog
from app.models.user import User

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Computes wellness and focus analytics from session and emotion histories."""

    def __init__(self):
        pass

    def get_dashboard_stats(self, user_id: int, db: Session) -> Dict:
        """Fetch general stats for the main dashboard dashboard."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}

        # Aggregate session figures
        sessions = db.query(SessionModel).filter(
            SessionModel.user_id == user_id,
            SessionModel.status == "completed"
        ).all()

        total_sessions = len(sessions)
        total_duration = sum(s.duration for s in sessions)  # in seconds
        total_hours = round(total_duration / 3600.0, 1)

        # Average focus, attention, and drowsiness
        avg_focus = 0.0
        avg_attention = 0.0
        avg_drowsiness = 0.0
        total_drowsy_events = 0
        total_distract_events = 0

        if total_sessions > 0:
            avg_focus = sum(s.focus_score for s in sessions) / total_sessions
            avg_attention = sum(s.attention_score for s in sessions) / total_sessions
            avg_drowsiness = sum(s.drowsiness_score for s in sessions) / total_sessions
            total_drowsy_events = sum(s.drowsiness_events for s in sessions)
            total_distract_events = sum(s.distraction_events for s in sessions)

        # Find dominant emotion from log history
        emotions = db.query(EmotionLog.emotion, func.count(EmotionLog.emotion)).filter(
            EmotionLog.user_id == user_id
        ).group_by(EmotionLog.emotion).all()

        dominant_emotion = "neutral"
        if emotions:
            dominant_emotion = max(emotions, key=lambda x: x[1])[0]

        # Calculate streak (consecutive days of sessions)
        streak = self._calculate_user_streak(user_id, db)
        user.streak = streak
        user.focus_score = round(avg_focus, 2)
        user.dominant_emotion = dominant_emotion
        db.commit()

        return {
            "total_sessions": total_sessions,
            "total_focus_hours": total_hours,
            "average_focus": round(avg_focus, 2),
            "average_attention": round(avg_attention, 2),
            "average_drowsiness": round(avg_drowsiness, 2),
            "streak": streak,
            "dominant_emotion": dominant_emotion,
            "total_drowsiness_events": total_drowsy_events,
            "total_distraction_events": total_distract_events,
            "eq_score": round(user.eq_score, 2) if user.eq_score else 75.0,
        }

    def get_weekly_trends(self, user_id: int, db: Session) -> Dict:
        """Get 7-day focus and emotion trends."""
        today = datetime.utcnow().date()
        days = [today - timedelta(days=i) for i in range(6, -1, -1)]

        labels = []
        focus_scores = []
        attention_scores = []
        emotions_breakdown = []

        for d in days:
            labels.append(d.strftime("%a"))
            
            # Fetch sessions for this day
            sessions = db.query(SessionModel).filter(
                SessionModel.user_id == user_id,
                func.date(SessionModel.start_time) == d,
                SessionModel.status == "completed"
            ).all()

            if sessions:
                focus_scores.append(round(sum(s.focus_score for s in sessions) / len(sessions), 2))
                attention_scores.append(round(sum(s.attention_score for s in sessions) / len(sessions), 2))
            else:
                focus_scores.append(0.0)
                attention_scores.append(0.0)

            # Emotion breakdown for this day
            logs = db.query(EmotionLog.emotion, func.count(EmotionLog.emotion)).filter(
                EmotionLog.user_id == user_id,
                func.date(EmotionLog.timestamp) == d
            ).group_by(EmotionLog.emotion).all()

            day_emotions = {e[0]: e[1] for e in logs}
            emotions_breakdown.append(day_emotions)

        return {
            "labels": labels,
            "focus_scores": focus_scores,
            "attention_scores": attention_scores,
            "emotions_breakdown": emotions_breakdown,
        }

    def get_monthly_trends(self, user_id: int, db: Session) -> Dict:
        """Get 30-day focus and emotion trends."""
        today = datetime.utcnow().date()
        days = [today - timedelta(days=i) for i in range(29, -1, -1)]

        labels = []
        focus_scores = []

        for d in days:
            labels.append(d.strftime("%d %b"))
            sessions = db.query(SessionModel).filter(
                SessionModel.user_id == user_id,
                func.date(SessionModel.start_time) == d,
                SessionModel.status == "completed"
            ).all()

            if sessions:
                focus_scores.append(round(sum(s.focus_score for s in sessions) / len(sessions), 2))
            else:
                focus_scores.append(0.0)

        return {
            "labels": labels,
            "focus_scores": focus_scores,
        }

    def get_calendar_trends(self, user_id: int, year: int, month: int, db: Session) -> List[Dict]:
        """Get calendar grid data containing daily focus summaries for a given month."""
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)

        # Query all sessions in this month
        sessions = db.query(SessionModel).filter(
            SessionModel.user_id == user_id,
            SessionModel.start_time >= start_date,
            SessionModel.start_time < end_date,
            SessionModel.status == "completed"
        ).all()

        # Group sessions by date string (YYYY-MM-DD)
        daily_data = {}
        for s in sessions:
            date_str = s.start_time.date().isoformat()
            if date_str not in daily_data:
                daily_data[date_str] = {
                    "focus_sum": 0.0,
                    "attention_sum": 0.0,
                    "count": 0,
                    "duration": 0,
                }
            daily_data[date_str]["focus_sum"] += s.focus_score
            daily_data[date_str]["attention_sum"] += s.attention_score
            daily_data[date_str]["count"] += 1
            daily_data[date_str]["duration"] += s.duration

        # Fetch daily emotions
        emotion_logs = db.query(EmotionLog).filter(
            EmotionLog.user_id == user_id,
            EmotionLog.timestamp >= start_date,
            EmotionLog.timestamp < end_date
        ).all()

        daily_emotions = {}
        for log in emotion_logs:
            date_str = log.timestamp.date().isoformat()
            if date_str not in daily_emotions:
                daily_emotions[date_str] = {}
            daily_emotions[date_str][log.emotion] = daily_emotions[date_str].get(log.emotion, 0) + 1

        # Format calendar response
        calendar_grid = []
        current = start_date
        while current < end_date:
            date_str = current.date().isoformat()
            day_summary = {
                "date": date_str,
                "has_data": False,
                "focus_score": 0.0,
                "attention_score": 0.0,
                "duration": 0,
                "dominant_emotion": "none"
            }

            if date_str in daily_data:
                stats = daily_data[date_str]
                day_summary["has_data"] = True
                day_summary["focus_score"] = round(stats["focus_sum"] / stats["count"], 2)
                day_summary["attention_score"] = round(stats["attention_sum"] / stats["count"], 2)
                day_summary["duration"] = stats["duration"]

            if date_str in daily_emotions:
                counts = daily_emotions[date_str]
                if counts:
                    day_summary["dominant_emotion"] = max(counts, key=counts.get)

            calendar_grid.append(day_summary)
            current += timedelta(days=1)

        return calendar_grid

    def _calculate_user_streak(self, user_id: int, db: Session) -> int:
        """Calculate consecutive active days starting from today/yesterday."""
        sessions = db.query(func.date(SessionModel.start_time)).filter(
            SessionModel.user_id == user_id,
            SessionModel.status == "completed"
        ).distinct().order_by(func.date(SessionModel.start_time).desc()).all()

        if not sessions:
            return 0

        active_dates = {s[0] for s in sessions}
        today = datetime.utcnow().date()
        yesterday = today - timedelta(days=1)

        if today not in active_dates and yesterday not in active_dates:
            return 0

        streak = 0
        check_date = today if today in active_dates else yesterday

        while check_date in active_dates:
            streak += 1
            check_date -= timedelta(days=1)

        return streak
