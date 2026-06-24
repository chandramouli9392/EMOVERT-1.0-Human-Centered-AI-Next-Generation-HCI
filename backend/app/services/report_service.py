"""EMOVERT Report Generation Service

Compiles weekly and monthly reports summarizing focus scores,
drowsiness/distraction occurrences, and emotional trends.
Returns report data as downloadable HTML or JSON byte streams.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.session import Session as SessionModel
from app.models.emotion import EmotionLog
from app.models.user import User

logger = logging.getLogger(__name__)


class ReportService:
    """Generates downloadable summaries of wellness logs for printing or export."""

    def __init__(self):
        pass

    def generate_weekly_report(self, user_id: int, db: Session) -> bytes:
        """Generate weekly wellness report in HTML format."""
        today = datetime.utcnow()
        start_date = today - timedelta(days=7)
        return self._build_html_report(user_id, start_date, today, "Weekly", db)

    def generate_monthly_report(self, user_id: int, db: Session) -> bytes:
        """Generate monthly wellness report in HTML format."""
        today = datetime.utcnow()
        start_date = today - timedelta(days=30)
        return self._build_html_report(user_id, start_date, today, "Monthly", db)

    def share_report(self, user_id: int, report_id: str, db: Session) -> Dict:
        """Mock sharing a report with a third party (e.g. employer, counselor)."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"status": "error", "message": "User not found"}

        logger.info(f"User {user.email} shared report {report_id}")
        return {
            "status": "success",
            "message": f"Report {report_id} has been successfully shared via link.",
            "share_url": f"https://emovert.com/shared/report/{report_id}"
        }

    def _build_html_report(self, user_id: int, start_date: datetime, end_date: datetime, title: str, db: Session) -> bytes:
        """Compile session statistics into a printable HTML report."""
        user = db.query(User).filter(User.id == user_id).first()
        username = user.name if user else "Valued User"

        # Fetch sessions
        sessions = db.query(SessionModel).filter(
            SessionModel.user_id == user_id,
            SessionModel.start_time >= start_date,
            SessionModel.start_time <= end_date,
            SessionModel.status == "completed"
        ).all()

        total_sessions = len(sessions)
        total_duration = sum(s.duration for s in sessions)
        total_hours = round(total_duration / 3600.0, 1)

        # Average stats
        avg_focus = sum(s.focus_score for s in sessions) / total_sessions if total_sessions > 0 else 0.0
        avg_attention = sum(s.attention_score for s in sessions) / total_sessions if total_sessions > 0 else 0.0
        total_drowsy = sum(s.drowsiness_events for s in sessions) if total_sessions > 0 else 0
        total_distract = sum(s.distraction_events for s in sessions) if total_sessions > 0 else 0

        # Emotion stats
        logs = db.query(EmotionLog.emotion, func.count(EmotionLog.emotion)).filter(
            EmotionLog.user_id == user_id,
            EmotionLog.timestamp >= start_date,
            EmotionLog.timestamp <= end_date
        ).group_by(EmotionLog.emotion).all()

        emotion_distribution = ""
        if logs:
            total_logs = sum(l[1] for l in logs)
            for emotion, count in logs:
                percentage = round((count / total_logs) * 100, 1)
                emotion_distribution += f"<li><strong>{emotion.capitalize()}:</strong> {percentage}% ({count} logs)</li>"
        else:
            emotion_distribution = "<li>No emotion logs recorded in this period.</li>"

        # HTML template
        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>EMOVERT {title} Report - {username}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            color: #333;
            background-color: #fafafa;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }}
        h1 {{
            color: #4F46E5;
            border-bottom: 2px solid #E5E7EB;
            padding-bottom: 15px;
            margin-top: 0;
        }}
        .meta {{
            margin-bottom: 30px;
            color: #6B7280;
            font-size: 0.9em;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }}
        .card {{
            background: #F9FAFB;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #4F46E5;
        }}
        .card h3 {{
            margin-top: 0;
            color: #374151;
            font-size: 1.1em;
        }}
        .card .value {{
            font-size: 2em;
            font-weight: bold;
            color: #111827;
            margin: 10px 0;
        }}
        .card .sub {{
            font-size: 0.85em;
            color: #6B7280;
        }}
        .section {{
            margin-bottom: 30px;
        }}
        .section h2 {{
            color: #1F2937;
            font-size: 1.3em;
            border-bottom: 1px solid #F3F4F6;
            padding-bottom: 8px;
        }}
        ul {{
            padding-left: 20px;
            line-height: 1.6;
        }}
        .footer {{
            text-align: center;
            margin-top: 50px;
            font-size: 0.8em;
            color: #9CA3AF;
            border-top: 1px solid #E5E7EB;
            padding-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>EMOVERT Cognitive Performance & Wellness Report</h1>
        <div class="meta">
            <strong>User:</strong> {username}<br>
            <strong>Period:</strong> {title} ({start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')})<br>
            <strong>Generated At:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}
        </div>

        <div class="grid">
            <div class="card">
                <h3>Sessions Completed</h3>
                <div class="value">{total_sessions}</div>
                <div class="sub">Total Focus Duration: {total_hours} Hours</div>
            </div>
            <div class="card">
                <h3>Average Focus Score</h3>
                <div class="value">{round(avg_focus, 1)}%</div>
                <div class="sub">Attention lock average: {round(avg_attention, 1)}%</div>
            </div>
            <div class="card">
                <h3>Drowsiness Alerts</h3>
                <div class="value">{total_drowsy}</div>
                <div class="sub">Fatigue-induced closures flagged</div>
            </div>
            <div class="card">
                <h3>Distraction Indicators</h3>
                <div class="value">{total_distract}</div>
                <div class="sub">Out of bounds gaze actions detected</div>
            </div>
        </div>

        <div class="section">
            <h2>Emotional Log Distribution</h2>
            <ul>
                {emotion_distribution}
            </ul>
        </div>

        <div class="section">
            <h2>Coaching Observations</h2>
            <p>
                During this period, your average focus rating was <strong>{round(avg_focus, 1)}%</strong>. 
                { "Your scores show exceptional stability!" if avg_focus >= 80 else "There is room to improve focus consistency by introducing scheduled rest." }
                { " We recommend monitoring fatigue triggers as drowsiness levels are elevated." if total_drowsy > 5 else " You kept your fatigue spikes low - excellent work." }
            </p>
        </div>

        <div class="footer">
            Generated by EMOVERT - AI Platform for Emotional and Cognitive Well-being. All rights reserved.
        </div>
    </div>
</body>
</html>
"""
        return html_content.encode("utf-8")
