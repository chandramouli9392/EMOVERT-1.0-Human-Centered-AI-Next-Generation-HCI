"""EMOVERT AI Coaching & Wellness Insights Service

Analyzes user performance patterns and triggers coaching insights.
Generates daily/weekly summaries and feedback.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.session import Session as SessionModel
from app.models.emotion import EmotionLog
from app.models.user import User
from app.services.recommendation_service import RecommendationEngine

logger = logging.getLogger(__name__)


class CoachService:
    """Generates personalized AI coaching insights and progress reports."""

    def __init__(self):
        self._rec_engine = RecommendationEngine()

    def get_daily_report(self, user_id: int, db: Session) -> Dict:
        """Generate a coaching report for today."""
        today = datetime.utcnow().date()
        sessions = db.query(SessionModel).filter(
            SessionModel.user_id == user_id,
            func.date(SessionModel.start_time) == today,
            SessionModel.status == "completed"
        ).all()

        if not sessions:
            return {
                "date": today.isoformat(),
                "has_data": False,
                "summary": "No sessions logged today yet. Start a session to receive your daily coaching insights!",
                "metrics": {
                    "focus_score": 0.0,
                    "attention_score": 0.0,
                    "active_duration": 0,
                    "drowsiness_alerts": 0,
                },
                "insights": ["Complete your first focus session today to get personalized recommendations."],
                "recommendations": []
            }

        # Calculate metrics
        avg_focus = sum(s.focus_score for s in sessions) / len(sessions)
        avg_attention = sum(s.attention_score for s in sessions) / len(sessions)
        total_duration = sum(s.duration for s in sessions)
        total_drowsy = sum(s.drowsiness_events for s in sessions)

        # Get dominant emotion for today
        emotions = db.query(EmotionLog.emotion, func.count(EmotionLog.emotion)).filter(
            EmotionLog.user_id == user_id,
            func.date(EmotionLog.timestamp) == today
        ).group_by(EmotionLog.emotion).all()

        dominant_emotion = "neutral"
        if emotions:
            dominant_emotion = max(emotions, key=lambda x: x[1])[0]

        # Get recommendations based on dominant emotion
        recs = self._rec_engine.get_recommendations(dominant_emotion)

        # Generate coaching summary text based on performance
        if avg_focus >= 85:
            summary = "Outstanding performance today! Your focus levels were highly sustained. You managed to keep distractions minimal."
        elif avg_focus >= 70:
            summary = "Great work! You maintained a solid focus profile. Incorporating minor breaks could help you reach peak productivity."
        else:
            summary = "Today was a struggle for focus. We detected higher levels of distraction and/or fatigue. Review your workspace and hydration."

        # Insights list
        insights = []
        if total_drowsy > 2:
            insights.append("Fatigue levels spiked today. Make sure to step away and prioritize deep rest.")
        if avg_attention < avg_focus * 0.9:
            insights.append("Your eyes drifted away frequently. Consider minimizing tab switching or phone notifications.")
        if dominant_emotion in ["stress", "anxiety", "angry"]:
            insights.append(f"We noted higher presence of {dominant_emotion}. Taking a 2-minute breathing break before sessions is highly recommended.")
        else:
            insights.append("Your emotional state was supportive of focused cognitive tasks today.")

        return {
            "date": today.isoformat(),
            "has_data": True,
            "summary": summary,
            "metrics": {
                "focus_score": round(avg_focus, 2),
                "attention_score": round(avg_attention, 2),
                "active_duration": total_duration,
                "drowsiness_alerts": total_drowsy,
                "dominant_emotion": dominant_emotion,
            },
            "insights": insights,
            "recommendations": {
                "foods": recs["foods"][:2],
                "yoga": recs["yoga"][:1],
                "exercises": recs["exercises"][:1],
                "activities": recs["activities"][:2]
            }
        }

    def get_weekly_report(self, user_id: int, db: Session) -> Dict:
        """Generate a coaching report for the past 7 days."""
        today = datetime.utcnow().date()
        one_week_ago = today - timedelta(days=7)

        sessions = db.query(SessionModel).filter(
            SessionModel.user_id == user_id,
            func.date(SessionModel.start_time) >= one_week_ago,
            SessionModel.status == "completed"
        ).all()

        if not sessions:
            return {
                "has_data": False,
                "summary": "No sessions logged in the last 7 days. Log sessions consistently to receive weekly performance analysis."
            }

        avg_focus = sum(s.focus_score for s in sessions) / len(sessions)
        avg_attention = sum(s.attention_score for s in sessions) / len(sessions)
        total_sessions = len(sessions)
        total_duration = sum(s.duration for s in sessions)

        # Strengths & Weaknesses analysis
        strengths = []
        improvements = []

        if avg_focus >= 78:
            strengths.append("High cognitive endurance and focus capacity.")
        else:
            improvements.append("Need to improve overall focus consistency.")

        # Drowsiness count
        drowsy_sessions = sum(1 for s in sessions if s.drowsiness_events > 0)
        if drowsy_sessions > total_sessions * 0.4:
            improvements.append("Fatigue often interrupts your sessions. Look into sleep scheduling.")
        else:
            strengths.append("Good physical energy management and low fatigue indicators.")

        # Distraction count
        distract_sessions = sum(1 for s in sessions if s.distraction_events > 2)
        if distract_sessions > total_sessions * 0.4:
            improvements.append("Visual distractions are common. Try setting up a clutter-free study/work zone.")
        else:
            strengths.append("Exceptional attention locking, minimal gaze drift.")

        # Core coaching tip
        if improvements:
            action_plan = f"Focus on this action point this week: {improvements[0]}"
        else:
            action_plan = "Keep doing what you are doing! Maintain your routine to consolidate your focus habits."

        return {
            "has_data": True,
            "period": f"{one_week_ago.strftime('%d %b')} - {today.strftime('%d %b')}",
            "metrics": {
                "average_focus": round(avg_focus, 2),
                "average_attention": round(avg_attention, 2),
                "total_sessions": total_sessions,
                "total_hours": round(total_duration / 3600.0, 1),
            },
            "strengths": strengths,
            "improvements": improvements,
            "action_plan": action_plan
        }

    def get_insights(self, user_id: int, db: Session) -> List[Dict]:
        """Fetch a list of structured insights for the user profile."""
        sessions = db.query(SessionModel).filter(
            SessionModel.user_id == user_id,
            SessionModel.status == "completed"
        ).order_by(SessionModel.start_time.desc()).limit(20).all()

        if not sessions:
            return []

        insights = []

        # Insight 1: Focus pattern
        avg_focus = sum(s.focus_score for s in sessions) / len(sessions)
        if avg_focus >= 80:
            insights.append({
                "type": "positive",
                "title": "Elite Concentration",
                "message": f"Your average focus is a stellar {round(avg_focus, 1)}%! This is in the top 10% of users.",
                "icon": "⚡"
            })
        else:
            insights.append({
                "type": "info",
                "title": "Building Focus Muscles",
                "message": "Focus is a habit. Doing shorter 20-minute sessions can help you avoid rapid fatigue.",
                "icon": "🌱"
            })

        # Insight 2: Distraction triggers
        high_distraction = sum(1 for s in sessions if s.distraction_events > 3)
        if high_distraction > len(sessions) * 0.3:
            insights.append({
                "type": "warning",
                "title": "Distraction Zones Detected",
                "message": "We detected frequent gaze deviations in several sessions. Try a full-screen focus block.",
                "icon": "👁️"
            })

        # Insight 3: Emotion-focus link (Mock/Heuristic based on logs)
        stress_logs = db.query(EmotionLog).filter(
            EmotionLog.user_id == user_id,
            EmotionLog.emotion == "stress"
        ).count()

        if stress_logs > 10:
            insights.append({
                "type": "info",
                "title": "Stress & Focus Link",
                "message": "We noticed focus levels drop during stressful moments. Practice deep breathing before logging in.",
                "icon": "🧘"
            })

        return insights
